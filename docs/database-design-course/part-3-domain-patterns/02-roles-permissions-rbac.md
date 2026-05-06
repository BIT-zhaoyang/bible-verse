# 02. 角色、权限和 RBAC

权限系统回答：谁可以对什么资源做什么动作。

最常见模型是 RBAC：Role-Based Access Control，基于角色的访问控制。

## 简单角色字段

最简单做法：

```text
users.role = admin | user
```

适合：

- 小型后台
- 只有一两个角色
- 权限不需要动态配置

一旦角色和资源范围变多，就需要 RBAC。

## RBAC 基本模型

```text
users
roles
permissions
user_roles
role_permissions
```

`permissions` 通常表示动作能力：

```text
articles:create
articles:publish
users:invite
billing:manage
```

`user_roles` 表示用户拥有哪些角色。  
`role_permissions` 表示角色包含哪些权限。

## 作用域

权限经常有作用域。

例如一个用户在 Team A 是 admin，在 Team B 只是 member。

这时角色不能只挂在 user 上，要挂在 membership 上。

```text
team_memberships
- user_id
- team_id
- role
```

或：

```text
membership_roles
- membership_id
- role_id
```

## Resource-level Permission

有些权限直接绑定资源。

```text
document_shares
- document_id
- user_id
- permission = viewer | editor
```

适合文档协作、文件分享。

## Owner 模式

资源通常有 owner。

```text
projects.owner_id -> users.id
```

如果有团队，owner 可能是 membership 或 team：

```text
projects.team_id
```

权限判断时要清楚 owner 是用户级还是组织级。

## 条件唯一约束

如果一个团队只能有一个 owner：

```text
unique(team_id) where role = 'owner'
```

这是权限模型里很常见的业务约束。

## 常见反模式

- 把权限写死在前端
- 用多个布尔字段表示复杂权限
- 没有作用域，导致跨团队越权
- role 名称可变但被代码依赖
- 删除用户导致审计和历史记录丢失

## 本章原则

> 权限模型要同时表达主体、资源、动作和作用域；简单系统用 role 字段，协作系统用 membership 和 RBAC。

