# 数据库设计经验：按业务生命周期拆表，而不是按页面长相建表

## 一句话经验

内容型产品的数据库设计，不要急着把页面上看到的所有字段塞进一张“大内容表”。更稳妥的做法是先找出业务生命周期里的不同角色，再让每张表只回答一个清楚的问题。

在这个项目里，真正重要的问题不是“首页要展示哪些字段”，而是：

- 有哪些经文内容可以被使用？
- 某条经文为某一天生成过哪些图片版本？
- 某一天最终对外发布的是哪一条经文和哪一个图片版本？
- 谁审核通过了这次发布？

所以当前网站把核心业务拆成了三张主表：

- `verses`：内容事实源，回答“有什么经文内容”
- `image_generations`：生成过程记录，回答“生成过哪些候选版本”
- `daily_publications`：最终发布结果，回答“某天正式上线的是哪一个版本”

再配合 `admin_users` 和 `admin_sessions` 承担后台登录与审核身份。

## 为什么不能只建一张表

前端工程师很容易从页面出发，设计出类似这样的结构：

```ts
daily_verse = {
  date,
  referenceText,
  verseText,
  explanationText,
  imageUrl,
  prompt,
  status,
}
```

这种结构第一眼很直观，但它把三类不同的东西混在了一起：

- 内容本身：经文、解释、主题、prompt
- 生成过程：AI provider、模型、生成状态、失败原因、版本号
- 发布结果：哪一天上线、谁审核、是否已经正式发布

一旦产品出现“重新生成图片”“保留历史版本”“明天先审核但不公开”“统计最近 90 天是否使用过某条经文”这些需求，一张大表就会开始变得别扭。

更好的设计是让数据库结构贴近业务流程，而不是贴近某一个页面的 UI。

## 当前项目里的拆分方式

### 1. `verses`：内容库

`verses` 存的是可复用的经文内容。它不关心某天是否发布，也不关心图片是否生成成功。

它的责任类似前端里的“原始数据源”：

```ts
type Verse = {
  slug: string;
  referenceText: string;
  verseText: string;
  explanationText: string;
  themeTags: string[];
  promptText: string;
  status: "draft" | "ready" | "disabled";
  isActive: boolean;
}
```

这样设计的好处是，经文可以先作为内容资产沉淀下来。后续无论是自动选择、人工启停、统计使用频率，还是换图片生成策略，都不会破坏内容本体。

### 2. `image_generations`：候选生成记录

`image_generations` 存的是每一次图片生成尝试。它记录“这次生成基于哪条经文、面向哪一天、用了哪个 provider 和模型、最终产物 URL 是什么、现在处于什么状态”。

它的责任类似前端里的异步任务状态：

```ts
type ImageGeneration = {
  verseId: string;
  targetDate: string;
  provider: string;
  providerModel: string;
  promptSnapshot: string;
  status:
    | "pending"
    | "processing"
    | "review_required"
    | "approved"
    | "rejected"
    | "failed"
    | "superseded";
  generationVersion: number;
}
```

这里最值得复用的经验是：要为生成类、审核类、外部服务类流程保留历史记录，而不是覆盖旧记录。

如果某天图片生成了三次，数据库里应该有三条 `image_generations`。这样后台可以比较版本，失败可以追踪，未来也能分析哪个 prompt 或模型效果更好。

`promptSnapshot` 也很关键。它保存的是“当时真正用于生成的 prompt”，而不是永远引用 `verses.promptText` 的最新值。因为 prompt 以后可能被编辑，如果不保存快照，历史图片就无法解释它当时为什么长那样。

### 3. `daily_publications`：最终发布指针

`daily_publications` 是公开页面真正信任的表。它不保存大段内容，而是保存两个关键指针：

- `verseId`：最终采用哪条经文
- `generationId`：最终采用哪次生成结果

它的责任类似一个服务端 selector：

```ts
type DailyPublication = {
  publishDate: string;
  verseId: string;
  generationId: string;
  status: "scheduled" | "approved" | "published" | "skipped" | "cancelled";
  approvedBy?: string;
  approvedAt?: Date;
  publishedAt?: Date;
}
```

公开首页、归档页和详情页都应该读这张表，再关联 `verses` 和 `image_generations`。这能避免一个常见错误：把“最新生成成功的内容”误认为“正式发布的内容”。

生成成功只是候选，审核通过并写入发布表后，才是网站对外展示的事实。

## 关键约束比代码判断更可靠

数据库不只是存数据，也应该帮业务守规则。

当前项目里有一个非常重要的唯一约束：同一个 `publishDate`，最多只能有一条状态为 `approved` 或 `published` 的发布记录。

这条规则表达的是产品承诺：一天只能正式展示一条内容。

如果只靠业务代码判断，很容易在并发、重复提交、cron 重试时漏掉边界。把规则放进数据库约束里，相当于让最后一道门也能守住一致性。

另一个约束是同一天的 `generationVersion` 不能重复。这样手动重新生成时，每个版本都有稳定编号，后台排序和回溯都会简单很多。

## 前端工程师可以怎样迁移理解

可以把这套数据库设计理解成服务端版的状态管理：

- `verses` 像 normalized entities
- `image_generations` 像 async jobs
- `daily_publications` 像 derived state 或 selector result
- enum 状态像 reducer 里的有限状态机
- 外键像 entity 之间的引用关系
- 唯一索引像不可违反的业务 invariant

前端状态如果混在一个巨大对象里，组件越多越难维护。数据库也是一样。好的拆表不是为了“显得规范”，而是为了让每类变化都有自己的位置。

## 可复用的设计原则

遇到类似内容站、AI 生成、审核发布、定时任务产品时，可以先问这几个问题：

- 哪些数据是长期存在的内容资产？
- 哪些数据只是某次尝试、任务或过程记录？
- 哪些数据代表最终对外可见的结果？
- 哪些状态必须保留历史，而不是覆盖？
- 哪些规则必须由数据库约束兜底？
- 公开页面应该读“候选数据”，还是读“已发布事实”？

这套项目的经验可以总结为：

> 内容归内容，过程归过程，发布归发布。页面只读最终事实，后台保留过程痕迹，数据库负责守住不可破坏的业务规则。
