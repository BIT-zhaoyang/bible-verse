# 数据库设计课程：从数据建模到生产系统

这套课程的目标是系统性教会你数据库设计，而不是只解释当前网站的几张表。

它会以关系型数据库为主线，因为大多数业务系统的核心事实仍然最适合用关系模型表达。但课程不会只停留在 ER 图和范式，也会覆盖真实产品里反复出现的数据库设计模式：用户、权限、多租户、内容发布、订单支付、订阅账单、库存、消息、社交、AI 生成、事件历史、读模型、幂等、迁移、性能和数据治理。

你的 Bible Daily Verse 项目会作为贯穿案例之一，尤其用于解释内容发布和 AI 生成工作流。但这套课程的边界是通用数据库建模，而不是某一个网站。

## 如何阅读

建议按 Part 顺序读。每个 Part 的文章既能连续阅读，也能作为以后设计 schema 时的手册。

如果要重写或扩写课程章节，先读 [数据库设计课程写作经验](./AUTHORING_NOTES.md)。这份笔记记录了课程文章的写作准则，帮助后续章节保持一致的教学风格。

## Part 1：建模基础

1. [什么是数据建模](./part-1-foundations/01-what-is-data-modeling.md)
2. [实体、属性、关系和基数](./part-1-foundations/02-entities-attributes-relationships.md)
3. [主键、外键、约束和索引](./part-1-foundations/03-keys-constraints-indexes.md)
4. [规范化和反规范化](./part-1-foundations/04-normalization-and-denormalization.md)
5. [生命周期、状态机和工作流](./part-1-foundations/05-lifecycle-state-machines-workflows.md)
6. [时间、历史和快照](./part-1-foundations/06-time-history-snapshots.md)

## Part 2：核心建模模式

1. [主数据和引用数据](./part-2-core-patterns/01-master-and-reference-data.md)
2. [交易记录和明细行](./part-2-core-patterns/02-transaction-records-and-line-items.md)
3. [版本、修订和当前指针](./part-2-core-patterns/03-versioning-revisions-current-pointers.md)
4. [审计日志和状态事件](./part-2-core-patterns/04-audit-logs-and-status-events.md)
5. [软删除、归档和保留策略](./part-2-core-patterns/05-soft-delete-archive-retention.md)
6. [有效期、时间范围和价格历史](./part-2-core-patterns/06-effective-dating-and-temporal-ranges.md)
7. [幂等、去重和外部事件](./part-2-core-patterns/07-idempotency-deduplication-external-events.md)
8. [快照、投影和读模型](./part-2-core-patterns/08-snapshots-projections-read-models.md)

## Part 3：领域建模模式

1. [用户、认证和会话](./part-3-domain-patterns/01-users-auth-sessions.md)
2. [角色、权限和 RBAC](./part-3-domain-patterns/02-roles-permissions-rbac.md)
3. [多租户 SaaS](./part-3-domain-patterns/03-multi-tenant-saas.md)
4. [CMS、内容版本和发布](./part-3-domain-patterns/04-cms-content-publishing.md)
5. [电商订单、支付和退款](./part-3-domain-patterns/05-ecommerce-orders-payments-refunds.md)
6. [订阅、账单和发票](./part-3-domain-patterns/06-subscriptions-billing-invoices.md)
7. [库存、余额和流水账](./part-3-domain-patterns/07-inventory-balances-ledgers.md)
8. [社交关系、评论、点赞和动态流](./part-3-domain-patterns/08-social-comments-likes-feeds.md)
9. [通知、消息和收件箱](./part-3-domain-patterns/09-notifications-messaging-inbox.md)
10. [AI 生成、审核和资产管理](./part-3-domain-patterns/10-ai-generation-review-assets.md)

## Part 4：高级建模主题

1. [事件溯源](./part-4-advanced-modeling/01-event-sourcing.md)
2. [账本模型和不可变流水](./part-4-advanced-modeling/02-ledger-modeling.md)
3. [CQRS 和读写模型分离](./part-4-advanced-modeling/03-cqrs-read-write-models.md)
4. [层级、树和图关系](./part-4-advanced-modeling/04-hierarchies-trees-graphs.md)
5. [多态关联和可扩展属性](./part-4-advanced-modeling/05-polymorphic-relations-and-extensible-attributes.md)
6. [多语言、地域化和国际化数据](./part-4-advanced-modeling/06-localization-internationalization.md)

## Part 5：生产系统设计

1. [查询驱动的索引设计](./part-5-production-design/01-query-driven-index-design.md)
2. [事务、一致性和并发](./part-5-production-design/02-transactions-consistency-concurrency.md)
3. [迁移、回填和零停机变更](./part-5-production-design/03-migrations-backfills-zero-downtime.md)
4. [性能、缓存和反规范化](./part-5-production-design/04-performance-caching-denormalization.md)
5. [隐私、安全、保留和合规](./part-5-production-design/05-privacy-security-retention-compliance.md)

## Part 6：练习和复盘

1. [从需求到 schema 的建模流程](./part-6-practice/01-modeling-process-from-requirements.md)
2. [常见反模式](./part-6-practice/02-anti-patterns.md)
3. [设计评审检查清单](./part-6-practice/03-design-review-checklist.md)
4. [练习题：从 10 个业务场景推导模型](./part-6-practice/04-practice-prompts.md)
5. [案例复盘：Bible Daily Verse](./part-6-practice/05-case-study-bible-daily-verse.md)

## 学习目标

读完这套课程后，你应该能：

- 从产品需求中识别实体、关系、事件和状态
- 判断一对一、一对多、多对多以及关系表的边界
- 把业务不变量落实为数据库约束
- 判断什么时候规范化，什么时候保存快照或读模型
- 设计常见业务领域的核心 schema
- 看懂 schema 背后的产品规则和演进方向
- 做数据库设计评审，识别常见坏味道

## 核心观念

数据库设计的本质不是“字段怎么摆”，而是回答：

> 这个系统承认哪些事实？哪些对象长期存在？哪些动作必须留痕？哪些规则永远不能被打破？哪些数据代表当前结果，哪些数据代表历史证据？

当你能稳定回答这些问题时，schema 就不再是凭感觉拼出来的表，而会成为产品逻辑的骨架。
