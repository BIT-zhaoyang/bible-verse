# 01. 用户、认证和会话

用户系统是大多数产品的基础。

但“用户”不只是一个 `users` 表。真实系统还会涉及认证身份、密码、OAuth、session、设备、邮箱验证、账号状态和安全审计。

## 基础用户表

```text
users
- id
- email
- display_name
- status
- created_at
- updated_at
```

常见约束：

```text
unique(email)
email not null
```

如果支持用户改邮箱，要考虑邮箱验证流程和历史邮箱。

## 密码认证

密码不要明文保存。

```text
user_passwords
- user_id
- password_hash
- password_updated_at
```

也可以直接放在 `users.password_hash`。拆表适合：

- 支持多种认证方式
- 密码字段权限敏感
- 需要独立审计

## OAuth 身份

一个用户可能绑定多个外部身份。

```text
user_identities
- id
- user_id
- provider
- provider_user_id
- email_snapshot
- created_at
```

约束：

```text
unique(provider, provider_user_id)
```

这防止同一个外部账号绑定多个用户。

## Session

Session 表记录登录状态。

```text
sessions
- id
- user_id
- token_hash
- expires_at
- created_at
- revoked_at
```

不要在数据库里保存 raw token。保存 hash，即使数据库泄漏也降低风险。

常见约束：

```text
unique(token_hash)
```

## 邮箱验证

```text
email_verification_tokens
- id
- user_id
- email
- token_hash
- expires_at
- consumed_at
- created_at
```

`consumed_at` 防止重复使用。

## 密码重置

```text
password_reset_tokens
- id
- user_id
- token_hash
- expires_at
- consumed_at
- created_at
```

同样保存 hash，并设置有效期。

## 账号状态

```text
status = active | suspended | deleted | pending_verification
```

不要只用 `is_active` 表达所有状态。封禁、待验证、删除是不同语义。

## 安全审计

安全相关事件建议保留：

```text
auth_events
- user_id
- event_type
- ip_address
- user_agent
- created_at
```

事件类型：

```text
login_success
login_failed
password_changed
email_changed
session_revoked
```

## 本章原则

> 用户表表达账号主体；认证方式、session、验证 token 和安全事件应该按生命周期拆开。

