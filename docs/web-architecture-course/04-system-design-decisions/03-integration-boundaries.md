# 03. 第三方集成和系统边界

现代网站经常依赖第三方服务：支付、邮件、AI、存储、搜索、分析。集成越多，越要设计边界。

## 常见外部服务

```text
支付：Stripe、PayPal
邮件：Resend、SendGrid、Mailchimp
对象存储：S3、R2
AI：OpenAI、OpenRouter、Anthropic
搜索：Meilisearch、Algolia、Elasticsearch
分析：GA、PostHog、Plausible
认证：Auth0、Clerk、OAuth provider
```

## 集成原则

第一，业务层不要到处直接调用 provider。

不推荐：

```text
页面组件 -> Stripe/OpenAI/S3 SDK
```

推荐：

```text
页面/Action -> 业务服务 -> provider adapter
```

这样未来换 provider 更容易。

第二，保存外部结果。

例如 AI 生成要保存：

```text
provider
model
prompt_snapshot
result_url
error_message
```

支付要保存：

```text
provider_payment_id
provider_event_id
raw_event
processed_at
```

第三，失败要可见。

所有外部服务都会失败。失败不是异常情况，而是常态之一。

## Provider Adapter

适配器模式可以统一接口：

```text
generateImage(input) -> result
uploadAsset(input) -> url
sendEmail(input) -> delivery
createCheckout(input) -> session
```

业务层依赖自己的接口，而不是依赖某个厂商的细节。

## Webhook 边界

Webhook 应该：

- 验签
- 记录原始事件
- 幂等处理
- 快速返回
- 复杂逻辑放队列

Webhook 不应该直接相信 payload，也不应该重复处理。

## 常见坑

第一，业务代码和 provider SDK 强耦合。

第二，没有保存 provider request id。

第三，没有失败重试。

第四，没有降级方案。

第五，Webhook 不验签。

## 决策清单

- 这个外部服务是否核心？
- 是否需要抽象 adapter？
- 是否保存原始结果？
- 失败后是否可重试？
- 是否需要降级？
- 是否有成本监控？
- 是否有速率限制？
- Webhook 是否验签和幂等？

