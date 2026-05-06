# 01. 案例：Bible Daily Verse

这个案例拆解当前项目。它表面是一个每日经文网站，本质是一个内容型网站，叠加 AI 生成、文件存储、人工审核和定时发布。

## 一句话定义

```text
这是一个帮助英语基督徒每天阅读、理解并分享一条圣经经文的内容型网站。
```

## 网站类型

主类型：

```text
内容型网站
```

辅助类型：

```text
AI 生成系统
内部 CMS 后台
自动化发布系统
社交传播型内容站
```

## 角色

```text
游客：阅读今日经文、浏览归档、打开详情页、分享内容
管理员：登录后台、生成候选、审核图片、批准或拒绝发布
系统任务：定时生成明日候选，发布今日已批准内容
```

## 核心资源

```text
Verse
ImageGeneration
DailyPublication
AdminUser
AdminSession
```

三张核心业务表的分工：

```text
Verse：内容资产
ImageGeneration：一次图片生成尝试和版本
DailyPublication：某个日期最终采用哪条内容和哪次生成
```

这是一个很好的资源边界示例。经文、生成结果、发布记录生命周期不同，拆开是正确的。

## 核心流程

```text
经文内容池
-> 为目标日期选择经文
-> 生成背景或卡片
-> 上传到本地/R2
-> 保存生成记录
-> 管理员审核
-> 批准为某日发布内容
-> 定时发布
-> 首页、归档、详情页展示
-> 社交分享
```

## 状态机

生成状态：

```text
pending
processing
review_required
approved
rejected
failed
superseded
```

发布状态：

```text
scheduled
approved
published
skipped
cancelled
```

这里最重要的设计点是：`approved` 和 `published` 分开。审核通过不等于已经公开。

## 页面结构

公开侧：

```text
/
/archive
/verse/:slug
/about
/subscribe
```

后台侧：

```text
/admin/login
/admin
/admin/content
/admin/publications
/admin/publications/:date
```

## 已经使用的模式

内容管理：

```text
经文内容池、归档、详情页
```

AI 生成任务：

```text
生成版本、provider、model、prompt snapshot、错误状态
```

文件存储：

```text
本地 public/generated 或 Cloudflare R2
```

审核工作流：

```text
Approve / Reject / Regenerate
```

定时任务：

```text
/api/cron/generate-next
```

SEO 和分享：

```text
详情页和社交分享图
```

## 下一步演进建议

第一优先级：图片质量验证。

当前 AI 图片生成结果可能有文字错误、比例错误、裁剪错误。这类风险会直接影响发布质量。建议加入：

```text
尺寸检查
URL 可访问检查
文本质量人工检查
失败原因记录
后台 QA 状态
```

第二优先级：真实订阅系统。

订阅入口目前更像占位。完整方案应有：

```text
Subscriber
SubscriptionPreference
EmailDelivery
退订链接
每日发送任务
```

第三优先级：运营数据。

至少记录：

```text
页面访问
分享点击
订阅转化
生成成功率
生成成本
```

第四优先级：归档发现能力。

可以逐步增加：

```text
主题标签
关键词搜索
按月份归档
热门经文
```

## 这个案例教会什么

一个看似简单的每日内容网站，背后可能包含：

- 内容池
- 生成任务
- 文件存储
- 审核队列
- 发布状态
- 定时任务
- SEO
- 分享传播
- 后台管理

所以架构设计不能只看页面数量。要看资源和流程。

