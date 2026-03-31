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

## 注意事项
1. **lark-cli 安装问题**: 原始npm安装会从GitHub下载二进制文件，中国网络可能超时。需要手动下载zip文件解压安装
2. **写入命令转义**: Windows命令行中JSON参数转义复杂，建议使用.bat批处理文件
3. **日期格式**: 飞书表格使用Excel日期数字（46082.1 = 2026/3/25，46083.1 = 2026/3/26，以此类推）

---
*最后更新: 2026-03-31 16:04*
