# 03. 内容管理、CMS 和发布系统

内容系统不只是“文章表”。成熟内容系统要处理内容来源、编辑、审核、发布、归档、SEO、分享和运营。

## 适用场景

- 博客
- 新闻站
- 教程站
- 灵修网站
- Newsletter
- 菜谱站
- 产品文档
- 营销内容库

## 核心资源

常见资源：

```text
ContentItem
Author
Category
Tag
MediaAsset
Publication
ContentRevision
Subscriber
```

简单内容站可以只有 `posts`。但只要涉及审核、定时发布、多人编辑，就需要更多边界。

## 内容状态

最小状态：

```text
draft -> published
```

常见成熟状态：

```text
draft -> review_required -> approved -> scheduled -> published -> archived
```

AI 内容或用户投稿还会有：

```text
generated
rejected
needs_revision
flagged
```

## 页面结构

前台：

```text
首页
内容列表
内容详情
分类页
标签页
作者页
归档页
搜索页
```

后台：

```text
内容列表
编辑页
预览页
审核队列
发布排期
媒体库
SEO 设置
```

## SEO 和分享

每条内容最好有：

```text
stable slug
seo_title
seo_description
canonical_url
og_title
og_description
og_image_url
published_at
updated_at
```

如果网站依赖搜索和社交传播，详情页不是可选项，而是增长基础设施。

## 内容来源

内容可以来自：

- 管理员手写
- 作者投稿
- 用户生成
- AI 生成
- 第三方同步
- 批量导入

来源不同，流程不同。用户生成内容要审核，AI 生成内容要质量检查，第三方同步要处理更新和删除。

## 常见架构

最小内容站：

```text
posts -> public pages
```

带后台的内容站：

```text
posts -> admin editor -> status -> public pages
```

带审核和发布记录：

```text
content pool -> revision/generation -> review -> publication -> public pages
```

## 常见坑

第一，只有首页没有详情页，内容无法沉淀搜索流量。

第二，草稿和已发布内容不分离。

第三，slug 不稳定，导致外部链接失效。

第四，AI 生成内容没有人工审核或质量检查。

第五，编辑保存后直接影响前台，容易误发布。

## 决策清单

- 内容是谁创建的？
- 是否需要审核？
- 是否需要定时发布？
- 是否需要历史版本？
- 是否需要 SEO 字段？
- 是否需要分类和标签？
- 是否需要媒体库？
- 是否需要预览？
- 是否需要独立发布记录？

## 练习

设计一个付费 Newsletter 的内容状态。要求支持：

- 免费文章
- 会员文章
- 草稿
- 定时发送
- 邮件发送失败重试

