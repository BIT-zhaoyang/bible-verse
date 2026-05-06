# 05. 电商订单、支付和退款

电商系统是数据库建模的经典练习，因为它同时涉及主数据、交易、快照、状态、支付事件和退款。

## 商品

```text
products
- id
- sku
- name
- status
- current_price_id
```

商品当前信息可以变化，但历史订单需要快照。

## 订单和明细

```text
orders
- id
- user_id
- status
- currency
- subtotal_cents
- tax_cents
- shipping_cents
- total_cents
- created_at

order_items
- id
- order_id
- product_id
- sku_snapshot
- product_name_snapshot
- unit_price_cents
- quantity
- line_total_cents
```

金额用整数最小单位，不用浮点数。

## 支付

一笔订单可能有多次支付尝试。

```text
payments
- id
- order_id
- provider
- provider_payment_id
- amount_cents
- status
- created_at
```

约束：

```text
unique(provider, provider_payment_id)
```

## Provider 事件

webhook 可能重复发送。

```text
payment_events
- id
- provider
- provider_event_id
- payload
- processed_at
```

约束：

```text
unique(provider, provider_event_id)
```

## 退款

退款不要简单修改订单金额。

```text
refunds
- id
- payment_id
- amount_cents
- reason
- status
- provider_refund_id
- created_at
```

订单可以通过支付和退款记录计算净额。

## 状态

订单状态和支付状态不同。

```text
orders.status = pending_payment | paid | fulfilled | cancelled | refunded
payments.status = requires_action | succeeded | failed | refunded
```

不要混在一个字段里。

## 本章原则

> 电商模型要区分商品当前信息、订单历史快照、支付尝试、外部事件和退款调整；钱相关数据尽量追加记录而不是覆盖。

