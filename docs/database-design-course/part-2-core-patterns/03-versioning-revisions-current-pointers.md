# 03. 版本、修订和当前指针

只要一个对象可能被多次编辑、生成、发布或替换，就会遇到版本问题。

常见场景：

- 文章版本
- 合同修订
- 页面配置版本
- AI 图片生成版本
- 商品说明版本
- 隐私协议版本

## 覆盖更新的问题

最简单做法是直接 update 主表。

```text
articles.body = 新内容
```

这适合不关心历史的小功能。但如果要回滚、审核、比较差异、查看历史发布内容，覆盖更新就不够了。

## 版本表模式

常见结构：

```text
articles
- id
- slug
- current_version_id
- status

article_versions
- id
- article_id
- version_number
- title
- body
- created_by
- created_at
```

`articles` 表示文章这个长期对象。  
`article_versions` 表示文章内容的每个版本。

## 当前指针

有多个版本时，需要知道哪个是当前版本。

常见做法：

```text
articles.current_version_id
articles.published_version_id
```

或者单独建发布记录：

```text
publications
- article_id
- version_id
- published_at
```

如果“发布”本身有独立业务含义，用发布记录更清楚。

## 版本号约束

通常需要保证同一资源下版本号唯一。

```text
unique(article_id, version_number)
```

对于按日期生成的版本：

```text
unique(target_date, generation_version)
```

## Draft 和 Published 分离

内容系统常见需求：

- 正在编辑草稿
- 公开页面仍显示旧发布版本
- 审核通过后切换到新版本

这时不要把草稿直接覆盖已发布内容。

可以设计：

```text
article_versions.status = draft | review_required | approved | published | archived
articles.published_version_id
```

公开页面只读 published version。

## 版本是否可变

有两种策略：

### 可变草稿版本

草稿版本可以 update，发布后冻结。

适合 CMS。

### 每次保存都新建版本

每次编辑都 append 一条。

适合审计要求高的合同、政策、配置。

选择取决于历史精度要求。

## 常见反模式

- 只有一个 `articles` 表，发布后编辑会污染公开内容
- 版本号没有唯一约束
- 不知道当前版本是谁
- 删除旧版本导致历史链接不可解释
- 当前版本和发布版本混为一谈

## 本章原则

> 当对象需要历史、审核、回滚或比较时，把长期对象和版本内容拆开，并用当前指针或发布记录表达最终采用版本。

