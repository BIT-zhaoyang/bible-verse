# 01. 查询驱动的索引设计

索引设计不要从字段出发，要从查询出发。

错误方式：

```text
这个字段看起来重要，加索引。
```

正确方式：

```text
这个页面/接口会按哪些条件查询、排序和 join？
```

## 列查询路径

先写高频查询：

```text
按 email 查用户登录
按 publish_date 查当天内容
按 user_id + created_at 查订单列表
按 team_id + status 查任务
按 slug 查文章详情
```

然后设计索引。

## 单列索引

适合单字段过滤：

```text
users.email
articles.slug
publications.publish_date
```

唯一字段通常自带唯一索引。

## 组合索引

组合索引适合多字段过滤和排序：

```text
orders(user_id, created_at)
tasks(team_id, status)
events(resource_type, resource_id, created_at)
```

字段顺序很重要。通常把等值过滤字段放前面，排序或范围字段放后面。

## 部分索引

只索引一部分数据。

```text
where status = 'active'
where deleted_at is null
```

适合大表里只频繁查活跃数据。

## 索引代价

索引会：

- 占磁盘
- 降低写入速度
- 增加迁移成本
- 让优化器选择更复杂

不要为每个字段建索引。

## 读执行计划

生产优化时要看数据库执行计划。

你需要关注：

- 是否全表扫描
- 是否使用索引
- 估算行数是否离谱
- 排序是否昂贵
- join 顺序是否合理

## 本章原则

> 索引是为真实查询路径服务的；先列页面和接口怎么读，再决定单列、组合或部分索引。

