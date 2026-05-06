# 01. 事件溯源

事件溯源是一种高级建模方式：不把当前状态当成唯一事实源，而是把事件序列作为事实源。

普通模型：

```text
orders.status = paid
```

事件溯源模型：

```text
OrderCreated
PaymentReceived
OrderMarkedPaid
```

当前状态由事件重放得到。

## 事件表

```text
events
- id
- aggregate_type
- aggregate_id
- event_type
- event_version
- payload
- occurred_at
```

aggregate 是业务聚合，比如 order、account、subscription。

## 优点

- 完整历史天然存在
- 可以重建任意时刻状态
- 审计能力强
- 适合复杂状态变化
- 可以从事件生成多个读模型

## 代价

- 查询当前状态更复杂
- 事件 schema 演进困难
- 开发心智负担高
- 需要投影和重放机制
- 不适合简单 CRUD

## Snapshot

事件很多时，重放会慢。可以保存快照：

```text
aggregate_snapshots
- aggregate_type
- aggregate_id
- version
- state
- created_at
```

读取时从最近快照开始重放后续事件。

## 什么时候用

适合：

- 金融账务
- 库存流水
- 审批流程
- 协作编辑
- 需要强审计的系统

不适合：

- 简单 CMS
- 普通用户资料
- 小型后台 CRUD

## 本章原则

> 事件溯源把“发生过什么”作为事实源；它强大但复杂，只有当历史和重放能力本身是核心需求时才值得使用。

