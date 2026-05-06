# 03. 主键、外键、约束和索引

表结构不只是字段集合，还要定义身份、引用、规则和查询路径。

- 主键定义身份
- 外键定义合法引用
- 约束定义不可违反的规则
- 索引定义高频查询路径

## 主键

主键是一行数据的唯一身份。

常见主键有两类。

### 代理主键

数据库生成的 id，例如 uuid、自增整数。

```text
users.id
orders.id
articles.id
```

优点是稳定、无业务含义、适合引用。

### 自然主键

业务上天然唯一的字段。

```text
countries.code
currencies.code
```

自然主键只有在字段非常稳定时才适合。邮箱、slug、用户名看似唯一，但都可能变化，所以通常更适合作为唯一字段，而不是主键。

实用原则：

> 用稳定代理主键表达身份，用唯一约束表达业务唯一性。

## 外键

外键保证引用真实存在。

```text
orders.user_id -> users.id
order_items.order_id -> orders.id
team_memberships.team_id -> teams.id
```

没有外键时，很容易出现孤儿数据：

```text
order_items.order_id = 不存在的订单
```

页面 join 不到数据时才发现问题，已经晚了。

## 删除策略

外键还要回答：被引用的记录删除时怎么办？

### cascade

父记录删除，子记录一起删除。

适合强依赖：

```text
orders -> order_items
users -> sessions
```

### set null

父记录删除，子记录引用置空。

适合历史保留：

```text
publications.approved_by -> admin_users.id
```

### restrict

有子记录时禁止删除父记录。

适合订单、账务、库存等历史敏感数据：

```text
products <- order_items
```

## 唯一约束

唯一约束表达“不允许重复”。

```text
users.email unique
articles.slug unique
admin_sessions.token_hash unique
```

组合唯一约束表达某个范围内唯一：

```text
unique(team_id, user_id)
unique(order_id, product_id)
unique(target_date, version)
```

条件唯一约束表达更精确的规则：

```text
一个用户只能有一个 active subscription
一篇文章只能有一个 published version
同一天只能有一个 published publication
```

Postgres 可以用 partial unique index 表达这类规则。

## 非空约束

`not null` 表示业务上必须存在。

不要为了“灵活”让所有字段可空。可空字段必须有明确含义。

好的 null：

```text
published_at null 表示尚未发布
cancelled_at null 表示尚未取消
error_message null 表示没有错误
```

坏的 null：

```text
title null，但没人知道是否允许无标题
user_id null，但这条数据到底属于谁不清楚
```

## Check 和 Enum

状态、范围和数值规则可以用 check 或 enum。

```text
status in ('draft', 'published', 'archived')
amount >= 0
quantity > 0
```

enum 像 TypeScript union type，能防止拼写错误和非法状态值。

## 索引

索引用来加速查询，但不是越多越好。

适合索引的字段：

- 经常用于 where
- 经常用于 join
- 经常用于 order by
- 经常用于唯一查找

例子：

```text
orders.user_id
orders.created_at
articles.slug
publications.publish_date
```

索引会占空间，也会降低写入速度。先根据真实查询路径设计，再根据性能补充。

## 约束和索引的区别

约束回答：

```text
什么数据绝对不允许出现？
```

索引回答：

```text
什么查询需要更快？
```

唯一索引同时有两种角色，但建模时仍应先从业务规则出发。

## 本章原则

> 数据库不只是存储数据，也应该帮你验证身份、引用和不可破坏的业务规则。

