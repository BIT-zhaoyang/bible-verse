# 08. 支付、订阅、套餐和权益

支付系统的难点不只是“收钱”，而是收钱之后如何正确开通、限制和回收权益。

## 常见收费模式

- 一次性支付
- 订阅
- 按量计费
- 余额充值
- 会员等级
- 平台抽佣
- 免费试用后转付费

不同收费模式对应不同数据结构。

## 核心资源

常见资源：

```text
Customer
Product
Price
Order
Payment
Subscription
Invoice
Entitlement
UsageRecord
WebhookEvent
```

订阅产品尤其要区分：

```text
支付状态
订阅状态
权益状态
用量状态
```

用户付过一次钱，不代表当前仍有权益。

## 支付流程

典型流程：

```text
创建订单
创建支付会话
用户跳转支付
支付平台发送 Webhook
服务端验签
更新支付状态
开通权益
显示成功页
```

真正可信的是服务端 Webhook，不是前端成功跳转。

## 订阅状态

常见订阅状态：

```text
trialing
active
past_due
canceled
expired
```

权益判断通常基于：

```text
subscription.status
current_period_end
plan limits
usage records
```

## 权益设计

权益是“用户能用什么”。

例子：

```text
每月 100 次生成
最多 3 个项目
可导出高清图片
可访问会员文章
可邀请 10 个成员
```

最好把权益判断集中到服务层，不要散落在各个页面。

## Webhook 事件表

建议记录支付平台事件：

```text
id
provider
provider_event_id
event_type
payload
processed_at
error_message
created_at
```

这样可以幂等处理、排查问题和重放事件。

## 常见坑

第一，以前端成功页作为支付成功依据。

第二，没有处理退款和取消。

第三，订阅过期后权益仍然可用。

第四，Webhook 重复触发导致重复开通。

第五，没有用量记录，无法限制套餐。

## 决策清单

- 收费模式是什么？
- 是否需要订单？
- 是否需要订阅？
- 是否需要用量？
- 权益如何判断？
- 支付结果以什么为准？
- Webhook 是否验签？
- 是否记录 Webhook 事件？
- 是否处理退款和取消？
- 是否需要发票？

## 练习

为一个 AI 写作工具设计免费版和付费版：

- 免费版每月 20 次生成
- Pro 每月 1000 次生成
- 超额后提示升级
- 订阅取消后下个周期失效

