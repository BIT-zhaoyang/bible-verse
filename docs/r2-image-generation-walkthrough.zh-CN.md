# R2 图片生成与上传全流程讲解

英文版： [r2-image-generation-walkthrough.md](/Users/bytedance/Work/bible-verse/docs/r2-image-generation-walkthrough.md)

这份文档会从头到尾讲清楚，这个项目是如何：

- 发起一次图片生成任务，
- 生成三张 SVG 资产，
- 决定把图片写到本地还是 Cloudflare R2，
- 通过 S3 兼容接口把对象上传到 R2，
- 把公开 URL 存进数据库，
- 最后再由浏览器和社交平台爬虫读取这些 URL。

它不是一份只给熟手查阅的速查表，而是一份教学文档。读完之后，你应该能够自己解释清楚：

- 一次生成是从哪里开始的，
- 图片是在什么地方生成的，
- 存储决策是在什么地方做的，
- Cloudflare R2 和 S3 到底是什么关系，
- 为什么会出现两个不同的 R2 相关 host，
- 每个环境变量分别负责什么，
- 验证命令到底会不会改数据库和对象存储。

如果你只想看短一点的参考版，可以看 [r2-storage-flow.md](/Users/bytedance/Work/bible-verse/docs/r2-storage-flow.md)。

## 1. 这个应用到底在做什么

从业务上看，这是一个“每日经文发布”应用。

针对某一个日期，它会：

1. 选择一节符合条件的经文，
2. 生成一张 source 背景图，
3. 生成两张分享卡片图，
4. 把这些图片资产写入存储，
5. 把最终公开 URL 存入数据库，
6. 后续再由公开页面和社交分享元数据使用这些 URL。

整条链路里最核心的业务函数是 [src/lib/publication.ts](/Users/bytedance/Work/bible-verse/src/lib/publication.ts) 里的 [`generateCandidateForDate()`](/Users/bytedance/Work/bible-verse/src/lib/publication.ts)。

你可以把它理解成整条流程的总调度器。

## 2. 一次生成任务是从哪里开始的

一次生成可能从几个入口开始：

- cron 路由：[src/app/api/cron/generate-next/route.ts](/Users/bytedance/Work/bible-verse/src/app/api/cron/generate-next/route.ts)
- 后台动作：[src/app/admin/actions.ts](/Users/bytedance/Work/bible-verse/src/app/admin/actions.ts)
- 验证脚本：[scripts/verify-r2-generation.ts](/Users/bytedance/Work/bible-verse/scripts/verify-r2-generation.ts)

这些入口本身并不直接生成图片，也不直接把图片传到 R2。

它们真正做的是：

1. 决定一个 `targetDate`
2. 调用共享业务函数 `generateCandidateForDate()`

### 以 cron 路由为例

cron 路由主要做两件事：

1. 如果今天的记录已经批准且日期到了，就把它标记为已发布
2. 为明天生成候选内容

所以 cron 路由只是“触发器”，不是“图片生成器”。

## 3. `generateCandidateForDate()` 里面到底发生了什么

当 `generateCandidateForDate(targetDate, triggerType)` 开始运行时，大致会按下面的顺序执行：

1. 先检查目标日期是不是已经有受保护状态的候选记录
2. 选择一节适合该日期的经文
3. 计算这次生成应该使用的 `generationVersion`
4. 往 `image_generations` 表里插入一条新记录
5. 把该记录状态从 `pending` 更新为 `processing`
6. 生成三份 SVG 资产
7. 把这三份资产写入存储
8. 再把生成出来的 URL 和最终状态更新回数据库

这里最重要的理解是：

- 这个函数既管理数据库状态，
- 也管理文件存储状态。

它不是一个“只负责出图”的函数，而是整个生成流程的编排器。

## 4. 会创建哪条数据库记录

一次生成任务最重要的数据库记录，存在 [src/db/schema.ts](/Users/bytedance/Work/bible-verse/src/db/schema.ts) 定义的 `image_generations` 表里。

其中最关键的字段有：

- `targetDate`
- `provider`
- `providerModel`
- `promptSnapshot`
- `sourceImageUrl`
- `cardImageSimpleUrl`
- `cardImageExtendedUrl`
- `storageProvider`
- `status`
- `generationVersion`

这张表的重要性在于：

应用后续不会重新推导图片路径，而是直接从数据库读已经保存好的 URL。

所以数据库不是这个流程里的附属品，而是核心一环。

## 5. 三张图片资产是怎么生成出来的

每一次生成任务，目前都会产出三张 SVG：

1. 一张 source 背景图
2. 一张 simple 卡片图
3. 一张 extended 卡片图

### 5.1 Source 背景图

这部分来自 [src/lib/ai.ts](/Users/bytedance/Work/bible-verse/src/lib/ai.ts)。

当前实现会根据配置，选择“本地确定性 SVG 背景”或“真实外部 AI 图片服务”来生成背景图。

所以当你看到：

- `AI_PROVIDER`
- `AI_PROVIDER_MODEL`

这些字段时，现在它们可以工作在三种模式下：

- `AI_PROVIDER=mock`：走本地 SVG 背景生成
- `AI_PROVIDER=openai`：走真实 OpenAI 图片生成
- `AI_PROVIDER=openrouter`：走真实 OpenRouter 图片生成

当 `AI_PROVIDER=openai` 且没有显式设置 `AI_PROVIDER_MODEL` 时，应用会默认使用 `gpt-image-2`。

当 `AI_PROVIDER=openrouter` 且没有显式设置 `AI_PROVIDER_MODEL` 时，应用会默认使用 `google/gemini-3.1-flash-image-preview`，也就是 Nano Banana 2。

换句话说：

- 流程原本就支持 mock provider，
- 现在也可以为 source 背景图调用真实 OpenAI 或 OpenRouter provider。

### 5.2 Card 图片

两张卡片来自 [src/lib/cards.ts](/Users/bytedance/Work/bible-verse/src/lib/cards.ts)。

它会把这些输入：

- `verseText`
- `explanationText`
- `referenceText`
- `siteName`
- `palette`
- `variant`

拼成最终的 SVG 卡片内容。

两个变体是：

- `simple`
- `extended`

对应的对象 key 形态是：

- `cards/<date>/generation-<version>-simple.svg`
- `cards/<date>/generation-<version>-extended.svg`

source 背景图的 key 形态是：

- `sources/<date>/generation-<version>.svg`

## 6. 应用怎么决定把文件写到哪里

这一层逻辑在 [src/lib/storage.ts](/Users/bytedance/Work/bible-verse/src/lib/storage.ts)。

对外最重要的函数是：

- `uploadAsset()`

内部实际上有两条路径：

- `uploadLocal()`
- `uploadR2()`

### 6.1 本地路径

如果上传配置不完整，应用会把文件写到：

- `public/generated/...`

这样这些文件就能通过应用自己的公开站点地址被访问到。

### 6.2 R2 路径

如果所需的上传变量都存在，应用就会创建一个 S3 兼容客户端，然后把对象写到 Cloudflare R2。

这里最重要的分支规则是：

- 缺少上传凭据或缺少 `R2_BUCKET` -> 回退到本地文件系统
- 上传凭据和 bucket 都齐全 -> 走 R2 上传路径

## 7. R2 和 S3 到底是什么关系

这通常是第一次接触这类系统时最容易混淆的地方。

### 简短版

Cloudflare R2 是存储服务。

S3 是客户端与对象存储通信时采用的 API/协议形态。

### 更准确的说法

这个项目里使用的客户端库是：

- `@aws-sdk/client-s3`

但它并不是把文件上传到 AWS S3。

它上传的其实是 Cloudflare R2。

之所以能这样做，是因为 R2 提供了 S3-compatible API，也就是 S3 兼容接口。

实际含义是：

只要某个客户端会说 “S3 这套协议”，它就可以在正确配置 endpoint 的前提下，把请求发给 R2。

Cloudflare 当前官方文档把 R2 描述为支持 S3 API 兼容，并给出对应 endpoint：

- `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

官方参考：

- [Cloudflare R2 S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/)
- [Cloudflare R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)

所以在这个仓库里：

- AWS SDK 是客户端工具
- S3 是协议形状
- Cloudflare R2 才是实际承载对象的存储服务

## 8. 最关键的区别：两个 host，两种用途

这个项目里有两个不同的 R2 相关 host，而且它们服务于完全不同的任务。

这不是巧合，而是正确设计。

### 8.1 上传 / S3 API host

这个 host 是：

- `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

它用于服务端上传对象。

AWS SDK 会把签名过的 `PutObject` 请求发到这里。

### 8.2 浏览器 / 公网 host

这个 host 是：

- `R2_PUBLIC_BASE_URL`

它是在上传已经完成之后才会被使用。

数据库里保存下来的，最终被下面这些消费者读取的，就是这个 host：

- 浏览器
- Open Graph 爬虫
- Twitter 爬虫

在这个仓库里，这个公网 host 当前可能是一个 `r2.dev` URL，用于开发阶段。按照 Cloudflare 当前官方文档，`r2.dev` 更适合开发用途；如果是正式生产环境，更推荐使用自定义域名作为公开访问入口。

### 为什么这个区别重要

上传 host 用于带认证的写操作。

公网 host 用于后续的公开读操作。

如果把两者混为一谈，通常就会出现两类典型错误：

- 把 S3 API endpoint 当成浏览器应该访问的图片地址
- 误以为拿到一个 public URL 就足够完成上传

两者之所以不同，是因为任务本来就不同。

## 9. 上传时到底发生了什么认证

上传认证只发生在服务端。

浏览器完全不参与。

在 `src/lib/storage.ts` 里，应用会用这些值来构建 `S3Client`：

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_REGION`

然后再向目标 bucket 发送 `PutObject` 请求。

这里最关键的概念是：

- AWS SDK 会对请求进行签名
- R2 会校验这个签名
- 签名正确，R2 才接受写入

这意味着下面这两个值：

- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

本质上是服务端专用的上传认证凭据。

它们绝对不应该发给浏览器。

## 10. 上传成功之后会发生什么

一旦上传完成，存储层会返回一个结果，里面至少包括：

- `provider`：`local` 或 `r2`
- `url`：面向浏览器的公开 URL

然后 `generateCandidateForDate()` 会把这些信息写回 generation 记录：

- `sourceImageUrl`
- `cardImageSimpleUrl`
- `cardImageExtendedUrl`
- `storageProvider`

从这一步开始，应用的其他部分就只需要读这些已经保存好的 URL。

后续页面不需要知道图片当初是怎么传上去的。

在当前实现里，生成出来的背景图还会被嵌入最终的 SVG 卡片中，所以 OpenAI 生成的背景会真实影响用户看到的 simple / extended 卡片。

这是一个很干净的职责分离：

- 生成和存储只做一次
- 展示和读取在后续页面里发生

## 11. 哪些页面会消费这些 URL

会使用这些 URL 的公开页面包括：

- [src/app/page.tsx](/Users/bytedance/Work/bible-verse/src/app/page.tsx)
- [src/app/archive/page.tsx](/Users/bytedance/Work/bible-verse/src/app/archive/page.tsx)
- [src/app/verse/[slug]/page.tsx](/Users/bytedance/Work/bible-verse/src/app/verse/[slug]/page.tsx)

### 首页

首页会渲染：

- 当天的卡片
- 最近归档的缩略图

### Archive 页

Archive 页会用保存下来的 card URL 渲染缩略图。

### Verse 详情页

这个页面特别关键，因为它会在两个地方使用图片 URL：

1. 页面正文展示
2. Open Graph / Twitter metadata

所以 `R2_PUBLIC_BASE_URL` 不只是要能被普通浏览器访问，还必须能被社交平台爬虫读取。

## 12. 每个 R2 相关环境变量分别负责什么

这一节不只讲每个变量单独的作用，也讲它们之间的关系。

### `R2_ACCOUNT_ID`

作用：

- 标识 Cloudflare account
- 用来构造 S3 兼容上传 endpoint
- 在代码里也参与推导 fallback public URL

关系：

- 它影响上传 host 的构造
- 但它不能替代 `R2_PUBLIC_BASE_URL`

### `R2_ACCESS_KEY_ID`

作用：

- 服务端 SDK 上传认证时使用的 access credential

关系：

- 它必须和 `R2_SECRET_ACCESS_KEY` 配对使用
- 它不应该出现在浏览器侧

### `R2_SECRET_ACCESS_KEY`

作用：

- 上传认证凭据对中的 secret 一半
- 用于签名请求

关系：

- 必须只保留在服务端
- 对公开读取没有作用

### `R2_BUCKET`

作用：

- 指定生成出来的对象最终写入哪个 bucket

关系：

- 如果它缺失，应用就无法走 R2 上传路径，只能回退到本地

### `R2_PUBLIC_BASE_URL`

作用：

- 定义上传完成后给浏览器使用的目标公开基址

关系：

- 它和上传签名无关
- 它决定最终写进数据库的公开 URL 长什么样
- 如果它缺失，应用仍可能上传到 R2，但会保存一个代码推导出的 fallback URL

### `R2_REGION`

作用：

- 传给 S3 client 的 region 配置

关系：

- 对 R2 来说通常用 `auto`

### `OPENAI_API_KEY`

作用：

- 当 `AI_PROVIDER=openai` 时，用于认证服务端发往 OpenAI Images API 的请求。

关系：

- 只在 OpenAI provider 路径里需要，
- 必须保留在服务端，
- 与 R2 上传认证没有直接关系。

### `OPENROUTER_API_KEY`

作用：

- 当 `AI_PROVIDER=openrouter` 时，用于认证服务端发往 OpenRouter 图片生成接口的请求。

关系：

- 只在 OpenRouter provider 路径里需要，
- 必须保留在服务端，
- 与 R2 上传认证没有直接关系。

## 13. 这些变量是如何协同工作的

把 R2 相关变量分成两组来理解会更清楚。

### A 组：上传凭据与目标位置

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_REGION`

这一组变量让“带认证的写入”成为可能。

### B 组：公开交付

- `R2_PUBLIC_BASE_URL`

这一组变量决定最终给浏览器看的 URL 会不会落在你真正想要的公开 host 上。

### 不同配置下会发生什么

#### 情况 1：上传变量完整，`R2_PUBLIC_BASE_URL` 也存在

结果：

- 图片上传到 R2
- 数据库里保存的是你真正想要的公开 host

这是最理想的配置。

#### 情况 2：上传变量缺失

结果：

- 应用回退到本地存储
- 文件写到 `public/generated/...`

#### 情况 3：上传变量存在，但 `R2_PUBLIC_BASE_URL` 缺失

结果：

- 图片仍然会上传到 R2
- 但数据库里存的是推导出来的 bucket/account URL，而不是你真正想要的公开 host

这种情况可能能用，但不是最干净、最推荐的正式配置。

## 14. 验证脚本实际上会做什么

验证命令是：

```bash
npm run verify:r2-generation -- 2099-12-31
```

对应实现位于 [scripts/verify-r2-generation.ts](/Users/bytedance/Work/bible-verse/scripts/verify-r2-generation.ts)。

这个脚本不是只读检查。

它真的会做下面这些事：

1. 接收一个目标日期
2. 用 `manual_regenerate` 触发真实生成逻辑
3. 创建一个新的 generation version
4. 写三份生成资产
5. 从数据库里把该日期最新的 generation 记录再读出来
6. 打印 JSON 形式的证据结果

输出里会包含：

- `generationId`
- `generationVersion`
- `status`
- `storageProvider`
- `sourceImageUrl`
- `cardImageSimpleUrl`
- `cardImageExtendedUrl`
- `publicUrls`

因为它会修改对象存储和数据库状态，所以应该使用一个可丢弃的未来日期来跑它。

## 15. 这个仓库里一次真实验证的例子

在这次工作区验证过程中，这个命令对下面这个日期执行过：

- `2099-12-31`

并且返回了：

- `storageProvider: "r2"`

以及类似下面这样的公开 URL：

- `https://pub-...r2.dev/sources/2099-12-31/generation-3.svg`
- `https://pub-...r2.dev/cards/2099-12-31/generation-3-simple.svg`
- `https://pub-...r2.dev/cards/2099-12-31/generation-3-extended.svg`

这说明下面这些层级都真实工作了：

- 生成逻辑
- 存储分支逻辑
- R2 认证上传
- 公开 URL 构造
- 公网对象访问

## 16. 常见误解

### “如果我用了 AWS 的 S3 SDK，那我一定是在用 AWS S3”

不对。

你完全可以用一个会说 S3 协议的客户端库，去和一个非 AWS 的对象存储服务通信，只要那个服务支持 S3 兼容接口。

### “只要我有一个 public URL，我就可以往那里上传”

不对。

public delivery URL 和 authenticated upload endpoint 是两个不同概念。

### “浏览器能看到图片，说明浏览器一定拿到了存储凭据”

不对。

浏览器只需要最后的公开 URL，上传凭据始终应该留在服务端。

### “验证命令只是个连通性检测”

不对。

它会真实创建 generation version，真实写入资产，也会真实改数据库状态。

## 17. 如果你想按代码顺序自己追踪

如果你想通过读代码来理解这条链路，推荐按这个顺序读：

1. [src/app/api/cron/generate-next/route.ts](/Users/bytedance/Work/bible-verse/src/app/api/cron/generate-next/route.ts)
2. [src/lib/publication.ts](/Users/bytedance/Work/bible-verse/src/lib/publication.ts)
3. [src/lib/ai.ts](/Users/bytedance/Work/bible-verse/src/lib/ai.ts)
4. [src/lib/cards.ts](/Users/bytedance/Work/bible-verse/src/lib/cards.ts)
5. [src/lib/storage.ts](/Users/bytedance/Work/bible-verse/src/lib/storage.ts)
6. [src/db/schema.ts](/Users/bytedance/Work/bible-verse/src/db/schema.ts)
7. [src/app/page.tsx](/Users/bytedance/Work/bible-verse/src/app/page.tsx)
8. [src/app/archive/page.tsx](/Users/bytedance/Work/bible-verse/src/app/archive/page.tsx)
9. [src/app/verse/[slug]/page.tsx](/Users/bytedance/Work/bible-verse/src/app/verse/[slug]/page.tsx)

## 18. 一句话总结

这个应用会为某个日期生成三份 SVG 资产，通过服务端签名的 S3 兼容写请求把它们存到 Cloudflare R2，把面向浏览器的公开 URL 存进数据库，最后再由页面和社交爬虫直接读取这些 URL，而不会把上传凭据暴露给浏览器。
