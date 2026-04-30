# Tasks

- [x] Task 1: 初始化项目基础工程
  - [x] SubTask 1.1: 使用 `pnpm` 初始化 `Next.js + TypeScript` 应用
  - [x] SubTask 1.2: 安装并配置 `Drizzle`、`pg`、必要的开发依赖
  - [x] SubTask 1.3: 创建基础目录结构、环境变量示例和数据库配置
  - [x] SubTask 1.4: 验证应用可启动、数据库可连接、迁移命令可执行

- [x] Task 2: 建立核心数据模型与迁移
  - [x] SubTask 2.1: 定义 `verses`、`image_generations`、`daily_publications` 表
  - [x] SubTask 2.2: 定义管理员登录相关表或集成对应认证持久层
  - [x] SubTask 2.3: 为日期唯一性、状态约束、版本追踪建立必要索引和约束
  - [x] SubTask 2.4: 编写并验证初始迁移

- [x] Task 3: 实现公开站点的核心页面
  - [x] SubTask 3.1: 实现首页，展示当天唯一已发布内容
  - [x] SubTask 3.2: 实现历史归档页，按日期展示已发布内容
  - [x] SubTask 3.3: 实现详情页，承接分享和 SEO 访问
  - [x] SubTask 3.4: 接入基础分享按钮与必要元信息输出

- [x] Task 4: 实现内容选择、发布与缓存流程
  - [x] SubTask 4.1: 实现“次日候选内容”选择逻辑
  - [x] SubTask 4.2: 实现三个月内不重复使用经文的校验逻辑
  - [x] SubTask 4.3: 实现发布状态读取与公开页面聚合查询
  - [x] SubTask 4.4: 实现首页、归档页、详情页的按路径刷新策略

- [x] Task 5: 实现图片生成与对象存储链路
  - [x] SubTask 5.1: 抽象 AI provider 接口并接入首个 provider
  - [x] SubTask 5.2: 实现背景图生成、卡片图合成和版本命名
  - [x] SubTask 5.3: 实现 `Cloudflare R2` 上传与资源 URL 持久化
  - [x] SubTask 5.4: 实现生成失败记录、重试或替代流程基础能力

- [x] Task 6: 实现后台登录与审核流程
  - [x] SubTask 6.1: 实现单管理员账号密码登录
  - [x] SubTask 6.2: 实现后台仪表盘和候选列表页
  - [x] SubTask 6.3: 实现指定日期的审核页与通过/拒绝操作
  - [x] SubTask 6.4: 实现“重新生成替换”和手动刷新缓存能力

- [x] Task 7: 实现定时任务与幂等控制
  - [x] SubTask 7.1: 提供受保护的定时任务入口
  - [x] SubTask 7.2: 实现“提前一天生成次日候选”的定时逻辑
  - [x] SubTask 7.3: 加入目标日期去重、状态检查和重复触发保护

- [x] Task 8: 补充种子数据与验证
  - [x] SubTask 8.1: 准备最小可运行的内容种子数据
  - [x] SubTask 8.2: 验证公开页面、后台审核、生成记录和发布记录闭环
  - [x] SubTask 8.3: 运行必要测试、诊断和自检

# Task Dependencies

- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 2]
- [Task 5] depends on [Task 2]
- [Task 6] depends on [Task 2]
- [Task 7] depends on [Task 4]
- [Task 7] depends on [Task 5]
- [Task 8] depends on [Task 3]
- [Task 8] depends on [Task 4]
- [Task 8] depends on [Task 5]
- [Task 8] depends on [Task 6]
- [Task 8] depends on [Task 7]
