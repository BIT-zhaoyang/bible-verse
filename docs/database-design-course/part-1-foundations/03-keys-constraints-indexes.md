# 03. 主键、外键、约束和索引

前两章讲了如何识别实体、属性和关系。这一章讲如何把这些设计决策落实到表结构里。

表结构不只是字段集合。一张表还要定义：

- **身份**：哪个字段唯一标识这一行？
- **引用**：这张表引用别的表时，如何保证引用的对象真实存在？
- **规则**：哪些数据绝对不允许出现？
- **查询路径**：哪些查询需要被加速？

这四件事分别由主键、外键、约束和索引来完成。

---

## 主键

### What

主键是一行数据的唯一身份标识。几乎所有业务表都应该有主键，否则无法可靠地引用某一行。

少数纯关联表可以不用单独的 `id`，但仍然应该有组合主键或组合唯一约束。例如 `team_memberships` 可以用 `(team_id, user_id)` 保证同一个用户不会重复加入同一个团队。

### Why

没有主键（或主键设计不当）会带来两个问题：

**问题一：无法稳定引用某一行。**

假设 `users` 表没有 id，只有 `email`。当另一张表需要记录"这条记录属于哪个用户"时，就只能存邮箱。但邮箱会变，一旦用户改了邮箱，所有引用它的地方都要跟着更新，非常脆弱。

**问题二：无法区分两条内容相同的记录。**

如果允许两条 `name = "张三"` 的用户记录同时存在，删除其中一条时数据库不知道你要删哪条。

主键解决了这两个问题：它是稳定的、唯一的、不可重复的身份。

### 代理主键 vs 自然主键

**代理主键**是数据库生成的、无业务含义的 id，常见形式是自增整数和 UUID：

```sql
-- 自增整数
id SERIAL PRIMARY KEY

-- UUID（PostgreSQL）
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

**自然主键**是业务上天然唯一的字段：

```sql
-- 国家代码
code CHAR(2) PRIMARY KEY   -- 'CN', 'US', 'JP'

-- 货币代码
code CHAR(3) PRIMARY KEY   -- 'USD', 'CNY', 'EUR'
```

**如何选择？**

自然主键只有在字段**极度稳定、几乎不可能变化**时才合适。国家代码、货币代码这类几十年不会变的领域数据是少数例外。

以下这些看起来唯一，但通常**不适合做主键**：


| 字段         | 原因           |
| ---------- | ------------ |
| `email`    | 用户可能更换邮箱     |
| `username` | 可能允许改用户名     |
| `slug`     | 文章 URL 可能重命名 |
| `phone`    | 手机号可能换绑      |


这些字段适合加唯一约束（见下文），但不适合做主键。主键一旦被别的表引用，改起来代价极高。

> 实用原则：默认用代理主键表达身份，用唯一约束表达业务唯一性。

### 自增整数 vs UUID

两种代理主键各有取舍：


|          | 自增整数                          | UUID              |
| -------- | ----------------------------- | ----------------- |
| 存储空间     | 小（4 或 8 字节）                   | 大（16 字节）          |
| 可读性      | 好（`id=1`）                     | 差（`id=a1b2c3...`） |
| URL 枚举风险 | 高（可枚举，`/users/1`, `/users/2`） | 低（难以枚举）           |
| 分布式生成    | 需要中心化序列                       | 可在客户端生成           |
| 排序       | 天然按插入顺序                       | 随机（除非用 UUIDv7）    |


面向用户的 API 建议用 UUID，避免暴露数据规模和遍历风险。内部系统或对性能敏感的大表可以用自增整数。

注意：UUID 只能降低枚举风险，不能替代权限校验。服务端仍然必须检查当前用户是否有权访问这个资源。

---

## 外键

### What

外键是一张表中的字段，它的值必须对应另一张表中真实存在的唯一记录。最常见的是引用另一张表的主键，也可以引用带唯一约束的字段。外键声明了表之间的引用关系，并由数据库强制执行。

```sql
-- order_items.order_id 必须是 orders.id 中存在的值
order_id INTEGER REFERENCES orders(id)
```

### Why

没有外键时，很容易出现**孤儿数据**。

孤儿数据是指：一条记录引用了另一张表中根本不存在的行。

```text
orders 表
id | status
1  | paid
2  | paid

order_items 表
id | order_id | product
1  | 1        | 苹果
2  | 999      | 香蕉    ← order_id=999 在 orders 表中不存在
```

`order_items` 第二行的 `order_id = 999`，但 `orders` 表里没有 id 为 999 的订单。这条记录就成了"孤儿"——它指向一个不存在的父记录。

**为什么会发生？**

没有外键约束时，数据库不会阻止写入错误的 id。常见原因：

- 代码 bug 写入了错误的 id
- 删除订单时漏掉了关联的 order_items
- 数据迁移时出了差错

**后果是什么？**

查询时 join 不到数据，商品凭空消失：

```sql
-- order_id=999 的那条 order_item 完全匹配不到任何订单，静默丢失
SELECT * FROM order_items JOIN orders ON order_items.order_id = orders.id
```

问题不会立刻报错，而是藏在数据里，等到用户反馈"订单少了商品"时才暴露，此时已经难以排查根因。

**外键如何解决？**

声明外键约束后，数据库在写入时直接拒绝非法引用：

```sql
order_items.order_id REFERENCES orders(id)
-- 插入 order_id=999 时立即报错，错误在源头被拦截
```

### How：声明外键

```sql
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(10,2) NOT NULL
);
```

`REFERENCES orders(id)` 就是外键声明，`ON DELETE RESTRICT` 是删除策略（见下文）。

### 删除策略

外键还要回答：父记录被删除时，子记录怎么处理？

有三种策略，选哪种取决于子记录在父记录消失后是否还有独立价值。

#### cascade

父记录删除，子记录一起删除。

**适合子记录对父记录强依赖、父记录不存在时子记录也毫无意义的情况。**

```sql
-- 子记录: sessions    父记录: users
sessions.user_id UUID REFERENCES users(id) ON DELETE CASCADE
```

用户注销账号后，该用户的所有登录 session 不再有任何意义，cascade 自动清除，无需手动处理。

同类例子：用户删除草稿时一并删除草稿附件；团队解散时一并删除所有成员关系记录。

**不适合**：涉及账务、订单、库存的场景。这类数据即使父记录"消失"，子记录仍需永久保留用于追溯。

#### set null

父记录删除，子记录的外键字段置为 null，子记录本身保留。

**适合子记录需要保留、但与父记录的关联可以断开的情况。**

```sql
-- 子记录: publications    父记录: admin_users
publications.approved_by UUID REFERENCES admin_users(id) ON DELETE SET NULL
```

管理员账号被删除后，他审批过的文章仍然存在，只是 `approved_by` 变成 null，表示"曾经有人审批过，但审批人已不存在"。

同类例子：员工离职后，他创建的工单保留，但 `created_by` 置空；作者注销后，文章保留，`author_id` 置空。

使用 set null 时，外键字段必须允许为 null，否则数据库会报错。

#### restrict

有子记录时禁止删除父记录，强制先处理子记录才能删父记录。

**适合父记录承载历史事实、物理删除会破坏数据完整性的情况。**

```sql
-- 子记录: order_items    父记录: products
order_items.product_id UUID REFERENCES products(id) ON DELETE RESTRICT
```

只要有历史订单引用了某个商品，就无法直接删除该商品。这防止了账务数据损坏。

这里有一个重要区别：**业务上的"删除"（如商品下架）和数据库的物理删除是两件不同的事。**

商品下架应该用状态字段表达，而不是物理删除：

```sql
products.status = 'active' | 'discontinued'
```

restrict 的作用是：防止你手滑执行了物理删除，在源头报错，强迫你用正确的方式（改状态）处理业务。

同类例子：有交易记录的账户不能删除；有子分类的分类不能删除。

---

**选择规则：**


| 子记录在父记录消失后…       | 用        |
| ----------------- | -------- |
| 毫无意义，可以一起删        | cascade  |
| 仍有价值，但关联可以断开      | set null |
| 必须永久保留，父记录不该被物理删除 | restrict |


---

## 唯一约束

### What

唯一约束保证某个字段（或字段组合）在表中不会出现重复值。

### Why

主键已经保证唯一了，为什么还需要唯一约束？

因为主键表达的是**系统身份**，唯一约束表达的是**业务规则**。这是两件不同的事。

例如：`users` 表有一个代理主键 `id`（系统身份），同时邮箱在业务上不允许重复（业务规则）。这两个需求分别用主键和唯一约束来表达：

```sql
CREATE TABLE users (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE  -- 业务唯一性
);
```

如果没有唯一约束，两个用户可以用同一个邮箱注册，登录时系统不知道该返回哪条记录，数据就乱了。

### How

**列级唯一约束**

把约束关键字直接写在列定义的末尾：

```sql
email TEXT NOT NULL UNIQUE
slug  TEXT NOT NULL UNIQUE
```

**表级唯一约束（推荐）**

把约束单独列在所有列定义之后：

```sql
CREATE TABLE users (
  id    UUID PRIMARY KEY,
  email TEXT NOT NULL,
  UNIQUE (email)
);
```

两种写法在数据库内部等价，都会创建相同的唯一索引，性能无差异。但表级写法有三个优势：

1. **可读性更好**：所有约束集中在底部，不需要逐行扫描列定义才能发现约束。
2. **支持组合多列**：列级写法只能约束单列，组合唯一约束只能用表级写法（见下文）。
3. **可以显式命名**：列级写法让数据库自动生成约束名（如 `users_email_key`），表级可以自定义，报错更易读，删除时也更方便：

```sql
CONSTRAINT uq_users_email UNIQUE (email)
```

**组合唯一约束**

组合唯一约束表达"在某个范围内唯一"。

```sql
-- 同一个用户在同一个团队里只能出现一次
UNIQUE (team_id, user_id)

-- 同一张订单里同一个商品只能出现一次
UNIQUE (order_id, product_id)
```

注意：组合唯一约束约束的是**组合**，不是单个字段。`(team_id=1, user_id=5)` 和 `(team_id=2, user_id=5)` 是两条合法的不同记录。

**唯一约束和 NULL**

在 PostgreSQL 中，普通唯一约束允许多行 `NULL`，因为数据库不会把 `NULL` 当成彼此相等的具体值。

所以如果一个字段既必须唯一，又必须存在，要同时写：

```sql
email TEXT NOT NULL UNIQUE
```

只写 `UNIQUE` 表示“有值时不能重复”，不表示“必须有值”。

**条件唯一约束（Partial Unique Index）**

有时业务规则不是"全局唯一"，而是"在某个条件下唯一"。例如：一个用户可以有多个订阅记录（用来保留历史），但同一时间只能有一个 `active` 状态的订阅。

普通 `UNIQUE (user_id)` 约束解决不了这个问题——它会阻止同一个 `user_id` 出现两次，而我们想要的是"同一个 `user_id` 在 `status = 'active'` 的行里不能重复"。

PostgreSQL 用 partial index（条件索引）来实现这个需求：

```sql
-- 一个用户只能有一个 active 订阅
CREATE UNIQUE INDEX ON subscriptions (user_id) WHERE status = 'active';

-- 同一天只能发布一篇文章
CREATE UNIQUE INDEX ON publications (publish_date) WHERE status = 'published';
```

注意这里的语法是 `CREATE UNIQUE INDEX`，而不是 `UNIQUE (...)`。带 `WHERE` 条件的唯一约束无法内联在 `CREATE TABLE` 里，必须作为独立的 DDL 语句执行。实践中，它通常和建表语句写在同一个 migration 文件里：

```sql
-- migrations/0003_create_subscriptions.sql

CREATE TABLE subscriptions (
  id      UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  status  TEXT NOT NULL
);

CREATE UNIQUE INDEX ON subscriptions (user_id) WHERE status = 'active';
```

如果是后来因需求变化新增的，则另起一个新的 migration 文件，因为表已经存在了：

```sql
-- migrations/0007_add_active_subscription_index.sql

CREATE UNIQUE INDEX ON subscriptions (user_id) WHERE status = 'active';
```

> **什么是 Migration 文件？** 项目上线后，表结构会随着需求不断演变。把每次结构变更写成有编号的 SQL 文件，按顺序执行，任何环境都能从零复现当前的数据库结构，协作时也不会遗漏某次变更。Migration 工具（如 Drizzle、Flyway）会记录哪些文件已执行，每次只运行新增的部分。

**兼容性说明**：`CREATE UNIQUE INDEX`（不带 `WHERE`）是标准 SQL，MySQL、SQLite 等均支持。带 `WHERE` 的 partial index 是 PostgreSQL 和 SQLite 特有功能，MySQL 不支持。本课程以 PostgreSQL 为主，如需跨数据库移植请注意这一点。

### 违反唯一约束时会发生什么

数据库会抛出错误，应用层需要处理。以 PostgreSQL 为例，错误码是 `23505`（`unique_violation`）。

在应用层，有两种常见处理方式：

**方式一：先查再写（不推荐用于高并发场景）**

```typescript
const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
if (existing) throw new Error("邮箱已被注册");
await db.insert(users).values({ email, ... });
```

问题：两次操作之间有时间窗口，高并发时仍可能发生重复插入。

**方式二：捕获数据库错误（推荐）**

```typescript
try {
  await db.insert(users).values({ email, ... });
} catch (error) {
  if (error.code === '23505') {
    throw new Error("邮箱已被注册");
  }
  throw error;
}
```

**方式三：使用 `ON CONFLICT` 语法在数据库层声明冲突行为**

前两种方式都是"先写、出错后处理"或"先查、再写"。`ON CONFLICT` 是第三条路：在 INSERT 语句里直接声明冲突发生时该做什么，数据库一次性搞定。

有两种策略：

`**DO NOTHING`**：冲突时静默跳过，不报错，也不插入。

```sql
INSERT INTO users (email, name) VALUES ('a@b.com', '张三')
ON CONFLICT (email) DO NOTHING;
```

注意：`DO NOTHING` 不抛出异常，所以无法用 try/catch 感知冲突。需要主动检测是否真的插入成功——通过 `.returning()` 查看返回的行数：

```typescript
const result = await db
  .insert(users)
  .values({ email, name })
  .onConflictDoNothing()
  .returning();

if (result.length === 0) {
  // 发生了冲突，没有实际插入
  throw new Error("邮箱已被注册");
}
```

`DO NOTHING` 适合你根本不关心冲突的场景：批量同步数据跳过已存在的记录、幂等写入、记录已处理过的事件 ID 等。用它向用户反馈冲突结果时，必须配合 `.returning()` 检测。

`**DO UPDATE`（upsert）**：冲突时不插入，改为更新已有记录的指定字段。

```sql
INSERT INTO users (email, name) VALUES ('a@b.com', '张三')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;
```

`EXCLUDED` 是一个特殊关键字，指代这次尝试插入但因冲突被拒绝的那行数据。`DO UPDATE SET name = EXCLUDED.name` 的意思是：用本次提交的 `name` 值覆盖已有记录的 `name`。

upsert 适合"存在就更新、不存在就插入"的场景：同步外部数据、更新用户最后登录时间、维护缓存记录等。

---

## 非空约束

### What

`NOT NULL` 声明某个字段必须有值，不允许为空。

### Why

`NULL` 在数据库里是一个特殊值，表示"未知"或"不适用"，它不等于空字符串，不等于 0，也不等于 false。

不加 `NOT NULL` 就等于说"这个字段可以是未知的"。如果业务上这个字段必须存在，却没有约束，就给代码留下了漏洞——某个路径可能漏掉了赋值，插入了一条残缺的记录，查询时再 crash 或产生错误结果。

### How

```sql
CREATE TABLE articles (
  id           UUID PRIMARY KEY,
  title        TEXT NOT NULL,          -- 文章必须有标题
  author_id    UUID NOT NULL REFERENCES users(id),  -- 必须属于某个用户
  published_at TIMESTAMP,              -- 可以为 null，null 表示尚未发布
  deleted_at   TIMESTAMP               -- 可以为 null，null 表示未删除
);
```

**带默认值的 NOT NULL**

有时字段必须有值，但有合理的默认值：

```sql
status      TEXT NOT NULL DEFAULT 'draft',
created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
is_featured BOOLEAN NOT NULL DEFAULT FALSE
```

### NULL 的语义

NULL 不是"没有值"，而是"这个值是未知的或不适用的"。一个字段是否允许 NULL，取决于业务语义。

**好的 NULL**（null 有明确的业务含义）：

```text
published_at = NULL  →  文章尚未发布
cancelled_at = NULL  →  订单尚未取消
verified_at  = NULL  →  邮箱尚未验证
error_message = NULL →  任务没有出错
```

**坏的 NULL**（null 含义模糊，应改为 NOT NULL）：

```text
title = NULL         →  是允许无标题，还是代码漏赋值了？
user_id = NULL       →  这条记录到底属于谁？
amount = NULL        →  这是 0 元还是金额未知？
```

当你不确定一个字段是否允许 NULL 时，问自己：**NULL 在这里代表什么业务含义？** 如果你说不清楚，就应该加 NOT NULL。

---

## Check 约束

### What

Check 约束是一个布尔表达式，数据库在每次写入时都会验证它。如果表达式为 false，写入被拒绝。

### Why

表单验证在前端做，业务逻辑验证在后端 API 做。但这些都在应用层。数据库 check 约束是最后一道防线。

为什么需要最后一道防线？

- 有时数据会绕过 API 直接写入（运维操作、数据迁移、脚本）
- 多个服务共享同一个数据库时，每个服务都需要自己实现验证，容易遗漏
- 应用层的验证逻辑可能有 bug

Check 约束把规则直接编码进数据库，无论谁写入都必须满足。

### How

**数值范围**

```sql
amount   NUMERIC NOT NULL CHECK (amount >= 0),
quantity INTEGER NOT NULL CHECK (quantity > 0),
rating   INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5)
```

**字符串格式（简单情况）**

```sql
code CHAR(2) NOT NULL CHECK (code = UPPER(code))  -- 必须大写
```

**状态枚举**

```sql
-- 方式一：check 约束
status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived'))

-- 方式二：PostgreSQL enum 类型（推荐）
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
status article_status NOT NULL DEFAULT 'draft'
```

**Enum vs Check 的选择**

Enum 类型在 PostgreSQL 里是一等公民，有更好的可读性和类型安全，但修改（增减枚举值）需要 `ALTER TYPE`，代价略高。Check 约束更灵活，改起来只需要 `ALTER TABLE`。

两者都比"只在应用层验证"可靠得多。

对于核心业务状态（如订单状态、发布状态），推荐用 Enum，明确、安全、可读。

**跨字段约束**

Check 约束可以涉及同一行的多个字段：

```sql
-- 如果有结束时间，结束时间必须晚于开始时间
CHECK (end_at IS NULL OR end_at > start_at)

-- 折扣价不能高于原价
CHECK (discount_price <= original_price)
```

**Check 约束和 NULL**

Check 约束只会拒绝表达式明确为 false 的数据。如果表达式结果是 unknown，也就是参与计算的字段为 `NULL`，在 PostgreSQL 中通常会通过。

所以如果字段必须存在且必须满足范围，要把 `NOT NULL` 和 `CHECK` 配合起来：

```sql
amount NUMERIC NOT NULL CHECK (amount >= 0)
```

### 应用层验证 vs 数据库约束

学到这里会有一个疑问：非空约束、check 约束这些验证，在后端 API 里也会做一遍，是不是重复了？

不是重复，是两道不同的防线，各有职责。

应用层验证在请求进来时执行，目的是给用户友好的错误提示："金额不能为负数"、"状态值不合法"。数据库约束在写入时执行，目的是无论数据从哪里进来，都绝对不允许非法值落库。

两者的覆盖范围不同。应用层代码只能拦截经过 API 的写入；运维直接操作数据库、数据迁移脚本、其他服务绕过 API 直接写入——这些路径应用层完全覆盖不到，数据库约束是唯一能兜底的地方。


|      | 应用层验证         | 数据库约束             |
| ---- | ------------- | ----------------- |
| 目的   | 给用户友好的错误提示    | 保证数据绝对合法          |
| 时机   | 请求进来时         | 写入数据库时            |
| 覆盖范围 | 只覆盖经过 API 的写入 | 覆盖所有写入（包括直接操作数据库） |
| 错误信息 | 可以定制、可以多语言    | 技术性错误，需要转换后展示给用户  |


实践原则：**两层都要做**。应用层负责用户体验，数据库约束负责最终防线。

---

## 索引

### What

索引是数据库为加速查询而维护的额外数据结构。可以把它类比成书的目录——读书时你不会从第一页翻到最后一页找某个词，你会先查目录，直接跳到对应页。

### Why

没有索引时，数据库执行查询需要逐行扫描整张表（全表扫描）。当表只有几百行时感觉不到差异，但当表有几十万、几百万行时，查询速度会急剧下降。

```sql
-- 没有索引时，这个查询需要扫描 users 表的每一行
SELECT * FROM users WHERE email = 'foo@example.com';

-- 有 email 索引时，直接定位，接近 O(log n)
```

### How

**单列索引**

```sql
CREATE INDEX ON orders (user_id);
CREATE INDEX ON orders (created_at);
CREATE INDEX ON articles (slug);
```

**复合索引（多列）**

复合索引可以同时加速多个字段的组合查询：

```sql
-- 加速 "查某个用户的所有订单，按时间倒序" 这类查询
CREATE INDEX ON orders (user_id, created_at DESC);
```

复合索引的字段顺序很重要。`(user_id, created_at)` 的索引能加速 `WHERE user_id = ?`，也能加速 `WHERE user_id = ? AND created_at > ?`，但**不能**加速单独的 `WHERE created_at > ?`。

**唯一索引**

在 PostgreSQL 中，唯一约束底层通常通过唯一索引实现。下面两种写法都能阻止重复 email：

```sql
-- 这两种写法效果相同
UNIQUE (email)
CREATE UNIQUE INDEX ON users (email);
```

建模时可以这样理解：业务唯一性优先写成 `UNIQUE` 约束；需要条件唯一时，例如“一个用户只能有一个 active 订阅”，通常用 partial unique index 表达。

**Partial Index（条件索引）**

只对满足条件的行建索引，节省空间，也加速特定查询：

```sql
-- 只索引未完成的订单，已完成的订单不占用索引空间
CREATE INDEX ON orders (user_id) WHERE status != 'completed';
```

### 什么时候加索引

**应该加索引的字段：**

- 外键字段（`user_id`、`order_id` 等）——通常需要，尤其是会被 join、按父对象查询，或父表可能被删除/更新时
- 经常出现在 `WHERE` 条件里的字段
- 经常用于 `ORDER BY` 的字段
- 经常用于 `JOIN` 条件的字段

**外键为什么通常要加索引？**

这是最常被忽略的一点。

```sql
-- 删除一个 user 时，数据库需要检查 orders 表里是否有引用它的记录
-- 如果 orders.user_id 没有索引，就需要全表扫描 orders
DELETE FROM users WHERE id = ?;
```

每次删除或更新父记录，数据库都要检查子表里是否有引用。子表越大，代价越高。给高频使用或数据量较大的外键字段加索引是标准做法。

**不应该随意加索引的情况：**

- 写多读少的表（索引会降低写入速度）
- 低选择性字段（如 `is_deleted BOOLEAN`，只有 true/false 两种值，索引意义不大）
- 表非常小（几千行以内，全表扫描比索引更快）

### 代价

索引不是免费的：

- **占用磁盘空间**：每个索引是一份额外的数据结构
- **降低写入速度**：每次插入、更新、删除，数据库都需要同步维护所有相关索引

原则：**先根据真实查询路径设计索引，不要提前过度索引。** 性能出问题时，用 `EXPLAIN ANALYZE` 找到慢查询，再针对性补充索引。

---

## 正确性和性能的职责分工

约束、索引、应用层验证三者分工不同，共同保证用户体验、数据正确性和查询性能：

```
┌─────────────────────────────────────────┐
│  应用层（API / Service Layer）           │
│  职责：用户友好的错误提示、业务流程控制       │
│  例子：邮箱格式验证、密码强度检查            │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│  数据库约束（Constraints）               │
│  职责：绝对不允许出现的数据直接拒绝        │
│  例子：唯一约束、外键、非空、check         │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│  索引（Indexes）                         │
│  职责：加速查询，与正确性无关             │
│  例子：外键索引、高频 WHERE 字段索引       │
└─────────────────────────────────────────┘
```

**应用层验证**回答：怎么给用户一个好的错误体验？

**约束**回答：什么数据绝对不允许存在？

**索引**回答：什么查询需要更快？

三者不要互相替代。只做应用层验证，绕过 API 的写入会污染数据；只靠数据库约束，用户看到的是数据库报错而不是友好提示；缺少必要索引，数据量上来后查询会慢到无法接受。

### 业务逻辑该放在数据库还是应用层？

学完这章会有一个自然的疑问：数据库能表达这么多业务逻辑（唯一约束、外键、check），那是不是把更多东西放数据库里会更好？

答案取决于这条逻辑描述的是什么。

**数据完整性规则 → 数据库**

"邮箱不能重复"、"订单金额不能为负"、"每条 order_item 必须对应真实存在的订单"——这类规则描述的是什么数据是合法的。它们在任何时候、对任何来源的写入都必须成立，没有例外。

把这类规则放进数据库是正确的，因为数据库是唯一能覆盖所有写入路径的地方。无论是 API、后台脚本、还是运维直接操作，都绕不过数据库约束。

**业务流程逻辑 → 应用层**

"用户下单后扣减库存、发送确认邮件"、"订单状态只能从 pending 变 paid"——这类规则描述的是业务怎么运作。流程逻辑放在应用层：更容易测试、更容易修改、可以版本控制、也不和数据库厂商绑死。

**区分方法**

问自己：这条规则的目的是"保证数据不坏"，还是"描述业务怎么运作"？


| 规则                     | 放哪里           | 原因          |
| ---------------------- | ------------- | ----------- |
| 邮箱不能重复                 | 数据库（唯一约束）     | 数据完整性       |
| 订单金额不能为负               | 数据库（check 约束） | 数据完整性       |
| 订单状态只能从 pending 变 paid | 应用层           | 业务流程        |
| 下单时扣减库存                | 应用层           | 业务流程        |
| 用户每天只能发三条评论            | 应用层           | 业务流程（且规则会变） |


**要避免的极端：存储过程**

过去有一种做法是把大量业务逻辑写成数据库存储过程（stored procedure）。今天这几乎被视为反模式：难以测试、部署复杂、换数据库时全部要重写。数据库做好它最擅长的——守护数据的结构和完整性——其余的交给应用层代码。

---

## 本章原则

> 数据库不只是存储数据，也应该帮你验证身份、引用和不可破坏的业务规则。把业务规则编码进 schema，比依赖应用层代码约束更可靠。

