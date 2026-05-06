# 06. 订阅、账单和发票

订阅系统比一次性订单更复杂，因为它有周期、计划变更、试用、账单、发票、支付失败和续费。

## Plan 和 Price

计划和价格建议拆开。

```text
plans
- id
- code
- name
- status

plan_prices
- id
- plan_id
- amount_cents
- currency
- interval
- effective_from
- effective_to
```

这样计划可以保留，价格可以历史化。

## Subscription

```text
subscriptions
- id
- user_id 或 tenant_id
- plan_id
- current_price_id
- status
- current_period_start
- current_period_end
- cancel_at_period_end
- created_at
```

状态：

```text
trialing
active
past_due
cancelled
expired
```

## 一个用户一个 active subscription

可以用条件唯一约束：

```text
unique(user_id) where status in ('trialing', 'active', 'past_due')
```

具体状态集合取决于业务。

## Invoice

```text
invoices
- id
- subscription_id
- status
- currency
- subtotal_cents
- tax_cents
- total_cents
- due_at
- paid_at

invoice_items
- id
- invoice_id
- description
- amount_cents
- period_start
- period_end
```

发票需要保存当时计划、价格、地址等快照。

## Subscription Events

```text
subscription_events
- subscription_id
- event_type
- from_status
- to_status
- metadata
- created_at
```

用于追踪续费、取消、恢复、支付失败。

## 本章原则

> 订阅模型要把计划、价格、订阅实例、账单周期、发票和 provider 事件分开，并用有效期和快照保护历史准确性。

