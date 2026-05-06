# 04. 审计日志和状态事件

很多系统需要知道“谁在什么时候做了什么”。

这就是审计日志和状态事件的价值。

## 审计日志

审计日志记录操作。

典型字段：

```text
audit_logs
- id
- actor_id
- action
- resource_type
- resource_id
- before_snapshot
- after_snapshot
- metadata
- created_at
```

适合：

- 后台管理
- 权限敏感操作
- 财务数据修改
- 用户隐私数据访问
- 内容审核

## before 和 after

如果要知道改了什么，可以保存修改前后快照。

```text
before_snapshot jsonb
after_snapshot jsonb
```

这不是事实源，而是审计证据。通常不会用于核心业务查询。

## 状态事件

状态事件专门记录状态变化。

```text
order_status_events
- order_id
- from_status
- to_status
- changed_by
- reason
- created_at
```

它比通用审计日志更适合分析流程：

- 平均审核耗时
- 订单在哪个阶段卡住
- 谁拒绝了申请
- 失败原因分布

## 当前状态和事件历史

通常两者都要：

```text
orders.status
order_status_events
```

当前状态方便查询，事件历史方便追溯。

不要为了“纯粹事件化”牺牲常用查询，除非你确实采用事件溯源架构。

## 什么时候需要审计

问这些问题：

- 这个动作是否影响钱、权限、隐私或公开内容？
- 出问题时是否需要追责？
- 是否需要合规记录？
- 是否需要分析流程耗时？
- 是否有管理员后台操作？

如果是，至少要保留轻量审计字段：

```text
created_by
updated_by
approved_by
approved_at
```

更强需求再加 audit log。

## 审计日志的注意事项

- 审计日志最好 append-only
- 不要把审计日志当业务事实源
- 注意隐私字段，不要无脑保存敏感信息
- 保存 actor、resource、action、time 四要素
- 对高价值操作，审计写入应和业务操作在同一事务

## 本章原则

> 当前状态回答“现在是什么”，状态事件回答“怎么变成这样”，审计日志回答“谁做了什么”。

