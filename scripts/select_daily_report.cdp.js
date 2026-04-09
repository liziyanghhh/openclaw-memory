/**
 * 小红书基础报表 → 选择「日报」视图
 * 固化第4步操作
 *
 * 使用: node select_daily_report.cdp.js
 * 依赖: Node.js 内置 WebSocket + http（无需 npm install）
 *
 * CDP 地址: http://127.0.0.1:18800 (OpenClaw 固定端口)
 */

const http = require('http');

function cdpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 0;
    this.pending = [];
  }

  async connect() {
    const { WebSocket } = await import('ws').catch(() => ({ WebSocket: globalThis.WebSocket }));
    this.ws = new WebSocket(this.wsUrl);
    return new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve);
      this.ws.addEventListener('error', reject);
      this.ws.addEventListener('message', (evt) => this._handle(evt.data));
    });
  }

  _handle(data) {
    const msg = JSON.parse(data);
    if (msg.id && this.pending[msg.id]) {
      this.pending[msg.id](msg);
      this.pending.splice(msg.id, 1);
    }
  }

  async send(method, params = {}) {
    const id = ++this.msgId;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending[id] = resolve;
      setTimeout(() => {
        if (this.pending[id]) { delete this.pending[id]; reject(new Error(`CDP timeout: ${method}`)); }
      }, 15000);
    });
  }

  async eval(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true });
    return r.result.result.value;
  }

  async dispatchMouse(type, x, y, button = 'none', clickCount = 0) {
    return this.send('Input.dispatchMouseEvent', { type, x, y, button, clickCount });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const CDP_HTTP = 'http://127.0.0.1:18800';

  console.log('[1/5] 连接 CDP...');
  const pages = await cdpGet(`${CDP_HTTP}/json`);
  // 优先找小红书数据报表页面
  const target = pages.find(p => p.url.match(/datareports|xiaohongshu/)) || pages[0];
  if (!target) { console.error('❌ 未找到目标页面'); process.exit(1); }
  console.log('    目标:', target.url);

  const cdp = new CdpClient(target.webSocketDebuggerUrl);
  await cdp.connect();
  console.log('    已连接 WebSocket');

  try {
    // ── 步骤 1: 定位「细分模式」行右侧的 3-lines 图标按钮 ──
    console.log('[2/5] 定位 3-lines 图标按钮...');
    const btnData = await cdp.eval(`
      (() => {
        const subMode = Array.from(document.querySelectorAll('.d-text'))
          .find(el => el.innerText === '细分模式');
        if (!subMode) return { found: false, reason: '细分模式 not found' };
        const select = subMode.closest('.d-select');
        if (!select) return { found: false, reason: 'no select parent' };
        const wrapper = select.parentElement;
        if (!wrapper) return { found: false, reason: 'no wrapper' };
        const row = wrapper.parentElement;
        if (!row) return { found: false, reason: 'no row' };
        const parent = row.parentElement;
        if (!parent) return { found: false, reason: 'no parent' };
        const btns = Array.from(parent.children)
          .filter(c => c.classList.contains('d-button') && c.getBoundingClientRect().width === 32);
        return {
          found: true,
          buttons: btns.map(b => ({
            x: Math.round(b.getBoundingClientRect().x),
            y: Math.round(b.getBoundingClientRect().y),
            w: Math.round(b.getBoundingClientRect().width),
            h: Math.round(b.getBoundingClientRect().height)
          }))
        };
      })()
    `);

    if (!btnData.found) {
      console.error('❌ 找不到「细分模式」行:', btnData.reason);
      process.exit(1);
    }

    console.log(`    找到 ${btnData.buttons.length} 个 32x32 按钮`);
    for (const b of btnData.buttons) {
      console.log(`      按钮 @(${b.x}, ${b.y}) ${b.w}x${b.h}`);
    }

    // 取最右边的按钮（x 最大）= 3-lines 图标
    const targetBtn = btnData.buttons.reduce((a, b) => a.x > b.x ? a : b);
    const tx = targetBtn.x + 16;
    const ty = targetBtn.y + 16;
    console.log(`    → 3-lines 图标中心: (${tx}, ${ty})`);

    // ── 步骤 2: 滚动到按钮可见区域 ──
    console.log('[3/5] 滚动到按钮可见区域...');
    await cdp.eval(`
      (() => {
        const subMode = Array.from(document.querySelectorAll('.d-text'))
          .find(el => el.innerText === '细分模式');
        const select = subMode?.closest('.d-select');
        const wrapper = select?.parentElement;
        const row = wrapper?.parentElement;
        const parent = row?.parentElement;
        if (!parent) return null;
        const btns = Array.from(parent.children)
          .filter(c => c.classList.contains('d-button') && c.getBoundingClientRect().width === 32);
        const btn = btns.reduce((a, b) => a.getBoundingClientRect().x > b.getBoundingClientRect().x ? a : b);
        if (!btn) return null;
        btn.scrollIntoViewIfNeeded();
        return {
          x: Math.round(btn.getBoundingClientRect().x),
          y: Math.round(btn.getBoundingClientRect().y),
          w: Math.round(btn.getBoundingClientRect().width),
          h: Math.round(btn.getBoundingClientRect().height),
          dpr: window.devicePixelRatio || 1
        };
      })()
    `);
    await sleep(300);

    // ── 步骤 3: 触发 hover（在正确坐标发送 CDP mouseMoved）──
    // 使用 DOM.getBoxModel 获取元素的绝对物理坐标
    const boxModel = await cdp.send('DOM.getBoxModel', {
      where: { selector: '.d-button', type: 'last' }
    }).catch(() => null);

    const btnInfo = await cdp.eval(`
      (() => {
        const subMode = Array.from(document.querySelectorAll('.d-text'))
          .find(el => el.innerText === '细分模式');
        const select = subMode?.closest('.d-select');
        const wrapper = select?.parentElement;
        const row = wrapper?.parentElement;
        const parent = row?.parentElement;
        if (!parent) return null;
        const btns = Array.from(parent.children)
          .filter(c => c.classList.contains('d-button') && c.getBoundingClientRect().width === 32);
        const btn = btns.reduce((a, b) => a.getBoundingClientRect().x > b.getBoundingClientRect().x ? a : b);
        if (!btn) return null;
        btn.scrollIntoViewIfNeeded();
        const r = btn.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h), dpr: window.devicePixelRatio || 1 };
      })()
    `);

    if (!btnInfo) {
      console.error('❌ 无法定位按钮');
      process.exit(1);
    }

    const { x, y, w, h, dpr } = btnInfo;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const physX = Math.round(cx * dpr);
    const physY = Math.round(cy * dpr);
    console.log(`    CSS: (${cx}, ${cy}), 物理: (${physX}, ${physY}), DPR: ${dpr}`);

    // 先确保鼠标在按钮上方（mouseover/enter）
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: physX, y: physY, button: 'none', clickCount: 0 });
    await sleep(3500);
    console.log('    CDP hover 等待 3.5 秒完成');

    // ── 步骤 3: 查找弹出列表中的「日报」选项 ──
    console.log('[4/5] 检查弹出的 popup...');
    const popups = await cdp.eval(`
      (() => {
        const drops = document.querySelectorAll('[class*="popup"], [class*="dropdown"], [class*="option"]');
        return Array.from(drops).filter(el => {
          const s = window.getComputedStyle(el);
          return el.offsetParent !== null && s.display !== 'none' && s.visibility !== 'hidden';
        }).map(el => ({
          text: el.innerText.substring(0, 150),
          cls: el.className.substring(0, 60)
        }));
      })()
    `);

    console.log(`    找到 ${popups.length} 个可见 popup`);
    for (const p of popups) {
      console.log(`    - [${p.cls}] ${p.text.substring(0, 100)}`);
    }

    const dailyPopup = popups.find(p => p.text.includes('日报'));
    if (!dailyPopup) {
      console.error('❌ 未在 popup 中找到「日报」选项');
      process.exit(1);
    }
    console.log('    找到「日报」选项');

    // ── 步骤 4: 点击「日报」──
    console.log('[5/5] 点击「日报」...');
    const clicked = await cdp.eval(`
      (() => {
        const drops = document.querySelectorAll('[class*="popup"], [class*="dropdown"], [class*="option"]');
        for (const popup of drops) {
          const s = window.getComputedStyle(popup);
          if (popup.offsetParent === null || s.display === 'none' || s.visibility === 'hidden') continue;
          const els = popup.querySelectorAll('div, span, li, a');
          for (const el of els) {
            if (el.innerText.trim() === '日报') {
              el.click();
              return true;
            }
          }
        }
        return false;
      })()
    `);

    if (!clicked) {
      console.error('❌ 无法点击「日报」');
      process.exit(1);
    }

    console.log('    已点击，等待 3 秒切换视图...');
    await sleep(3000);

    // ── 步骤 5: 验证合计行 ──
    const heji = await cdp.eval(`
      (() => {
        const rows = document.querySelectorAll('table tr');
        const h = Array.from(rows).find(r => r.innerText.trim().startsWith('合计'));
        return h ? h.innerText.trim().substring(0, 250) : null;
      })()
    `);

    if (heji) {
      console.log('✅ 日报视图激活！合计行:', heji);
    } else {
      console.log('⚠️ 未找到合计行，请人工确认页面状态');
    }

  } finally {
    cdp.close();
  }

  console.log('脚本执行完毕。');
}

main().catch(err => {
  console.error('❌ 错误:', err.message);
  process.exit(1);
});
