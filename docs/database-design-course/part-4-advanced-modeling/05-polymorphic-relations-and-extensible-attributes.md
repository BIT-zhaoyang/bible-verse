# 05. 多态关联和可扩展属性

多态关联表示一条记录可以关联多种资源。

例如评论可以评论文章、图片、视频：

```text
comments
- resource_type
- resource_id
```

## 优点

- 灵活
- 少建表
- 统一接口容易

## 缺点

- 数据库无法用普通外键约束 resource_id
- join 麻烦
- 容易出现无效引用
- 权限判断复杂

## 替代方案

### 分表

```text
post_comments
image_comments
```

约束强，但重复多。

### 统一资源表

```text
resources
- id
- type

comments.resource_id -> resources.id
```

每种资源再有自己的详情表。

适合平台化系统，但复杂度更高。

## 可扩展属性

有些对象有动态字段。

做法一：JSON metadata。

```text
products.metadata jsonb
```

适合不常查询的附加信息。

做法二：EAV。

```text
entity_attributes
- entity_id
- attribute_key
- value
```

EAV 灵活但查询和约束很痛苦。只有在属性模型高度动态时才考虑。

## 本章原则

> 多态和动态属性带来灵活性，也削弱约束；核心关系优先用明确外键，边缘扩展再用 polymorphic 或 JSON。

