# 08. 社交关系、评论、点赞和动态流

社交类产品的难点是关系多、读取频繁、排序复杂。

## 关注关系

```text
follows
- follower_id
- followee_id
- created_at
```

约束：

```text
unique(follower_id, followee_id)
```

可以加 check 防止自己关注自己。

## 评论

简单评论：

```text
comments
- id
- resource_type
- resource_id
- author_id
- body
- status
- created_at
```

如果评论只属于文章，也可以明确外键：

```text
post_id
```

明确外键约束更强，多态更灵活但约束弱。

## 嵌套评论

```text
comments.parent_id -> comments.id
```

适合简单树。深层树查询复杂时，需要层级模式，后面高级章节会讲。

## 点赞

```text
likes
- user_id
- resource_type
- resource_id
- created_at
```

约束：

```text
unique(user_id, resource_type, resource_id)
```

防止重复点赞。

## 计数缓存

帖子点赞数、评论数常会冗余存：

```text
posts.like_count
posts.comment_count
```

这是读优化。事实源仍然是 likes/comments。要接受短暂不一致，或用事务同步更新。

## Feed

动态流可以实时 join 生成，也可以用读模型：

```text
feed_items
- user_id
- actor_id
- verb
- object_type
- object_id
- created_at
```

高规模 feed 是复杂系统，不要一开始过度设计。先明确产品读取路径。

## 本章原则

> 社交模型要用关系表表达互动，用唯一约束防重复，用计数缓存和 feed 读模型服务高频读取。

