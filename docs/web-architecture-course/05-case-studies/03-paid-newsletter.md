# 03. 案例：付费 Newsletter

付费 Newsletter 是内容站、邮件系统和订阅权益的组合。

## 一句话定义

```text
这是一个帮助作者发布免费和付费文章，并通过邮件触达订阅者的内容订阅网站。
```

## 角色

```text
游客：阅读免费内容，订阅邮件
免费订阅者：接收免费邮件
付费会员：阅读付费内容
作者：创建和发送文章
管理员：管理订阅、支付和内容
系统任务：定时发送邮件和同步订阅状态
```

## 核心资源

```text
Post
Issue
Subscriber
Subscription
Payment
EmailDelivery
Entitlement
```

## 核心流程

```text
作者写文章
-> 选择免费或付费
-> 定时发布
-> 发送邮件
-> 用户点击回到详情页
-> 付费内容校验权益
```

## 内容状态

```text
draft -> scheduled -> published
draft -> sent_as_email
```

邮件发送状态：

```text
pending -> sending -> delivered/bounced/failed
```

订阅状态：

```text
free
trialing
active
past_due
canceled
```

## 页面结构

公开侧：

```text
首页
文章详情
归档
订阅页
价格页
支付成功页
退订页
```

作者后台：

```text
文章编辑
发布排期
订阅者列表
邮件发送记录
收入看板
```

## 权益设计

付费内容访问判断：

```text
post.visibility == public -> 可读
post.visibility == subscriber -> 免费订阅可读
post.visibility == paid -> active paid subscription 可读
```

不要只用前端隐藏正文。服务端要控制返回内容。

## 常见坑

- 邮件订阅没有确认和退订
- 支付成功只靠前端跳转
- 付费内容在 API 中泄漏
- 邮件发送失败没有记录
- 没有区分文章发布和邮件发送

## MVP

最小闭环：

```text
作者发布文章 -> 用户订阅 -> 用户收到邮件 -> 用户阅读 -> 付费用户访问付费内容
```

可以先暂缓评论、推荐和复杂作者协作。

