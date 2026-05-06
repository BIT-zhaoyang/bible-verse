# 05. 生命周期、状态机和工作流

真实业务对象通常会经历流程。

文章会从草稿到发布。订单会从待支付到已发货。任务会从 pending 到 processing，再到 succeeded 或 failed。

如果只随手加几个布尔字段，很快会变成混乱组合：

```text
is_published = true
is_rejected = true
is_archived = false
approved_at = null
```

数据库建模需要把生命周期想清楚。

## 状态字段表达当前节点

状态字段适合表达对象当前处于哪一步。

```text
draft
review_required
approved
published
archived
```

状态字段比多个布尔值更适合复杂流程。

布尔字段适合简单开关：

```text
is_active
email_verified
```

但一旦状态超过两个互斥阶段，就应优先考虑 enum。

## 状态机表达合法转移

列出状态还不够，还要想清楚状态能怎么转移。

例子：

```text
draft -> review_required
review_required -> approved
review_required -> rejected
approved -> published
published -> archived
```

你不一定要在数据库里强制所有转移，但业务代码、测试和文档应该清楚。

## 时间戳和状态配合使用

时间戳记录关键状态发生的时间。

```text
approved_at
published_at
cancelled_at
deleted_at
```

状态和时间戳要一致：

```text
status = 'published'
published_at 不应该为空
```

时间戳不是状态的替代品。只有 `published_at` 而没有 `status`，当业务增加 rejected、archived、scheduled 时会很难扩展。

## 当前状态和状态历史

如果只需要当前状态，表上一个 `status` 字段够用。

如果需要完整过程，就加状态事件表：

```text
order_status_events
- order_id
- from_status
- to_status
- changed_by
- changed_at
- reason
```

常见使用场景：

- 订单履约
- 审批流
- 内容审核
- 工单系统
- 任务处理

当前状态用于快速查询，事件表用于审计和分析。

## 工作流表

复杂审批可能需要更通用的工作流模型。

```text
workflow_instances
- id
- resource_type
- resource_id
- status

workflow_steps
- id
- workflow_instance_id
- step_name
- assignee_id
- status
- completed_at
```

这种模型灵活，但复杂。早期不要为了“通用”过早引入。多数产品一开始用明确业务表更清楚。

## 任务生命周期

异步任务常见状态：

```text
pending
processing
succeeded
failed
cancelled
```

典型字段：

```text
attempt_count
error_message
started_at
finished_at
provider
provider_request_id
```

邮件发送、图片生成、文件导出、视频转码都适合这个模式。

## 本章原则

> 只要对象会经历流程，就要设计状态集合、合法转移、关键时间戳，以及是否需要状态历史。

