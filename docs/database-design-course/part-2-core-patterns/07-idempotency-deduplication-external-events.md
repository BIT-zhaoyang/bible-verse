# 07. 幂等、去重和外部事件

幂等是生产系统数据库设计里非常重要的模式。

幂等的意思是：同一个操作重复执行多次，业务结果仍然像执行一次。

## 为什么会重复

重复发生很常见：

- 用户重复点击提交按钮
- 浏览器重试请求
- 支付 webhook 重复投递
- cron 任务重复触发
- worker 崩溃后重试
- 队列消息至少一次投递

如果没有幂等设计，重复请求可能产生重复订单、重复扣款、重复发送、重复生成。

## 幂等 key

客户端或服务端为一次业务操作生成唯一 key。

```text
idempotency_keys
- key
- user_id
- request_hash
- response_snapshot
- status
- created_at
```

同一个 key 重复请求时，返回第一次结果。

适合：

- 创建订单
- 发起支付
- 创建导出任务
- 提交表单

## 外部事件去重

外部 provider 通常有事件 id。

```text
payment_events
- provider
- provider_event_id
- payload
- processed_at
```

加唯一约束：

```text
unique(provider, provider_event_id)
```

重复 webhook 写入时数据库直接拒绝，或应用层识别已处理。

## 业务唯一约束

很多幂等可以由业务唯一约束表达。

```text
unique(user_id, campaign_id) 防止重复发送同一活动邮件
unique(target_date, generation_version) 防止重复版本
unique(user_id) where subscription_status = 'active'
```

这些约束不仅防重复，也表达业务规则。

## Job claim 模式

多个 worker 处理任务时，需要防止同一任务被同时处理。

常见字段：

```text
status
locked_by
locked_at
attempt_count
```

worker 用事务把任务从 `pending` 改成 `processing`，成功抢占后再执行。

## 幂等不是简单“不报错”

重复请求应该返回一致业务结果，而不是简单吞掉错误。

例如重复创建订单：

- 如果第一次成功，第二次应返回同一个订单
- 如果第一次还在处理，第二次应返回处理中
- 如果 request body 不同但 key 相同，应拒绝

## 本章原则

> 凡是可能重复触发的动作，都要用幂等 key、外部事件唯一约束或业务唯一约束保护最终结果。

