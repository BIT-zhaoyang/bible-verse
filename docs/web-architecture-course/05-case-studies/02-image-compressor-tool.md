# 02. 案例：图片压缩工具站

这个案例代表典型工具型网站。

## 一句话定义

```text
这是一个帮助用户上传图片、压缩图片并下载结果的工具型网站。
```

## 角色

```text
游客：上传单张图片并下载结果
注册用户：查看历史记录和批量处理
系统任务：处理压缩任务和清理过期文件
管理员：查看失败任务和存储占用
```

## 核心资源

```text
UploadFile
CompressionJob
OutputFile
UsageRecord
User
```

## MVP 流程

```text
用户上传图片
-> 服务端校验类型和大小
-> 压缩图片
-> 保存结果文件
-> 返回下载链接
-> 24 小时后清理
```

MVP 可以同步处理小图片，但要设置超时和大小限制。

## 成熟版流程

```text
浏览器直传原图
-> 创建 CompressionJob
-> 队列 worker 压缩
-> 生成多种质量结果
-> 保存 OutputFile
-> 通知用户
-> 记录用量
-> 定期清理
```

## 状态机

任务：

```text
pending -> processing -> succeeded
pending -> processing -> failed
```

文件：

```text
uploaded -> processed -> expired/deleted
```

## 数据模型

```text
upload_files
- id
- owner_id
- object_key
- content_type
- size_bytes
- width
- height
- status
- expires_at

compression_jobs
- id
- upload_file_id
- status
- options
- error_message
- started_at
- finished_at

output_files
- id
- job_id
- object_key
- public_url
- size_bytes
- quality
- expires_at
```

## 关键架构决策

第一版是否需要登录？

```text
不一定。匿名工具可以降低使用门槛。
```

什么时候上队列？

```text
当处理时间不可控、文件变大、并发变高或需要重试时。
```

文件保存多久？

```text
免费匿名工具通常短期保存，付费用户可以长期保存。
```

## 常见坑

- 不限制文件大小
- 原图和结果长期保存导致成本上涨
- 没有失败状态
- 结果链接公开且永久有效
- 不记录压缩参数，无法复现结果

## 可扩展商业化

```text
免费：单张、低大小限制、短期保存
Pro：批量、更大文件、长期历史、API
```

