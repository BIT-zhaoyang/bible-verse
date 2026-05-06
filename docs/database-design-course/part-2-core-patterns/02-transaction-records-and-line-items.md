# 02. 交易记录和明细行

交易记录是业务系统中最常见、也最重要的模式之一。

这里的“交易”不只指数据库 transaction，也指业务上的一次交易或业务事实：

- 订单
- 发票
- 支付
- 退款
- 入库单
- 出库单
- 转账
- 订阅账单

这类数据通常需要稳定、可追溯，不能随意覆盖。

## Header + Lines 模式

交易记录经常拆成表头和明细行。

```text
orders
- id
- user_id
- status
- total_amount
- created_at

order_items
- id
- order_id
- product_id
- quantity
- unit_price_snapshot
- line_total
```

`orders` 表示这笔订单整体。  
`order_items` 表示订单里的每一项。

## 为什么要拆明细行

因为一笔交易通常包含多个项目，而每个项目有自己的数量、单价、折扣、税费。

这些属性不属于商品本身，也不属于订单整体，而属于“这笔订单里的这个商品”。

这就是关系实体。

## 快照字段

交易明细经常保存快照。

```text
product_name_snapshot
unit_price_snapshot
tax_rate_snapshot
shipping_address_snapshot
```

原因是历史交易不能被当前主数据污染。

商品改名、涨价、用户改地址，都不应该改变已经下单的订单。

## 状态和金额

交易记录通常有状态：

```text
pending
paid
cancelled
refunded
completed
```

金额字段要特别谨慎：

- 使用整数保存最小货币单位，避免浮点误差
- 保存币种
- 明确正负号含义
- 不要让金额可随意 update

示例：

```text
amount_cents integer
currency text
```

## 总额是否应该保存

订单总额可以由明细行求和得到，为什么还要存？

因为总额是交易确认时的业务事实，也是高频读取字段。保存总额是合理反规范化。

但要保证写入时一致：

- 同一事务写入订单和明细
- 后续不要随意改明细
- 必要时用校验任务检查总额

## 交易记录的不可变性

交易类数据越靠近财务，越应该避免直接修改。

错误处理更常见的方式是新增调整记录：

```text
refunds
credit_notes
inventory_adjustments
ledger_entries
```

而不是把旧订单金额改掉。

## 常见约束

```text
order_items.order_id -> orders.id
order_items.product_id -> products.id
quantity > 0
amount_cents >= 0
unique(order_id, product_id) 可选
```

是否需要 `unique(order_id, product_id)` 取决于业务。允许同一商品分多行应用不同折扣时，就不能加。

## 常见反模式

- 把多个商品 id 存在订单表的 JSON 数组里
- 订单只存当前商品价格，不存价格快照
- 用浮点数保存金额
- 修改历史订单来表达退款
- 没有支付事件表，无法对账

## 本章原则

> 交易记录通常用 Header + Lines 表达；明细行保存关系属性和历史快照，财务相关数据尽量追加记录而不是覆盖旧事实。

