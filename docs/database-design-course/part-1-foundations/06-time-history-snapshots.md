# 06. 时间、历史和快照

时间是数据库设计里最容易被低估的维度。

很多系统一开始只关心当前值。等到要查历史、审计、账单、报表、回滚时，才发现旧数据已经被 update 覆盖。

本章讲三件事：

- 当前值
- 历史记录
- 快照

## 当前值

当前值表示对象现在的状态。

```text
users.current_email
subscriptions.status
products.current_price
```

当前值适合快速读取，但它会变化。

如果历史不重要，保存当前值就够了。如果历史重要，只保存当前值就危险。

## 历史记录

历史记录保存过去发生过的变化。

```text
price_history
status_events
login_events
audit_logs
```

历史表通常是 append-only，尽量不修改旧记录。

它能回答：

- 什么时候变的？
- 谁改的？
- 从什么变成什么？
- 为什么变？

## 快照

快照保存某个时刻的一份数据。

例子：

- 订单里的商品价格快照
- 发票里的客户地址快照
- 邮件发送时的模板内容快照
- AI 生成时的 prompt 快照

快照和历史表不同。历史表记录变化过程，快照记录某个业务对象在某个时刻需要保留的一份值。

## 有效期

有些数据在时间范围内有效。

```text
product_prices
- product_id
- amount
- effective_from
- effective_to
```

这适合：

- 价格历史
- 订阅计划
- 汇率
- 员工职位
- 权限授权

查询某天有效值：

```text
effective_from <= date
and (effective_to is null or effective_to > date)
```

## created_at 和 updated_at

几乎所有业务表都应该有：

```text
created_at
updated_at
```

但它们不是审计系统。

`updated_at` 只能告诉你最后一次更新是什么时候，不能告诉你谁改了、改了什么、之前是什么。

如果需要这些信息，要设计 audit log 或 status event。

## deleted_at

`deleted_at` 是软删除的常见字段。

```text
deleted_at null 表示未删除
deleted_at 有值表示已删除
```

软删除适合需要恢复或审计的数据，但会让所有查询都必须过滤 `deleted_at is null`。

不要无脑软删除。session、缓存、临时任务可以物理删除。

## 时区和日期

时间建模要区分：

- 精确时刻：timestamp with time zone
- 业务日期：date 或 `YYYY-MM-DD`
- 本地时间规则：timezone

例如“2026-05-07 发布”是业务日期。  
“管理员在某个瞬间审核通过”是精确时刻。

不要混淆业务日期和时间戳。

## 本章原则

> 当前值服务读取，历史记录服务追溯，快照服务历史准确性；时间字段必须表达清楚它是业务日期还是精确时刻。

