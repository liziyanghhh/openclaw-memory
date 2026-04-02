# 长期记忆

## 用户偏好
- **语言偏好**: 中文输出
- **模型**: minimax/MiniMax-M2.7
- **节约模式**: 减少不必要的请求

## 飞书配置
- **App ID**: cli_a949f94b0ffa9bc2
- **飞书链接域**: wcnjaznqdu9b.feishu.cn
- **认证状态**: 用户已登录授权 (有效期至 2026-04-07)

## lark-cli 安装配置（重要！）
### 安装位置
- 主程序: `C:\Users\liziy\AppData\Roaming\npm\lark-cli.exe`
- Skills: `C:\Users\liziy\.agents\skills\lark-*`

### lark-cli 常用命令
```bash
# 查看认证状态
lark-cli auth status

# 读取表格数据
lark-cli sheets +read --spreadsheet-token <token> --sheet-id <sheet-id>

# 写入表格数据
lark-cli sheets +write --spreadsheet-token <token> --sheet-id <sheet-id> --range "<range>" --values "<json>"

# 读取wiki节点信息
lark-cli wiki spaces get_node --params "{\"token\":\"<wiki_token>\"}"
```

### 写入数据方法（重要！）
由于命令行转义问题，使用批处理文件写入：
```batch
@echo off
lark-cli sheets +write --spreadsheet-token <token> --sheet-id <sheet-id> --range "<range>" --values "<json>"
```

## 重要文档
- **知识库表格 "3.29"**
  - Wiki链接: https://wcnjaznqdu9b.feishu.cn/wiki/COlywJDswiLqiTkfcywcOSWtn88
  - Sheet Token: GOjmsTOcFhDSa2totIIcrl0bn5f
  - Sheet ID: b12a4d
  - 包含列: 时间、消费、展现量、点击量等21列
  - 数据行: 第2行开始（第一行是表头）

### INNN交通出行（海外）协作表 副本
- **Wiki链接**: https://xayub55x0kw.feishu.cn/wiki/Rauaw47WMiX35jkKUPtcJyLwnfe
- **Sheet Token**: OrXrsyBHAh4BJrtMQEEcjuhfnmd
- **包含4个子表**: 3月、2月、1月、12月
- **字段架构（21列）**: 时间(A)、消费(B)、展现量(C)、点击量(D)、点击率(E)、平均点击成本(F)、平均千次展现费用(G)、点赞(H)、评论(I)、关注(J)、分享(K)、互动量(L)、平均互动成本(M)、私信进线数(N)、私信进线成本(O)、私信开口数(P)、私信开口成本(Q)、私信开口条数(R)、私信留资数(S)、私信留资成本(T)、多转化人数(U)

#### 子表信息
| 子表 | Sheet ID | 日期范围 |
|------|----------|---------|
| 3月 | Ylroom | 2026年3月1日~31日 |
| 2月 | ncgV9z | 2026年2月1日~28日 |
| 1月 | fEAIxr | 2026年1月1日~31日 |
| 12月 | 0b1504 | 2025年12月1日~31日 |

#### 重要教训：日期格式与表头识别
- **第一行是表头**，从第二行开始才是实际数据
- **时间列是Excel日期数字**，需要根据表头含义解读
- **日期推算规则**：
  - 46010 = 2025年12月1日
  - 46054 = 2026年2月1日
  - 46082 = 2026年3月1日
  - 46112 = 2026年3月31日
- **月份与日期的关系**：不能只看子表名称，要根据第一行数据中的日期数字来确认实际年月

## 今日操作记录

### 1. 删除3/25数据
- **操作**: 清空了第2行（46082.1 = 3/25）的所有数据
- **命令**: `write_row.bat` 写入21个空值到 A2:U2
- **结果**: ✅ 成功

### 2. 复制3/26数据到3/27
- **操作**: 读取第3行（46083.1 = 3/26）的数据，写入到第4行（46084.1 = 3/27）
- **命令**: `write_row.bat`
- **结果**: ✅ 成功

## 待解决任务
- 无

## 重要教训
1. **当飞书插件工具（如 feishu_wiki、feishu_doc）无法完成操作时，直接用 exec 调用 lark-cli**
2. 不要等用户来教，主动尝试调用 CLI 工具
3. **操作优先级**：飞书插件工具 → lark-cli → 其他方式

## 小红书广告数据 → 飞书表格 自动填写流程（重要！）

### 目标表格
- **飞书表格**：`INNN交通出行（海外）协作表 副本`
- Token: `OrXrsyBHAh4BJrtMQEEcjuhfnmd`
- Wiki链接: https://xayub55x0kw.feishu.cn/wiki/Rauaw47WMiX35jkKUPtcJyLwnfe
- Sheet名: `4月`
- Sheet ID: `JXJwuc`
- 数据范围：第2行起（A列=时间，其他列=指标）

### 表头对应（21列）
| 列 | 字段名 |
|----|--------|
| A | 时间 |
| B | 消费 |
| C | 展现量 |
| D | 点击量 |
| E | 点击率 |
| F | 平均点击成本 |
| G | 平均千次展现费用 |
| H | 点赞 |
| I | 评论 |
| J | 关注 |
| K | 分享 |
| L | 互动量 |
| M | 平均互动成本 |
| N | 私信进线数 |
| O | 私信进线成本 |
| P | 私信开口数 |
| Q | 私信开口成本 |
| R | 私信开口条数 |
| S | 私信留资数 |
| T | 私信留资成本 |
| U | 多转化人数（添加企微+私信咨询） |

### 操作流程
1. 打开浏览器访问 https://ad.xiaohongshu.com/
2. 登录账号：innntravel007@gmail.com，密码：aladdinA07
3. 点击顶部菜单"数据"
4. 在左侧选择"标准投" → "基础报表"
5. 在报表页面设置日期筛选（分日）
6. 找到顶部"数据明细"区域的"合计"行（加粗行），这是当日汇总数据
7. 读取各列数值

### 日期格式
- 飞书表格A列使用Excel日期数字（如46113=4月1日）
- 小红书平台使用"YYYY-MM-DD"格式

### 写入命令
使用.bat批处理文件写入（如 update_4_1.bat）：
```batch
lark-cli sheets +write --spreadsheet-token OrXrsyBHAh4BJrtMQEEcjuhfnmd --sheet-id JXJwuc --range "B2:U2" --values "[[1953.8,29733,843,\"2.84%\",2.32,65.71,27,2,26,10,84,23.26,57,34.28,41,47.65,83,2,976.9,0]]"
```

### 注意事项
- 未来如果用户指定其他日期，需要：
  1. 先在飞书表格A列找到对应日期的行号
  2. 修改日期筛选器到目标日期
  3. 读取合计行的数据
  4. 写入对应行

## 注意事项
1. **lark-cli 安装问题**: 原始npm安装会从GitHub下载二进制文件，中国网络可能超时。需要手动下载zip文件解压安装
2. **写入命令转义**: Windows命令行中JSON参数转义复杂，建议使用.bat批处理文件
3. **日期格式**: 飞书表格使用Excel日期数字（46082.1 = 2026/3/25，46083.1 = 2026/3/26，以此类推）
4. **定时任务会话**: 创建cron任务时必须使用 `sessionTarget: "main"`，禁止使用 `isolated`（独立会话没有浏览器登录状态）

## Agent工程化学习笔记（Claude Code架构分析）
### 核心观点
- **Harness架构**：Agent的"Body"（工具+记忆+编排）比"Brain"（模型）更重要
- **TAOR循环**：Think-Act-Observe-Repeat，运行时越笨越好，智能下沉到模型，确定性留给框架
- **四类原语**：Read、Write、Execute、Connect，不要构建100个工具，给模型shell让它自己组合
- **Context管理**：稀缺资源，越干净越好，不是越大越好
- **记忆是索引，不是存储**：能从代码库推导的信息不要存储

### 启发
1. 工具不在多，在于可组合
2. 记忆要定期整理，过期信息是"负债"
3. 权限设计是UX问题，不是单纯的安全问题
---
*最后更新: 2026-04-02 11:03*
