# 项目进展回顾：每日经文网站生成链路与移动端 UI

日期：2026-05-06

这份文档回顾近期围绕 Bible Daily Verse 项目的连续讨论和实现进展。重点不是记录每一个细小命令，而是沉淀已经确定的方向、已经完成的链路、当前真实状态，以及下一阶段应该优先处理的事项。

## 1. 当前项目方向

项目已经从“静态内容站原型”推进到“真实 AI 图片生成 + Cloudflare R2 存储 + 移动端优先展示”的阶段。

当前产品形态可以概括为：

- 每天发布一条 Bible verse。
- 后台或脚本为目标日期生成一张分享图片。
- 图片由 AI provider 生成，上传到 Cloudflare R2。
- 数据库保存该日期的 verse、generation 记录、发布记录和图片 URL。
- 公开首页、详情页、归档页从数据库读取已发布内容。
- 移动端是第一优先级，桌面端只是兼容展示。

## 2. R2 与 S3 认知已经厘清

早期我们重点解决了 Cloudflare R2 的概念和环境变量问题。

已经明确的核心概念：

- R2 是 Cloudflare 的对象存储服务。
- S3 API 在这里不是 AWS S3 本身，而是 R2 提供的一套 S3 兼容上传接口。
- 服务端上传使用 S3 API endpoint，例如 `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`。
- 浏览器和社交爬虫读取图片使用公开 URL，例如 `https://pub-xxxx.r2.dev/...` 或自定义域名。
- `R2_PUBLIC_BASE_URL` 应该是公开访问 host，不应该填 S3 API endpoint。

R2 配置最终已经跑通：真实生成的图片可以上传到 R2，并通过公开 URL 在页面中展示。

相关文档：

- [r2-image-generation-walkthrough.zh-CN.md](./r2-image-generation-walkthrough.zh-CN.md)
- [r2-image-generation-walkthrough.md](./r2-image-generation-walkthrough.md)
- [r2-storage-flow.md](./r2-storage-flow.md)

注意：这些教学文档里仍有部分旧描述，例如“生成三张 SVG 卡片”。当前实现已经演进为“AI provider 直接生成最终图片”，后续应更新这些教程文档。

## 3. AI provider 路线演进

AI provider 讨论经历了几个阶段。

第一阶段：mock 和本地 SVG

- 最初实现可以在没有真实 provider 时用 mock SVG 背景生成图。
- 这让数据库、上传、页面读取链路可以先跑起来。

第二阶段：OpenRouter 与 Nano Banana 2

- 用户希望优先接入 OpenRouter。
- 我们实现了 `AI_PROVIDER=openrouter` 路径。
- 默认 OpenRouter model 保持为 Nano Banana 2 路线：`google/gemini-3.1-flash-image-preview`。

第三阶段：OpenAI `gpt-image-2`

- 代码已经支持 `AI_PROVIDER=openai`，默认 model 是 `gpt-image-2`。
- 但当前 `.env.local` 没有 `OPENAI_API_KEY`，所以不能直连 OpenAI API 真实生成。
- ChatGPT Plus 订阅不等同于 OpenAI API 额度；API 调用仍需要 API billing 和 API key。

第四阶段：OpenRouter 上的 GPT Image 2 路线

- 用户指出 OpenRouter 可以直接调用 GPT Image 2。
- 我们切到 OpenRouter 的模型：`openai/gpt-5.4-image-2`。
- 当前 `.env.local` 的有效 AI 配置是：

```env
AI_PROVIDER=openrouter
AI_PROVIDER_MODEL=openai/gpt-5.4-image-2
```

当前 `OPENROUTER_API_KEY` 已配置，`OPENAI_API_KEY` 仍缺失。

## 4. 图片生成策略的关键改变

生成策略发生过一次重要反转。

旧策略：

- AI provider 只生成背景图。
- 应用自己用 SVG 把 verse text、reference、explanation 合成到图片里。
- 后端会上传 source、simple、extended、portrait 等多份资产。

新策略：

- AI provider 直接生成最终可展示的图片。
- 图片 URL 同时写入 `sourceImageUrl`、`cardImageSimpleUrl`、`cardImageExtendedUrl`、`cardImagePortraitUrl`。
- 应用不再自己把文字合成进 SVG。
- 当前 prompt 要求 provider 把经文文字和引用直接排版进图片。

这次改变的原因：

- 如果应用自己把文字叠在图片上，就必须判断图片明暗和文字对比度。
- 让 provider 直接生成带文字的最终图，可以把视觉设计交给图片模型。
- 但这也带来新风险：图片模型可能拼错文字、裁切文字、排版不稳定，所以人工审核更重要。

当前 OpenRouter 请求已经补充：

```ts
image_config: {
  aspect_ratio: "9:16",
}
```

当前 prompt 还要求：

- 使用精确 verse text。
- 使用精确 reference。
- 保留 safe margins。
- 文字必须完整显示，不能裁切、截断或跑出边缘。
- 不允许 logo、水印、UI 控件、按钮、手机壳 mockup、额外 caption。

## 5. 2026-05-03 的真实生成记录

当前 2026-05-03 发布内容：

- Verse：Matthew 11:28
- Text：`Come unto me, all ye that labour and are heavy laden, and I will give you rest.`
- Published generation：generation 6
- Provider：OpenRouter
- Model：`openai/gpt-5.4-image-2`
- Storage：Cloudflare R2

当前发布图片 URL：

```txt
https://pub-8b85d80edcc34e999e4fec6ec98671ed.r2.dev/cards/2026-05-03/generation-6-ai.png
```

中间版本说明：

- generation 4：AI provider 生成无文字竖版图片，页面文字放在图片外。
- generation 5：切到 OpenRouter GPT Image 2 路线后生成了带文字图，但文字过大并出现裁切。
- generation 6：加入 `image_config.aspect_ratio = "9:16"` 和 safe margins prompt 后重新生成，当前已发布。

## 6. 前端 UI 已完成的调整

移动端 UI 已按参考设计方向重构过一轮。

已经完成：

- 首页首屏先展示 Today’s Verse、经文标题、引用和一句摘要。
- 9:16 图片卡片放在文字信息下方。
- `Read Explanation` 和 `Share Image` 按钮放在图片下方，不再压在图片上。
- 详情页也使用图片外部的标题和引用结构。
- 详情页保留一个主要分享入口，移除了重复的 `Share with Others` 区域。
- 详情页移除了 `Was this verse meaningful to you?` 这类 SEO/互动噪音。
- `Share Image` 在首页和详情页都直接指向图片 URL，不再是无效点击或多余跳转。
- 图片渲染改用 `next/image` 的 `unoptimized` 直出模式，避免对 R2 远程资源再走 Next 图片优化。

需要注意：

- 旧日期的 Recent Verses 可能仍显示旧 mock 图或旧合成图里的文字。
- 这是因为旧 generation 的图片文件本身已经包含那些内容。
- 如果想统一视觉，需要逐日重新生成旧日期图片。

## 7. 数据与缓存行为

手动重生成逻辑已经做过关键修正：

- 对已有发布记录的日期执行 `manual_regenerate` 时，优先复用当天已发布的 verse。
- 这样“重新生成 5 月 3 日的图片”不会偷偷换成另一节经文。

发布审批逻辑也增加了 cache tag revalidation：

- `publication:<date>`
- `publication:slug:<slug>`
- `publications:archive`

但本地脚本在 Next request context 之外调用审批时，dev server 仍可能持有旧缓存。实际操作中，我们通过重启 `localhost:3000` 的 Next dev server 清掉缓存并确认页面更新。

后续可以考虑增加一个安全的内部 revalidate route，避免每次脚本发布后手动重启 dev server。

## 8. 当前验证状态

最近一轮验证已经通过：

```bash
node --conditions=react-server --import tsx --test src/tests/ai-provider.test.ts
node --import tsx --test src/tests/public-ui.test.tsx
npm run lint
npm run build
```

浏览器验证也完成：

- 首页 `Share Image` 指向 `generation-6-ai.png`。
- 当前 `localhost:3000` 已能展示 OpenRouter GPT Image 2 路线生成的图片。
- 图片已经通过 R2 public URL 公开访问。

## 9. 当前遗留问题

### 9.1 图片文字准确性

现在图片里的文字由 AI 模型生成，风险从“字体对比度”转移到了“文字准确性”。

需要重点审核：

- 经文是否逐字准确。
- 标点是否合理。
- reference 是否准确。
- 是否有模型自己添加的多余文字。
- 是否有裁切或边缘溢出。

如果后续要提升可靠性，可以考虑 OCR 检查或人工审核前的自动尺寸/文本质量提示。

### 9.2 旧文档需要更新

R2 教学文档仍以“AI 背景 + 应用合成 SVG 卡片”为主线。

现在真实实现已经改成“AI provider 直接生成最终图片”，所以后续需要更新：

- [r2-image-generation-walkthrough.zh-CN.md](./r2-image-generation-walkthrough.zh-CN.md)
- [r2-image-generation-walkthrough.md](./r2-image-generation-walkthrough.md)
- [r2-storage-flow.md](./r2-storage-flow.md)

### 9.3 后台 provider/model 切换功能仍未做

之前讨论过在后台管理系统里加 provider/model 选择器，但后来决定先放入 TODO，优先跑通完整链路。

当前仍然通过 `.env.local` 切换：

```env
AI_PROVIDER=...
AI_PROVIDER_MODEL=...
```

后续可以把 provider/model 做成数据库配置，让后台随时切换，并让 cron 和 manual regenerate 读取同一份 runtime setting。

### 9.4 旧日期图片需要统一

如果希望 Recent Verses 和 Archive 里的所有图片都符合当前风格，需要对历史日期逐日重新生成。

建议先只重生成少量最近日期，确认成本、速度和视觉稳定性，再决定是否批量处理。

## 10. 推荐下一步

建议下一步按这个顺序推进：

1. 人工检查 generation 6 的文字准确性和整体视觉是否可接受。
2. 如果接受，继续用 `openai/gpt-5.4-image-2` 生成最近几天的图片，观察稳定性。
3. 更新 R2 生成流程教学文档，使其匹配“provider 直接生成最终图”的当前实现。
4. 增加生成结果质量检查，例如图片尺寸验证、aspect ratio 验证、可选 OCR。
5. 再开始做后台 provider/model 选择器。

当前最重要的判断不是“技术是否跑通”。技术链路已经跑通。

现在最重要的是判断：让 AI provider 直接生成带文字图片，质量是否足够稳定，能不能作为每日内容的主流程。
