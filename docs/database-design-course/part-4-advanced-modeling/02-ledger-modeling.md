# 02. 账本模型和不可变流水

账本模型用于表示钱、积分、库存、余额这类不能随意修改的数据。

核心思想：

> 不直接改历史余额，用不可变流水解释余额变化。

## 单式流水

简单余额系统：

```text
balance_entries
- id
- account_id
- amount_delta
- entry_type
- reference_type
- reference_id
- created_at
```

当前余额：

```text
sum(amount_delta)
```

也可以冗余存：

```text
accounts.current_balance
```

但流水仍是解释来源。

## 复式记账

钱从一个账户流向另一个账户，借贷必须平衡。

```text
journal_entries
- id
- reference_type
- reference_id
- created_at

journal_lines
- journal_entry_id
- account_id
- debit_amount
- credit_amount
```

每个 journal entry 的借贷总额必须相等。

## 不可变性

账本记录应该 append-only。

错误时新增调整分录，不修改旧分录。

```text
adjustment
reversal
refund
```

## 幂等

外部支付事件必须去重。

```text
unique(provider, provider_event_id)
```

同一支付成功事件不能重复入账。

## 本章原则

> 钱、积分、库存这类余额不要只存当前值；用不可变流水解释变化，用当前余额服务读取。

