# 代码质量验证清单

*写完代码后、提交前必须逐项检查。*

---

## SQL Schema 专项检查

- [ ] **没有表有2个 PRIMARY KEY**（UUID 和 tenant_id 不能同时设 PK）
- [ ] **ENUM 类型用于 priority/status 等有限集合**（不用 TEXT CHECK 代替）
- [ ] **FOREIGN KEY 的列名以 _id 结尾**
- [ ] **所有表有 created_at + updated_at（TIMESTAMPTZ）**
- [ ] **所有表有 deleted_at 用于软删除**
- [ ] **tenant_id 在每张表都存在（多租户）**
- [ ] **索引与查询模式匹配**（tenant_id + status 等常见查询组合）

---

## 代码实现专项检查

### CLI工具
- [ ] 参数解析完整（--help 能用，--required 校验有）
- [ ] 错误处理有（try/catch，exit code 正确）
- [ ] 输出格式正确（text/json/github-actions 都测试）
- [ ] 连接池/资源释放（client.end()）

### Docker Compose
- [ ] **每张表只有一个 PRIMARY KEY**
- [ ] **网络隔离**：frontend 不能直连 postgres（只能通过 backend）
- [ ] **healthcheck 在所有依赖服务上**（不只是 depends_on）
- [ ] **持久化卷**（named volumes for postgres/redis/minio）
- [ ] **.env.example 包含所有必需变量**
- [ ] **Makefile 包含 up/down/logs/shell/db-reset/test**

### API/代码片段
- [ ] 边界条件检查（非空/类型/范围）
- [ ] 无硬编码凭证
- [ ] 错误消息对用户友好

---

## Playbook 执行检查

- [ ] 执行前已读取对应 playbook
- [ ] 日期/行号计算后有复核
- [ ] 写入命令的 range 格式正确（如 "B3:U3"）
- [ ] 百分比已转为小数（如 5.37% → 0.0537）
- [ ] 写入后有验证步骤

---

*这份清单贴在手边，每次写完代码/执行操作前看一眼。*
