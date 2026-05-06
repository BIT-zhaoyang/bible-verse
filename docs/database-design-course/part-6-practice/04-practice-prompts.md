# 04. 练习题：从 10 个业务场景推导模型

下面这些练习适合反复做。每题都按建模流程推导，不要急着看答案。

## 1. 博客 CMS

用户写文章，文章有草稿、审核、发布、归档。发布后编辑不能影响当前公开版本。文章有标签和 slug。

重点模式：

- 版本表
- 发布指针
- 标签
- slug redirect

## 2. 电商订单

用户购买多个商品。商品价格会变化。订单需要支付、退款和发票。

重点模式：

- Header + Lines
- 金额快照
- 支付事件
- 退款记录

## 3. 团队项目管理

用户创建团队，团队有成员和角色。项目属于团队，任务可以分配给成员。

重点模式：

- 多租户
- membership
- RBAC
- 任务状态

## 4. 订阅账单

用户订阅计划，价格会变化，一个用户同时只能有一个 active subscription。

重点模式：

- plan + price
- effective dating
- conditional unique
- invoices

## 5. 库存系统

商品分仓库管理库存。下单预留库存，发货扣减，取消释放。

重点模式：

- balance + movements
- transaction
- reservation
- adjustment

## 6. 私信系统

用户可以一对一或多人聊天。需要已读状态和消息列表。

重点模式：

- conversations
- participants
- messages
- last_read_at

## 7. 通知系统

系统给用户发送站内通知、邮件和 push。发送可能失败并重试。

重点模式：

- notification instance
- delivery jobs
- templates
- read status

## 8. AI 图片生成

用户输入 prompt，一次生成多张图。可以收藏、审核、重新生成。

重点模式：

- job table
- generated assets
- prompt snapshot
- review events
- versioning

## 9. 权限系统

团队成员有 owner、admin、member。不同项目可单独授权 viewer/editor。

重点模式：

- RBAC
- membership
- resource-level permissions
- conditional unique owner

## 10. 多语言商品目录

商品有多语言名称和描述，不同地区有不同价格和税率。

重点模式：

- translations
- regional prices
- effective dating
- currency

## 本章原则

> 练习时不要只画表，要解释每个实体、关系、状态、约束和快照为什么存在。

