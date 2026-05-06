# 06. 有效期、时间范围和价格历史

有些数据不是简单的当前值，而是在某段时间内有效。

这类模型叫 effective dating。

## 常见场景

- 商品价格
- 订阅计划价格
- 汇率
- 员工职位
- 合同条款
- 权限授权
- 税率

## 基本结构

```text
product_prices
- id
- product_id
- amount_cents
- currency
- effective_from
- effective_to
```

查询某个时间点有效价格：

```text
effective_from <= target_time
and (effective_to is null or effective_to > target_time)
```

常见约定：

- `effective_from` 包含
- `effective_to` 不包含
- `effective_to null` 表示当前仍有效

## 防止时间范围重叠

同一个对象的有效期通常不能重叠。

坏数据：

```text
price A: Jan 1 - Feb 1
price B: Jan 15 - Mar 1
```

同一天有两个价格。

Postgres 可以用 exclusion constraint 严格防止重叠。简单系统也可以先在应用层检查，并加唯一约束辅助。

## 当前值冗余

为了读取方便，有时主表会存当前价格：

```text
products.current_price_id
```

或：

```text
products.current_price_cents
```

这是一种读优化。必须明确价格历史表才是事实源，当前字段是缓存或指针。

## 生效时间和创建时间不同

不要混淆：

- `created_at`：这条记录什么时候写入数据库
- `effective_from`：业务上什么时候开始有效

例如今天录入一个下周生效的新价格：

```text
created_at = today
effective_from = next_monday
```

## 未来排期

有效期模型天然支持未来排期。

例如：

```text
明天开始涨价
下个月套餐变更
年底合同到期
```

这比直接覆盖当前值更可控。

## 本章原则

> 当数据随时间生效和失效时，用有效期表表达时间范围，不要只覆盖当前值。

