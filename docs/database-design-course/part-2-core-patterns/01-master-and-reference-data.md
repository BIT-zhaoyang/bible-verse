# 01. 主数据和引用数据

主数据和引用数据是许多系统的底座。

它们看起来不像订单、支付、消息那样“有动作”，但它们定义了系统里长期存在的对象和可选集合。

## 主数据

主数据是业务里长期存在、可复用、被其他记录引用的对象。

例子：

- 用户
- 商品
- 客户
- 供应商
- 文章
- 经文
- 团队
- 仓库

典型字段：

```text
id
name 或 title
slug 或 code
status
is_active
created_at
updated_at
```

主数据表应该表达对象本体，不要混入太多过程状态。

例如商品表可以有 `status` 表示上架、下架、草稿，但不应该把订单支付状态放进去。

## 引用数据

引用数据是系统里的可选集合或字典。

例子：

- 国家
- 货币
- 语言
- 分类
- 角色类型
- 状态枚举
- 计量单位

引用数据有两种常见表达方式：enum 和 lookup table。

## Enum

enum 适合固定、低频变化、由代码控制的集合。

```text
order_status:
- pending_payment
- paid
- shipped
- completed
- cancelled
```

优点：

- 类型清楚
- 数据库能防止非法值
- 和 TypeScript union 很像

缺点：

- 新增值需要迁移
- 不适合后台动态管理
- 不适合带展示名称、排序、多语言的复杂字典

## Lookup table

lookup table 适合需要后台管理或附加信息的选项。

```text
categories
- id
- slug
- name
- description
- sort_order
- is_active
```

适合：

- 内容分类
- 商品分类
- 国家和地区
- 可配置业务类型
- 需要多语言展示的字典

## Code 和 slug

很多主数据或引用数据需要稳定业务编码。

```text
countries.code = "US"
currencies.code = "USD"
articles.slug = "database-design"
```

建议：

- 内部引用仍用 `id`
- `code` 或 `slug` 加唯一约束
- 不要轻易用可变 slug 做主键

## 启停模式

主数据通常不直接删除，而是停用。

```text
is_active boolean
```

或：

```text
status = active | inactive | archived
```

选择：

- 简单启停：`is_active`
- 多阶段生命周期：`status`

不要让 `is_active`、`is_deleted`、`status` 三个字段表达同一件事。

## 常见反模式

### 把引用数据硬编码在前端

短期快，长期难维护。后端和数据库不知道合法集合，容易写入非法值。

### 字典表过度通用

```text
dictionaries
- type
- key
- value
```

这种万能字典表看似灵活，但会失去类型、外键和约束。除非确实需要动态配置，否则为重要字典建明确表。

### 主数据混入交易字段

例如在 `products` 上存 `last_order_id`、`last_paid_at`。这类字段通常是统计或投影，不是商品本体。

## 适用场景

使用主数据/引用数据模式时，先问：

- 这个对象是否被其他业务记录引用？
- 它是否长期存在？
- 它是否需要启停？
- 它是否需要后台管理？
- 选项集合是否固定？

## 本章原则

> 主数据表达长期对象，引用数据表达可选集合；固定集合用 enum，可管理集合用 lookup table。

