# 02. 实体、属性、关系和基数

关系型建模的地基是实体、属性、关系和基数。

- 实体：有独立身份的业务对象
- 属性：描述实体的字段
- 关系：实体之间的连接
- 基数：一个实体能对应几个另一个实体

很多 schema 问题，本质上都是这四件事没分清。

## 如何识别实体

一个概念是否应该成为实体，可以问：

- 它是否需要单独创建、修改、删除？
- 它是否有自己的生命周期？
- 它是否会被其他数据引用？
- 它是否需要列表、详情、统计、权限？
- 它是否会出现多条记录？

例如：

- 用户是实体
- 商品是实体
- 订单是实体
- 订单明细也是实体或关系实体
- 商品价格历史是实体
- 当前页面卡片通常不是实体，而是视图模型

## 属性不是实体

属性只是描述实体的字段。

```text
users.name
products.price
articles.title
verses.reference_text
```

但属性和实体的边界会随需求变化。

比如地址：

- 用户只有一个简单地址：可以是 `users.address_line`
- 用户有多个收货地址：应该是 `addresses`
- 地址要用于订单历史：订单需要地址快照

所以不要问“地址本质上是不是实体”，要问“当前业务如何使用地址”。

## 关系的三种基数

### 一对一

一个 A 对应一个 B，一个 B 也只对应一个 A。

例子：

- 用户和用户资料
- 用户和实名认证信息
- 商品和当前库存摘要

一对一不一定要拆表。拆表通常是因为：

- 字段很少读取
- 字段敏感
- 生命周期不同
- 可选字段太多
- 需要独立权限

### 一对多

一个 A 可以有多个 B，一个 B 只属于一个 A。

例子：

- 一个用户有多篇文章
- 一个订单有多个订单明细
- 一个团队有多个项目
- 一条经文有多次图片生成

一对多通常在“多”的一方放外键：

```text
articles.author_id -> users.id
order_items.order_id -> orders.id
image_generations.verse_id -> verses.id
```

### 多对多

一个 A 可以有多个 B，一个 B 也可以有多个 A。

例子：

- 文章和标签
- 用户和团队
- 学生和课程
- 商品和分类

多对多通常需要中间表：

```text
article_tags
- article_id
- tag_id
```

并加唯一约束：

```text
unique(article_id, tag_id)
```

## 关系实体

中间表不一定只是两个 id。如果关系本身有属性，它就是关系实体。

团队成员关系：

```text
team_memberships
- team_id
- user_id
- role
- joined_at
- invited_by
```

订单明细：

```text
order_items
- order_id
- product_id
- quantity
- unit_price_snapshot
```

`role`、`joined_at`、`quantity` 都不单独属于 A 或 B，而属于 A 和 B 的这次关系。

## 拥有关系和引用关系

外键并不总是代表“拥有”。有些是拥有，有些只是引用。

拥有关系：

```text
users -> sessions
orders -> order_items
```

父对象删除，子对象通常也可以删除。

引用关系：

```text
orders -> users
invoices -> customers
publications -> admin_users
```

被引用对象删除时，历史记录通常不应该消失。

这会影响 `on delete` 策略：

- `cascade`：依赖子记录一起删除
- `set null`：历史保留，引用置空
- `restrict`：仍有引用时禁止删除

## 设计关系时的模板

每次判断关系，可以写四句话：

```text
一个 A 可以有几个 B？
一个 B 可以属于几个 A？
这个关系本身有没有属性？
删除 A 时，B 应该怎样？
```

例子：

```text
一个 order 有多个 order_item。
一个 order_item 只属于一个 order。
关系本身有 quantity 和 price snapshot。
删除 order 时，order_item 可以级联删除。
```

这四句话几乎能直接推导出表结构。

## 本章原则

> 先判断实体有没有独立身份，再判断关系基数，最后决定外键、中间表和删除策略。

