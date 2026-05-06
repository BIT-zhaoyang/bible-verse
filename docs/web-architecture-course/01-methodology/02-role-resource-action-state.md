# 02. 角色、资源、行为、状态、权限

这一章讲网站架构最重要的五个基本单元：

```text
角色
资源
行为
状态
权限
```

如果你能把一个网站拆成这五个单元，后面的页面、数据表、接口和后台都会自然很多。

## 角色：谁参与这个系统

角色不是技术里的用户表，而是业务里的参与者。

常见角色：

- 游客
- 注册用户
- 会员
- 管理员
- 编辑
- 审核员
- 商家
- 买家
- 老师
- 学生
- 团队管理员
- 系统任务

注意“系统任务”也可以看成角色。定时任务、Webhook、队列 worker 虽然不是人，但它们会改变系统状态。

例如 Bible Daily Verse 里：

```text
游客：阅读和分享经文
管理员：审核生成结果并批准发布
系统任务：生成明天候选内容，发布今天已批准内容
```

把系统任务列出来，会帮助你发现异步流程和定时流程。

## 资源：网站管理的核心对象

资源是系统里有身份、有生命周期、可被引用的对象。

判断一个概念是不是资源，可以问：

- 它是否需要单独保存？
- 它是否会出现在列表或详情页？
- 它是否会被其他对象引用？
- 它是否有状态？
- 它是否需要权限？
- 它是否需要统计？

典型资源：

```text
User
Article
Product
Order
File
Comment
Subscription
Payment
GenerationJob
Notification
```

资源和字段的区别很重要。

文章标题通常是字段，文章是资源。  
商品价格通常是字段，商品是资源。  
支付状态通常是字段，支付记录是资源。  
图片 URL 可能只是字段，但如果图片有上传者、尺寸、审核状态、删除策略，它就应该成为资源。

## 行为：角色对资源做什么

行为是功能的本质。

常见行为：

- 创建
- 查看
- 编辑
- 删除
- 发布
- 下架
- 审核
- 拒绝
- 上传
- 下载
- 搜索
- 支付
- 退款
- 评论
- 收藏
- 分享
- 邀请
- 导入
- 导出

把行为和角色、资源放在一起，就得到权限矩阵。

```text
角色      资源        行为
游客      Article     查看、分享
编辑      Article     创建、编辑、提交审核
管理员    Article     审核、发布、下架
系统任务  Article     定时发布
```

这张表会直接变成：

- 页面入口
- 按钮
- 服务端权限校验
- 后台操作
- 审计日志

## 状态：资源处于哪个生命周期阶段

很多资源不是创建后就结束，而是在生命周期中变化。

文章：

```text
draft -> review_required -> approved -> scheduled -> published -> archived
```

订单：

```text
created -> paid -> fulfilled -> completed -> refunded
```

文件处理任务：

```text
pending -> processing -> succeeded -> failed
```

订阅：

```text
trialing -> active -> past_due -> canceled
```

状态设计不好，代码会变成大量混乱判断：

```text
if publishedAt exists and approvedAt exists and deletedAt is null and isActive true ...
```

状态字段不是万能的，但它能让核心生命周期清晰。

## 权限：谁能执行哪些行为

权限是角色、资源和行为之间的规则。

有三种常见权限。

第一种是角色权限：

```text
admin 可以发布
editor 可以编辑
viewer 只能查看
```

第二种是资源所有权：

```text
用户只能编辑自己的文章
商家只能管理自己的商品
团队成员只能访问所属工作区的数据
```

第三种是能力权限：

```text
can_manage_billing
can_publish_content
can_invite_members
```

小网站通常角色权限就够。SaaS 往往需要角色权限加资源所有权。企业系统可能需要能力权限。

## 五个单元如何组合

设计网站时，先填这张表：

```text
资源：

角色：

行为：

状态：

权限：
```

再填一张矩阵：

```text
角色      资源      可执行行为      需要状态      页面入口
游客      内容      查看、分享      published     首页、详情页
管理员    内容      创建、审核      draft/review  后台
系统任务  内容      定时发布        approved      cron
```

这张矩阵就是架构蓝图的种子。

## 一个完整例子：图片压缩工具

一句话定义：

```text
帮助用户上传图片、压缩图片并下载结果的工具型网站。
```

角色：

```text
游客
注册用户
系统任务
管理员
```

资源：

```text
UploadFile
CompressionJob
OutputFile
UsageRecord
User
```

行为：

```text
上传
创建压缩任务
查看进度
下载结果
删除文件
查看历史记录
```

状态：

```text
CompressionJob: pending -> processing -> succeeded/failed
UploadFile: uploaded -> linked_to_job -> expired/deleted
```

权限：

```text
游客可以处理单张图片
注册用户可以查看历史记录
系统任务可以处理压缩任务
管理员可以查看失败任务和清理文件
```

页面：

```text
上传页
任务进度页
结果页
历史页
后台任务列表
```

看到没有？还没写一行代码，网站的主要结构已经出现了。

## 练习

找一个你熟悉的网站，比如 YouTube、淘宝、Notion、Medium 或一个在线工具站，写出：

- 角色
- 资源
- 行为
- 状态
- 权限

如果某个资源你写不出状态，说明它可能是静态主数据。  
如果某个行为找不到角色，说明功能边界还不清楚。  
如果某个角色没有任何行为，说明它可能不是独立角色。

