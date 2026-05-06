# 04. 案例：小型 CRM SaaS

这个案例代表典型 B2B SaaS。

## 一句话定义

```text
这是一个帮助小团队记录客户、跟进销售机会并管理成员协作的 CRM SaaS。
```

## 角色

```text
Owner：管理工作区、账单和成员
Admin：管理客户和成员
Sales：创建客户和跟进记录
Viewer：只读查看客户
System：发送提醒和同步集成
```

## 核心资源

```text
User
Workspace
Membership
Customer
Contact
Deal
Activity
Note
Reminder
Subscription
AuditLog
```

## 核心流程

```text
注册 -> 创建 workspace -> 邀请成员 -> 创建客户 -> 添加跟进记录 -> 创建机会 -> 设置提醒 -> 查看销售漏斗
```

## 数据归属

所有业务资源都应该归属 workspace：

```text
customers.workspace_id
deals.workspace_id
activities.workspace_id
```

同时记录操作者：

```text
created_by
updated_by
assigned_to
```

## 权限矩阵

```text
Owner：账单、成员、所有数据
Admin：成员、所有业务数据
Sales：创建和编辑自己负责的客户
Viewer：只读
```

权限必须在服务端校验。

## 页面结构

产品侧：

```text
Dashboard
客户列表
客户详情
机会列表
提醒
成员设置
账单设置
```

运营后台：

```text
用户查询
工作区查询
订阅状态
用量统计
```

## MVP

MVP 可以先做：

```text
个人 workspace
客户 CRUD
跟进记录
基础搜索
简单成员邀请
```

可以暂缓：

```text
复杂权限
自动化工作流
邮件集成
销售预测
自定义字段
```

但建议一开始就有 `workspace_id`，避免未来团队化迁移困难。

## 常见坑

- 数据只绑 user，不绑 workspace
- 没有审计日志
- 权限只靠前端
- 客户删除没有软删除
- 没有导出和备份思路

