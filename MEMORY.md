# 长期记忆

## 用户偏好
- **语言偏好**: 中文输出
- **模型**: minimax/MiniMax-M2.7
- **节约模式**: 减少不必要的请求

## 飞书配置
- **App ID**: cli_a949f94b0ffa9bc2
- **飞书链接域**: wcnjaznqdu9b.feishu.cn
- **认证状态**: 用户已登录授权 (有效期至 2026-04-07)

## lark-cli 安装配置
### 安装位置
- 主程序: `C:\Users\liziy\AppData\Roaming\npm\lark-cli.exe`
- Skills: `C:\Users\liziy\.agents\skills\lark-*`

### lark-cli 常用命令
```bash
# 读取表格数据
lark-cli sheets +read --spreadsheet-token <token> --sheet-id <sheet-id> --range <range>

# 写入表格数据（用.bat批处理文件执行）
lark-cli sheets +write --spreadsheet-token <token> --sheet-id <sheet-id> --range <range> --values <json>
```

### 写入数据方法
由于命令行转义问题，必须使用.bat批处理文件：
```batch
@echo off
lark-cli sheets +write --spreadsheet-token <token> --sheet-id <sheet-id> --range "<range>" --values "<json>"
```

---

## 三个小红书广告任务 — 飞书表格对应关系（重要！）

### ① 李文萱交通
| 项目 | 值 |
|------|-----|
| Wiki | https://xayub55x0kw.feishu.cn/wiki/DuyywOXW5iPUAbk2JWOcKq1RnSe?sheet=nfuwzz |
| Spreadsheet Token | `DuyywOXW5iPUAbk2JWOcKq1RnSe` |
| Sheet ID | `nfuwzz` |
| 账号入口 | https://ad.xiaohongshu.com/（直接登录，无需跳转） |
| 子账户 | 无需搜索，直接是交通账号 |
| vSellerId | （从URL直接读取） |

### ② 李文萱大阪
| 项目 | 值 |
|------|-----|
| Wiki | https://xayub55x0kw.feishu.cn/wiki/B63SwbWKCiILFzkhR5fcBdtDnTh?sheet=vrYnBm |
| Spreadsheet Token | `S0srseEAXhIfANt26ztcaKb1nLg` |
| Sheet ID | `vrYnBm` |
| 账号入口 | https://partner.xiaohongshu.com/（需跳转聚光平台） |
| 子账户搜索词 | "INNN大阪机场接送" |
| 子账户选项 | YX--INNN大阪机场接送 |
| vSellerId | `685918cfbc08dd00153675b3` |

### ③ 李文萱包易
| 项目 | 值 |
|------|-----|
| Wiki | https://xayub55x0kw.feishu.cn/wiki/V2MDwr8Rki9DLGkLoRlc7Kpwnlc |
| Spreadsheet Token | `M4Spsd0CGh0hh5tyae4cXdhWnRb` |
| Sheet ID（基础报表写入） | `JLrqHb`（「26年4月」子表） |
| Sheet ID（笔记报表覆盖） | `KlQEFs`（「2026笔记投放数据」子表） |
| 账号入口 | https://partner.xiaohongshu.com/（需跳转聚光平台） |
| 子账户搜索词 | "包易二奢入门陪跑" |
| 子账户选项 | YX-包易二奢入门陪跑 |
| vSellerId | **待确认：需从跳转后的URL获取** |

---

## 重要教训

### 1. Spreadsheet Token 不能混淆！
- `S0srseEAXhIfANt26ztcaKb1nLg` = 大阪表（正确）
- `OrXrsyBHAh4BJrtMQEEcjuhfnmd` = **废弃/错误的token**，曾导致大阪表数据混入交通数据
- 每次写入前必须确认：当前任务的 token 是否与目标表格对应

### 2. 跳转聚光平台后必须验证 vSellerId
大阪/包易从 partner 点「跳转→聚光平台」后，新标签页的 vSellerId 可能没有切换。
验证步骤：
1. 跳转后立即读取 URL 中的 `vSellerId`
2. 与预期值比对（大阪=685918cfbc08dd00153675b3）
3. 不匹配则找到账户下拉菜单切换账号，或直接停止任务

### 3. 日期格式
- Excel日期：46113=4月1日，46114=4月2日，46115=4月3日
- A列日期必须带.1后缀（如 46115.1）
- 行号 = Excel日期 - 46111（如 46115 → 第4行）

### 4. 点击率格式
- 平台显示5.37% → 写入用 0.0537（÷100）

### 5. lark-cli 安装问题
原始npm安装会从GitHub下载二进制文件，中国网络可能超时。需要手动下载zip文件解压安装。

---

## Agent工程化学习笔记
- **Harness架构**：Agent的Body（工具+记忆+编排）比Brain（模型）更重要
- **Context管理**：稀缺资源，越干净越好，不是越大越好
- **记忆是索引，不是存储**：能从代码库推导的信息不要存储

---
*最后更新: 2026-04-04*
