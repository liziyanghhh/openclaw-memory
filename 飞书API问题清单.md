# 飞书API读取云文档表格 - 问题清单与需求文档

## 一、需求概述

**目标**：通过API读取飞书云文档（Wiki）中的云表格数据

**场景**：
- 飞书云文档链接：https://wcnjaznqdu9b.feishu.cn/wiki/S65QwGl3BiUjFekvznHc7XMcnOd
- 目标表格名称包含"大版协作表"
- 表格位于Wiki知识库中

---

## 二、已完成的操作

### 1. 应用创建
- **App ID**: cli_a949f94b0ffa9bc2
- **App Secret**: AL22hFMXmxOnsL6kxq68ygvfv37d1EVW

### 2. 已开通的应用权限
在飞书开放平台 → 权限管理 → API权限 已开通：
- `wiki:wiki`
- `wiki:wiki:readonly`
- `wiki:space:retrieve`
- `bitable:app`
- `bitable:app:readonly`
- `drive:drive`
- `drive:drive:readonly`

### 3. OAuth授权
- 已进行多次用户身份授权
- 授权页面未出现Wiki权限勾选选项
- 授权后获取到的Token无法访问Wiki API

---

## 三、已验证可用的功能

通过用户身份OAuth，已成功读取以下数据：

| 功能 | 状态 | 说明 |
|------|------|------|
| 获取用户信息 | ✅ 正常 | - |
| 云表格读取 | ✅ 正常 | 可读取个人文档库中的云表格 |
| 文件列表 | ✅ 正常 | 可列出用户文件 |
| Wiki空间列表 | ❌ 失败 | 返回权限不足 |
| Wiki节点读取 | ❌ 失败 | 返回404 |

---

## 四、核心问题

### 问题1：OAuth授权无法获取Wiki权限

**现象**：
- 授权链接：https://open.feishu.cn/open-apis/authen/v1/authorize?app_id=cli_a949f94b0ffa9bc2&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth%2Fcallback
- 用户授权后，授权页面只显示"获取用户信息"权限
- 没有出现Wiki相关权限的勾选选项

**已尝试的解决方案**：
1. 在授权URL中添加scope参数（wiki:wiki,wiki:wiki:readonly等）→ 报错20043
2. 直接开通应用权限后授权 → 仍然无法访问Wiki API
3. 多次重新授权 → 结果相同

**错误信息**：
```
{"code":99991679,"msg":"Unauthorized. You do not have permission to perform the requested operation on the resource. Please request user re-authorization and try again. required one of these privileges under the user identity: [wiki:wiki, wiki:wiki:readonly, wiki:space:retrieve]"}
```

### 问题2：应用身份无法访问个人文档库

**现象**：使用应用TenantAccessToken无法获取用户的Wiki空间列表

---

## 五、需求清单

### 1. 核心需求
- [ ] 通过API读取用户Wiki知识库中的云表格数据
- [ ] 支持读取个人文档库中的云表格（已部分实现）

### 2. 需要确认的问题
- [ ] 应用是否需要发布到飞书应用市场才能获取Wiki权限？
- [ ] 是否需要企业管理员审批才能获得Wiki权限？
- [ ] Wiki权限是否对OAuth授权有限制？
- [ ] 是否有其他方式可以让用户授权Wiki权限？

### 3. 技术支持需求
- [ ] 如何在OAuth授权时获取Wiki权限？
- [ ] 应用需要满足什么条件才能获取Wiki权限？
- [ ] 是否有替代方案可以实现读取Wiki中云表格的功能？

---

## 六、测试环境信息

- **企业ID**: 1ac2664d18481c95
- **用户ID**: 58419f7g
- **用户名称**: 用户668495
- **飞书版本**: 企业版（左侧有"知识库"入口）

---

## 七、已验证失败的API调用

```javascript
// 1. 获取Wiki空间列表
GET https://open.feishu.cn/open-apis/wiki/v2/spaces
Authorization: Bearer {user_access_token}
// 返回: 权限不足

// 2. 获取Wiki节点
GET https://open.feishu.cn/open-apis/wiki/v2/nodes/{node_id}
Authorization: Bearer {user_access_token}
// 返回: 404

// 3. 获取文档内容
GET https://open.feishu.cn/open-apis/doc/v3/documents/{doc_id}/content
Authorization: Bearer {user_access_token}
// 返回: 404
```

---

## 八、总结

用户需求明确：读取Wiki知识库中的云表格。

当前障碍：OAuth授权无法获取Wiki权限，导致API调用返回权限不足错误。

需要飞书技术支持确认：
1. 应用是否需要发布才能获取Wiki权限？
2. 是否需要管理员审批？
3. 是否有其他解决方案？

---

*文档生成时间: 2026-03-26*
*问题跟进人: [用户]*
*技术支持对接人: [飞书技术支持]*