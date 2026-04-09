# 长期记忆

## 用户偏好
- **语言偏好**: 中文输出
- **模型**: minimax/MiniMax-M2.7
- **节约模式**: 减少不必要的请求

## 飞书配置
- **App ID**: cli_a949f94b0ffa9bc2
- **飞书链接域**: wcnjaznqdu9b.feishu.cn
- **认证状态**: 用户已登录授权 (有效期至 2026-04-07)

## lark-cli 写入方法

lark-cli 在命令行直接执行时 JSON 转义会出错，必须用 PowerShell 脚本：

```powershell
$vals = Get-Content 'C:\Users\liziy\clawd\fix_row.json' -Raw
& 'C:\Users\liziy\AppData\Roaming\npm\lark-cli.exe' sheets +write --spreadsheet-token <token> --sheet-id <sheet-id> --range '<range>' --values $vals
```

---

## ⚠️ 最重要规则（深度三层记忆）

### 规则0：分日 ≠ 日报（绝对不能跳过）
- 日期筛选旁边的「分日」标签是**时间粒度设置**，不是日报视图
- 日期筛选显示"昨天"**不等于**已选择日报视图
- **必须**在选择日期后、读取合计行前，手动操作「细分模式」下拉选择「日报」
- 不选则数据明细为空或不正确，历史数据错误（4月7日）就是这个原因
- **每次执行任务都必须选日报**，无论数据是否看起来一致

### 规则1：A列绝对禁止修改
- 飞书表格A列（日期列）由飞书自动识别为日期格式，禁止任何写入操作
- 写入数据时 range 必须从 B 列开始，绝对不碰 A 列
- A列格式：纯数字（如 46116），不加 `.1` 后缀，不加引号
- 行号 = Excel日期 - 46111（如 46116 = 第5行）

### 规则2：只看主表合计行，忽略副表
平台基础报表页面有**两个表格**：

| 表格 | 位置 | 特征 | 处理方式 |
|------|------|------|---------|
| **主表合计行** | 上方，加粗行 | 含完整数据（留资数/留资成本等） | **只用这个** |
| **副表明细行** | 下方 | 显示「暂无内容」| **完全忽略** |

- 副表显示「暂无内容」**不代表合计行里这些字段也是0**
- 历史错误根源：看到副表为空就填0，实际合计行有数据

### 规则3：百分比格式
- 平台显示 "4.38%" → 写入用 "4.38"（常规数字，不写 0.0438）
- 留资转化率：保持原样或用公式 `=N/L`

### 规则4：vSellerId 验证
跳转聚光平台后新标签页的 vSellerId 可能没有切换，必须从 URL 验证。

### 规则5：写入前必须对照飞书表格表头（最核心规则）
- **以飞书表格为准，不以平台数据为准**
- 写入前必须用 lark-cli 读取飞书表格第1行（表头行）
- 对照表头字段名，确认哪些列实际存在
- 平台列数可能多于或少于飞书列数，必须一一对应写入
- 平台多出的列忽略不写，飞书有而平台没有的列留空
- 历史错误：平台有多少列就写多少列，不核对飞书表头，导致数据全部错位

---

## 三个小红书广告任务 — 飞书表格对应关系

### ① 李文萱交通
| 项目 | 值 |
|------|-----|
| 平台 | https://ad.xiaohongshu.com/（直接登录，无需跳转） |
| Spreadsheet Token | `DuyywOXW5iPUAbk2JWOcKq1RnSe` |
| Sheet ID | `nfuwzz` |
| 写入范围 | B→V（21列） |
| vSellerId | 从URL直接读取 |

### ② 李文萱大阪
| 项目 | 值 |
|------|-----|
| 平台 | https://partner.xiaohongshu.com/（需跳转聚光平台） |
| Spreadsheet Token | `S0srseEAXhIfANt26ztcaKb1nLg` |
| Sheet ID | `vrYnBm` |
| 写入范围 | B→T（19列） |
| vSellerId | `685918cfbc08dd00153675b3` |

### ③ 李文萱包易
| 项目 | 值 |
|------|-----|
| 平台 | https://partner.xiaohongshu.com/（需跳转聚光平台） |
| Spreadsheet Token | `M4Spsd0CGh0hh5tyae4cXdhWnRb` |
| Sheet ID（基础报表） | `JLrqHb`（「26年4月」子表） |
| Sheet ID（笔记报表） | `KlQEFs`（「2026笔记投放数据」子表） |
| 写入范围 | B→P（15列） |
| vSellerId | `6876255d8c7f5d0015870152` |

---

## 深度三层记忆：日报抓取核心操作（最关键！）

### 第一层：问题根因
- 历史数据错误（4月7日大阪/交通/包易数据不准确）是因为没有选择「日报」视图
- 浏览器有缓存，首次登录时平台默认已预选日报，导致误以为不需要操作
- 清除缓存或首次登录后，必须手动执行选日报这一步，否则合计行数据为空或不完整

### 第二层：操作位置（实测精确版，2026-04-09 更新）

**数据明细区域「细分模式」行结构（实测 DOM 路径）：**
```
「细分模式」行（y≈865）
  └─ 父容器（class: d-space d-space-horizontal d-space-align-center）
       ├─ 子元素①：细分模式下拉（x≈1048, 宽240px）  ← ❌ 点击无效
       ├─ 子元素②：32x32按钮（x=1320, y=220）      ← ❌ hover出自定义栏目popup
       └─ 子元素③：32x32按钮（x=1364, y=220）      ← ✅ 3-lines图标，hover出日报popup
```

**关键区别：**
- 3-lines图标在「细分模式」文字**右侧**，不在下拉框内
- 两个32x32按钮紧挨着排列在「细分模式」下拉右侧
- **x=1320按钮** hover → 自定义栏目 popup（包含 日报/复盘/自定义指标）
- **x=1364按钮** hover → **日报 popup**（正确目标）

**ref=e30** = 每次快照动态分配，不固定。必须通过 DOM 结构定位（见固化脚本）。

### 第三层：操作方法（必须严格遵守，实测版）
1. 滚动到「数据明细」区域（y≈865）
2. 找到「细分模式」所在行（x=1048~1396）
3. 定位该行**最右边**的 32x32 按钮（x=1364 附近）
4. **hover 该按钮中心 3.5秒**（不要 click！click 会触发错误面板）
5. popup 出现后在列表中点击「**日报**」
6. 等待页面切换，验证：日报 Tab 高亮 + 合计行出现

### 三个账号均适用
此步骤适用于交通、大阪、包易三个账号的基础报表操作，是通用步骤。

---

## 会话压缩管理（重要！）

每次重要操作后，将结果写入 `memory/YYYY-MM-DD.md` 并 git commit。触发条件：30轮对话/用户要求/任务完成后。

---

## 今日教训（2026-04-08）

### 会话上下文溢出问题
- 主会话运行太久会导致上下文溢出，历史被压缩消失
- 解决方案：定期压缩（写日记→git commit→开新会话），记忆存在文件里不丢失
- 已将压缩 SOP 写入 AGENTS.md

### 大阪副本表测试成功
- Token: `J3lNwCmYKiZ5Q9k8cNecl7x6npd`，Sheet: `vrYnBm`
- 4月7日数据已写入（消费1378.03/展现16576/点击579/CTR3.49%）
- revision: 2

### 重要教训（反复强调版）：日报步骤绝对不能跳过
- 4月8日再次犯错：明明知道要选日报，但执行时还是跳过了
- 用户已明确要求：playbook步骤顺序不变（日报在日期之后、合计之前），只需调用playbook执行
- 根源问题：有时候数据"看起来对"（和日报数据一致），就误以为不用选日报——这是错觉，单日数据可能恰好一致
- **执行时必须严格按照playbook步骤逐条执行，不能凭感觉跳过**

### 包易笔记报表（暂停）
- 笔记报表下载按钮问题未解决，暂时停用
- 待后续解决后恢复

---

## cron 任务状态
| 任务 | Cron ID | 执行时间 | sessionTarget |
|------|---------|---------|--------------|
| 交通 | `39fa853d-5dfc-47e3-bb63-b11a20f3d006` | 08:00 | main |
| 大阪 | `c393ea9a-348b-4b33-a0e2-2aaac741e759` | 08:05 | main |
| 包易 | `a44d26f6-51b0-430b-ace1-6587504d3f6d` | 08:10 | main |

> ⚠️ 使用 sessionTarget=main，每次触发后 main session 被唤醒执行，有完整记忆，不走 subagent

---

## 今日教训（2026-04-09）

### 第4步操作的重大修正

**之前错误原因：** 一直点击「细分模式」下拉本身（不响应），而非右侧的 3-lines 图标按钮。

**实测结论：**
- 「细分模式」下拉本身点击不弹出任何选项
- 必须找它**右侧紧挨着的**3-lines图标按钮（32x32，x=1364附近）
- 对准该按钮 hover 3.5秒 → popup出现 → 点「日报」

**浏览器自动化的坑：**
- OpenClaw browser tool 的 snapshot ref 每页刷新都会变，**不能依赖固定 ref**
- CDP `mouseMoved` 到坐标在 Vue 项目上不一定触发 hover 事件（Vue 有自己的事件系统）
- 实际可行的 hover 触发方式：**Playwright 的 `page.mouse.move()`**（原生 CDP Input 鼠标模拟）或 JS `element.click()`

### 固化脚本状态

**脚本路径（已提交 git）：**
- `C:\Users\liziy\clawd\scripts\select_daily_report.pw.js` — Playwright 版本（❌ CDP连接后pages()为空，待解决）
- `C:\Users\liziy\clawd\scripts\select_daily_report.cdp.js` — CDP 直连版本（❌ mouseMoved 不触发 Vue hover，待解决）

**playwright-core 路径：**
```
C:/Users/liziy/AppData/Roaming/npm/node_modules/openclaw/node_modules/playwright-core
```

**已验证可用的 CDP 连接（Node.js 24 内置 WebSocket）：**
```javascript
const ws = new WebSocket('ws://127.0.0.1:18800/devtools/page/xxx');
ws.addEventListener('open', () => { ... });
```

**下一步方向：**
- Playwright 版本：解决 `browser.contexts()[0].pages()` 返回空的问题（可能需要用 `browser.contexts()[0].newPage()` 创建新 page 再 navigate）
- CDP 直连版本：找到触发 Vue hover 的正确方法（尝试 `Runtime.callFunctionOn` 直接调用元素方法）

---
*最后更新: 2026-04-09*
