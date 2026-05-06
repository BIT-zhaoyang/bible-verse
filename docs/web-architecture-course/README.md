# 网站架构课程

这套课程的目标不是让你背一堆网站类型，而是训练一种能力：

```text
看到任何网站，都能拆出它的角色、资源、行为、状态、权限、页面、后台流程、外部服务、增长路径和商业闭环。
```

原来的总览文档保留在 [网站架构设计模式](../web-architecture-design-patterns.zh-CN.md)。那份适合快速建立地图。本课程是扩展版，按学习路径拆成多卷、多篇文章。

## 学习路径

### 第一卷：方法论

先建立网站架构的基本思维。你会学会不要从页面开始，而是从业务对象、用户角色和流程开始。

- [00. 课程导论](00-introduction.md)
- [01. 网站不是页面集合](01-methodology/01-architecture-mindset.md)
- [02. 角色、资源、行为、状态、权限](01-methodology/02-role-resource-action-state.md)
- [03. 从想法到架构蓝图](01-methodology/03-from-idea-to-blueprint.md)
- [04. MVP、演进和架构债](01-methodology/04-mvp-and-evolution.md)

### 第二卷：通用功能模式

这部分是“功能积木库”。每一章都讲一个常见网站能力：它解决什么问题、有哪些方案、数据怎么建、页面怎么设计、常见坑是什么。

- [01. 资源 CRUD 与业务对象建模](02-common-patterns/01-crud-and-resource-modeling.md)
- [02. 用户、登录、权限和多租户](02-common-patterns/02-identity-auth-permissions.md)
- [03. 内容管理、CMS 和发布系统](02-common-patterns/03-content-cms-publishing.md)
- [04. 文件上传、对象存储和媒体处理](02-common-patterns/04-file-upload-storage-media.md)
- [05. 搜索、筛选、排序和发现](02-common-patterns/05-search-filter-discovery.md)
- [06. 状态机、审核和工作流](02-common-patterns/06-workflow-review-state-machines.md)
- [07. 异步任务、定时任务和 Webhook](02-common-patterns/07-async-jobs-schedules-webhooks.md)
- [08. 支付、订阅、套餐和权益](02-common-patterns/08-payments-subscriptions-entitlements.md)
- [09. 通知、邮件和用户生命周期](02-common-patterns/09-notifications-email-lifecycle.md)
- [10. SEO、社交分享和增长入口](02-common-patterns/10-seo-sharing-growth.md)
- [11. 数据分析、日志和运营后台](02-common-patterns/11-analytics-logs-admin-ops.md)

### 第三卷：网站类型模式

这部分讲常见网站类型如何组合第二卷的功能模式。

- [01. 内容型网站](03-website-types/01-content-sites.md)
- [02. 工具型网站和 AI 产品](03-website-types/02-tool-and-ai-sites.md)
- [03. 电商网站](03-website-types/03-ecommerce-sites.md)
- [04. SaaS 产品](03-website-types/04-saas-products.md)
- [05. 社区和 Marketplace](03-website-types/05-community-and-marketplace.md)
- [06. 教育、媒体和内部后台](03-website-types/06-education-media-and-internal-tools.md)

### 第四卷：系统设计决策

同一个功能可以有很多实现方式。这一卷帮助你在技术方案之间做取舍。

- [01. 渲染、路由和页面生成策略](04-system-design-decisions/01-rendering-and-routing.md)
- [02. 数据存储、缓存和读写路径](04-system-design-decisions/02-data-storage-and-cache.md)
- [03. 第三方集成和系统边界](04-system-design-decisions/03-integration-boundaries.md)
- [04. 安全、隐私、可靠性和可运维性](04-system-design-decisions/04-security-privacy-and-reliability.md)

### 第五卷：案例拆解

案例的目标是把抽象模式落到真实网站。

- [01. Bible Daily Verse](05-case-studies/01-bible-daily-verse.md)
- [02. 图片压缩工具站](05-case-studies/02-image-compressor-tool.md)
- [03. 付费 Newsletter](05-case-studies/03-paid-newsletter.md)
- [04. 小型 CRM SaaS](05-case-studies/04-mini-saas-crm.md)
- [05. 小型电商独立站](05-case-studies/05-small-ecommerce.md)

### 第六卷：练习和模板

真正掌握架构，要靠拆解和练习。

- [01. 架构拆解练习](06-exercises/01-architecture-drills.md)
- [02. 模式选择练习册](06-exercises/02-pattern-selection-workbook.md)
- [03. 综合架构题](06-exercises/03-capstone-briefs.md)
- [模板：网站架构蓝图](06-exercises/templates.md)

## 每章的固定结构

第二卷以后的章节尽量使用同一套结构：

```text
它解决什么问题
适用场景
核心概念
最小实现
成熟实现
数据模型
页面结构
后端流程
状态流转
第三方服务
常见坑
架构决策清单
练习题
```

这套结构很重要。它会逼你不只停留在“知道一个功能名”，而是学会为每个功能选择方案。

## 学习方式

建议不要一口气读完。更好的方式是：

1. 先读第一卷，建立拆解框架。
2. 读第二卷时，每章都拿一个你熟悉的网站做对照。
3. 读第三卷时，尝试自己画出每类网站的核心资源和状态流转。
4. 读第五卷时，把案例里的模型迁移到你自己的项目。
5. 最后做第六卷练习，用模板输出完整架构蓝图。

读完这套课程后，你应该能够回答：

- 一个新网站应该先设计什么？
- 哪些功能是通用模式？
- 每个功能有哪些实现路线？
- 数据表如何从业务流程推导出来？
- MVP 应该切到哪里？
- 网站从小到大如何演进？

