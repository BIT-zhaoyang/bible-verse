# 10. AI 生成、审核和资产管理

AI 生成类产品越来越常见。它们的数据库设计重点是：任务可追踪、prompt 可解释、产物可版本化、审核可回溯。

## 生成请求

```text
generation_requests
- id
- user_id
- prompt_snapshot
- provider
- model
- status
- error_message
- created_at
```

prompt 一定要保存快照，因为用户之后可能修改输入，模型配置也可能变化。

## 生成产物

一次请求可能生成多张图或多个文本结果。

```text
generated_assets
- id
- request_id
- asset_type
- url
- mime_type
- width
- height
- status
- created_at
```

请求和产物拆开，支持一对多。

## 审核

```text
asset_reviews
- id
- asset_id
- reviewer_id
- decision
- reason
- created_at
```

如果只需要当前审核结果，可以在 asset 上存 `review_status`。如果需要历史，则加 review 表。

## Provider metadata

外部 provider 返回的 request id、seed、usage、raw response 可以存 metadata。

```text
provider_request_id
provider_metadata jsonb
```

metadata 适合 jsonb，因为不同 provider 结构不同。

## 版本和替换

如果一个目标可以多次生成：

```text
target_id
generation_version
unique(target_id, generation_version)
```

最终采用哪个版本，可以用 current pointer 或 publication table。

## 存储资产

```text
assets
- id
- storage_provider
- bucket
- key
- public_url
- checksum
- size_bytes
```

不要只存 URL。生产系统里 key、provider、checksum 对迁移和排查很有用。

## 本章原则

> AI 生成模型要把请求、产物、审核、provider 元数据和最终采用结果分开；prompt、模型和产物地址都要可追溯。

