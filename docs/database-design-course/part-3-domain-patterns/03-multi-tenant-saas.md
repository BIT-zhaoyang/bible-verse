# 03. 多租户 SaaS

多租户系统里，同一套应用服务多个组织或客户。

核心问题是：如何隔离不同租户的数据。

## Tenant 表

```text
tenants
- id
- name
- slug
- plan
- status
- created_at
```

tenant 可以叫 organization、workspace、account，取决于产品语言。

## 共享数据库，共享表

最常见做法是在业务表加 `tenant_id`。

```text
projects
- id
- tenant_id
- name

tasks
- id
- tenant_id
- project_id
- title
```

所有查询都必须带 tenant scope：

```text
where tenant_id = current_tenant_id
```

优点：简单、成本低。  
缺点：必须严格防止漏 tenant 条件。

## 共享数据库，分 schema

每个 tenant 一个 schema。

优点：隔离更强。  
缺点：迁移和运维复杂。

适合更高隔离要求但还没到独立数据库的场景。

## 独立数据库

每个 tenant 一个数据库。

优点：隔离强、可单独备份和迁移。  
缺点：运维成本高。

适合企业客户、强合规或大客户隔离。

## Membership

多租户通常需要成员关系：

```text
tenant_memberships
- tenant_id
- user_id
- role
- status
- joined_at
```

约束：

```text
unique(tenant_id, user_id)
```

## tenant_id 是否冗余

如果 `tasks` 已经通过 `project_id` 能找到 tenant，是否还要存 `tenant_id`？

很多 SaaS 会冗余存。

好处：

- 查询更快
- 权限过滤更简单
- 唯一约束可以按 tenant 建

代价：

- 要保证 `tasks.tenant_id` 和 `projects.tenant_id` 一致

这通常通过应用代码、事务和约束策略控制。

## 按租户唯一

```text
unique(tenant_id, slug)
unique(tenant_id, external_id)
```

很多字段只需要在租户内唯一，不需要全局唯一。

## 本章原则

> 多租户建模的核心是 tenant scope；每张业务表都要明确是否属于租户，以及如何保证查询和约束不跨租户泄漏。

