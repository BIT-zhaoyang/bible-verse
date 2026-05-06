# 09. 通知、消息和收件箱

通知和消息系统常见但容易混乱。

要先区分：

- 系统通知
- 用户之间的私信
- 邮件/短信/Push 发送任务
- 应用内收件箱

## 通知模板

```text
notification_templates
- code
- channel
- subject_template
- body_template
```

适合可配置通知。

## 通知实例

```text
notifications
- id
- recipient_id
- type
- title
- body
- link_url
- read_at
- created_at
```

这是应用内通知。

## 发送任务

邮件、短信、Push 应该有 job 表：

```text
delivery_jobs
- id
- notification_id
- channel
- provider
- status
- error_message
- sent_at
- created_at
```

通知内容和发送过程分开。

## 私信会话

```text
conversations
- id
- created_at

conversation_participants
- conversation_id
- user_id
- last_read_at

messages
- conversation_id
- sender_id
- body
- created_at
```

多人会话用 participants 表。

## 已读状态

单条通知：

```text
notifications.read_at
```

会话消息：

```text
conversation_participants.last_read_at
```

不要给每条消息每个用户都建 read row，除非需要精确到消息级已读。

## 本章原则

> 通知模型要分清内容实例、发送任务和阅读状态；消息系统要分 conversation、participants 和 messages。

