/**
 * 小红书基础报表 → 选择「日报」视图
 * Playwright 直连 OpenClaw CDP 版本
 *
 * 使用: node select_daily_report.pw.js
 */

const { chromium } = require('C:/Users/liziy/AppData/Roaming/npm/node_modules/openclaw/node_modules/playwright-core');

const CDP_HTTP = 'http://127.0.0.1:18800';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('[1/5] 连接浏览器 CDP...');
  const resp = await fetch(`${CDP_HTTP}/json`);
  const pages = await resp.json();
  const pageInfo = pages.find(p => p.url.match(/datareports|xiaohongshu/)) || pages[0];
  if (!pageInfo) { console.error('❌ 未找到页面'); process.exit(1); }
  console.log('    页面:', pageInfo.url);

  const browser = await chromium.connectOverCDP(pageInfo.webSocketDebuggerUrl);
  const ctx = browser.contexts()[0];
  const pageList = ctx.pages();
  console.log('    页面数量:', pageList.length);
  const page = pageList[0];
  console.log('    已连接页面 URL:', page.url());

  try {
    // ── 步骤 1: 找「细分模式」右侧 3-lines 图标按钮 ──
    console.log('[2/5] 定位 3-lines 图标按钮...');
    const btns = await page.evaluate(() => {
      const subMode = Array.from(document.querySelectorAll('.d-text'))
        .find(el => el.innerText === '细分模式');
      if (!subMode) return null;
      const select = subMode.closest('.d-select');
      if (!select) return null;
      const wrapper = select.parentElement;
      if (!wrapper) return null;
      const row = wrapper.parentElement;
      if (!row) return null;
      const parent = row.parentElement;
      if (!parent) return null;
      const b32 = Array.from(parent.children)
        .filter(c => c.classList.contains('d-button') && c.getBoundingClientRect().width === 32);
      return b32.map(b => {
        const r = b.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), cx: Math.round(r.x + r.width/2), cy: Math.round(r.y + r.height/2) };
      });
    });

    if (!btns || btns.length === 0) { console.error('❌ 未找到 32x32 按钮'); process.exit(1); }
    console.log(`    找到 ${btns.length} 个按钮:`);
    for (const b of btns) console.log(`      @(${b.x}, ${b.y})`);

    // 取最右边（x 最大）
    const target = btns.reduce((a, b) => a.x > b.x ? a : b);
    console.log(`    → 3-lines 图标: CSS(${target.cx}, ${target.cy})`);

    // ── 步骤 2: Playwright hover 3.5 秒 ──
    console.log('[3/5] Playwright hover 3.5 秒...');
    await page.mouse.move(target.cx, target.cy);
    await sleep(3500);

    // ── 步骤 3: 检查 popup ──
    console.log('[3/5] 检查 popup...');
    const popups = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[class*="popup"], [class*="dropdown"]'))
        .filter(el => {
          const s = window.getComputedStyle(el);
          return el.offsetParent !== null && s.display !== 'none' && s.visibility !== 'hidden';
        })
        .map(el => ({ text: el.innerText.substring(0, 200), cls: el.className.substring(0, 60) }));
    });

    console.log(`    找到 ${popups.length} 个 popup`);
    for (const p of popups) console.log(`    - ${p.cls}: ${p.text.substring(0, 80)}`);

    const daily = popups.find(p => p.text.includes('日报'));
    if (!daily) { console.error('❌ 未找到「日报」选项'); process.exit(1); }

    // ── 步骤 4: 点击「日报」──
    console.log('[4/5] 点击「日报」...');
    const clicked = await page.evaluate(() => {
      const drops = document.querySelectorAll('[class*="popup"], [class*="dropdown"]');
      for (const popup of drops) {
        const s = window.getComputedStyle(popup);
        if (popup.offsetParent === null || s.display === 'none' || s.visibility === 'hidden') continue;
        const opts = popup.querySelectorAll('div, span, li');
        for (const o of opts) {
          if (o.innerText.trim() === '日报') { o.click(); return true; }
        }
      }
      return false;
    });

    if (!clicked) { console.error('❌ 点击失败'); process.exit(1); }
    console.log('    已点击，等待 3 秒...');
    await sleep(3000);

    // ── 验证 ──
    const heji = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tr');
      const h = Array.from(rows).find(r => r.innerText.trim().startsWith('合计'));
      return h ? h.innerText.trim().substring(0, 250) : null;
    });

    if (heji) {
      console.log('✅ 日报视图激活！合计行:', heji);
    } else {
      console.log('⚠️ 未找到合计行，请人工确认');
    }

  } finally {
    try { browser.disconnect(); } catch(e) { /* CDP connection cleanup */ }
  }

  console.log('脚本执行完毕。');
}

main().catch(err => {
  console.error('❌ 错误:', err.message);
  process.exit(1);
});
