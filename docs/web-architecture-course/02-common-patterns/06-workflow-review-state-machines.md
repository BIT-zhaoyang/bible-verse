# 06. 状态机、审核和工作流

只要业务里出现“提交、审核、批准、拒绝、支付、发货、退款、生成、重试”，就需要状态机思维。

## 状态机解决什么

状态机解决三个问题：

```text
现在是什么状态？
允许从哪里到哪里？
谁能触发状态变化？
```

没有状态机，代码会充满互相矛盾的布尔字段。

## 基本结构

以内容审核为例：

```text
状态：
draft
review_required
approved
published
rejected
archived

动作：
submit
approve
reject
publish
archive
```

合法跳转：

```text
draft -> review_required
review_required -> approved
review_required -> rejected
approved -> published
published -> archived
```

## 审核队列

审核功能通常需要：

- 待审核列表
- 预览
- 通过
- 拒绝
- 拒绝原因
- 重新提交
- 审核记录
- 批量审核

AI 生成内容尤其适合审核队列，因为生成结果不稳定。

## 状态历史

最小系统可以只在主表放 `status`。

成熟系统建议加状态事件表：

```text
id
resource_type
resource_id
from_status
to_status
action
actor_id
reason
metadata
created_at
```

状态历史能回答：

- 谁批准的？
- 为什么拒绝？
- 什么时候从待审核变成已发布？
- 是否发生过回滚？

## 幂等性

状态操作要考虑重复提交。

例如支付 Webhook 可能重复发送，定时任务可能重复执行，用户可能连点按钮。

幂等设计要求：

```text
重复执行同一个动作，不会产生错误的重复结果。
```

常见做法：

- 唯一约束
- 事件去重
- 检查当前状态
- 外部 request id
- 事务

## 常见坑

第一，把 `approved` 和 `published` 混为一谈。批准不等于已经公开。

第二，没有非法跳转限制。

第三，没有记录操作者。

第四，拒绝没有原因。

第五，状态字段太多，含义重叠。

## 决策清单

- 资源有哪些状态？
- 初始状态是什么？
- 终态有哪些？
- 哪些动作改变状态？
- 哪些角色能执行动作？
- 是否需要原因字段？
- 是否需要状态历史？
- 是否需要幂等？
- 是否需要回滚？

## 练习

为一个电商订单设计状态机，至少包含：

- 待支付
- 已支付
- 已取消
- 已发货
- 已完成
- 退款中
- 已退款

