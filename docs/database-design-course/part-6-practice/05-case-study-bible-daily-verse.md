# 05. 案例复盘：Bible Daily Verse

这个项目是内容发布和 AI 生成工作流的结合案例。

它不是整套课程的边界，但很适合练习“内容、生成、审核、发布”如何拆表。

## 业务故事

```text
网站维护经文内容库。
系统每天为目标日期选择经文。
系统生成图片候选。
管理员审核或重新生成。
审核通过后，某天最终发布某条经文和某个图片版本。
公开页面只读已批准或已发布的结果。
```

## 核心表

```text
verses
image_generations
daily_publications
admin_users
admin_sessions
```

## 为什么拆三张业务表

```text
verses: 内容是什么
image_generations: 生成过什么
daily_publications: 最终发布什么
```

如果揉成一张表，重新生成、审核、历史版本、每日唯一发布都会变得别扭。

## 模式映射

`verses`：

- Master Data
- Slug Pattern
- Active Flag

`image_generations`：

- Job Table
- Versioned Record
- Prompt Snapshot
- Provider Metadata

`daily_publications`：

- Current Pointer
- Publication Record
- Conditional Unique Constraint
- Lightweight Audit

`admin_sessions`：

- Session Table
- Token Hash
- Expiration

## 最关键约束

```text
同一个 publish_date，最多只能有一条 approved 或 published 记录。
```

这是数据库层面的产品承诺：一天只能公开一条正式内容。

## 可演进方向

- 标签从 jsonb 拆成 `tags + verse_tags`
- 审核动作拆成 `review_events`
- AI provider 配置拆成 runtime settings
- 图片资产拆成通用 `assets`
- 生成任务增加幂等 key 和 worker lock

## 本章原则

> 这个案例的核心经验是：内容资产、生成过程和最终发布事实要分开，页面只读最终事实，后台保留过程痕迹。

