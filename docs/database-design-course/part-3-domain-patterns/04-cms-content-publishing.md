# 04. CMS、内容版本和发布

内容系统看似简单，实际很容易复杂。

因为内容通常有草稿、审核、版本、发布、撤回、归档、slug、SEO、作者、标签和媒体资产。

## 简单内容表

适合极简博客：

```text
posts
- id
- author_id
- slug
- title
- body
- status
- published_at
```

当只有一个作者、没有版本、没有审核时够用。

## 版本化内容

如果要草稿和已发布版本分离：

```text
posts
- id
- author_id
- slug
- published_version_id
- status

post_versions
- id
- post_id
- version_number
- title
- body
- excerpt
- created_by
- created_at
```

公开页面只读 `published_version_id`。

## 发布记录

如果发布本身有业务含义，建发布表：

```text
publications
- id
- content_type
- content_id
- version_id
- scheduled_for
- status
- approved_by
- published_at
```

适合：

- 定时发布
- 多渠道发布
- 每日内容
- 人工审核
- 候选可替换

## 标签

简单展示可以用数组。  
标签成为功能后用：

```text
tags
content_tags
```

## Slug 和重定向

```text
posts.slug unique
slug_redirects
- old_slug
- new_slug
- resource_type
- resource_id
```

如果 SEO 重要，slug 变更后应保留重定向。

## 媒体资产

```text
assets
- id
- url
- storage_provider
- mime_type
- width
- height
- created_at
```

内容和资产可以多对多：

```text
content_assets
- content_id
- asset_id
- role
```

## 本章原则

> CMS 的核心是把内容主体、版本内容、发布事实和媒体资产分开；公开页面应该读已发布事实，而不是草稿或候选。

