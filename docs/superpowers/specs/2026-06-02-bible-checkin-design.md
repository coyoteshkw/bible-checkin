# 圣经打卡记录 · 设计文档

> Version: 1.0
> Last updated: 2026-06-02
> Status: Approved

## 1. 概述

一个轻量级的圣经读经打卡 Web 应用。用户可以注册登录，每天记录读经进度（精确到节），查看阅读统计，并生成可分享的打卡卡片。

### 1.1 核心目标

- 记录每日读经打卡，支持同章内/跨章/整章/单节多种格式
- 支持注册登录，数据跟人走
- 全平台可用（手机/平板/桌面）
- 页面加载快速，交互流畅
- 可部署到服务器

### 1.2 非目标

- 不展示圣经经文原文
- 不做社交/社区功能
- 不做多语言/多译本支持（初期仅和合本中文）

---

## 2. 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 框架 | **Nuxt 3** | 全栈 Vue，Nitro 服务器 |
| 样式 | **Tailwind CSS** | 零运行时，按需生成 |
| 数据库 | **SQLite** via better-sqlite3 | 单文件，零配置 |
| 认证 | **Nuxt Auth Utils** | 基于 session cookie |
| 卡片生成 | **html-to-image** (客户端) | 浏览器内渲染下载 PNG |
| 部署 | Node.js 直接运行 / Docker | |

### 选择理由

- **Nuxt 3**：前后端一个项目，减少维护成本；Nitro 服务器性能好
- **SQLite**：无需安装数据库服务，一个文件搞定，适合小规模个人/团队使用
- **Tailwind CSS**：构建时 purge 后 CSS < 10KB，无运行时开销
- **html-to-image**：客户端生成图片，不占用服务器资源

---

## 3. 数据模型

### 3.1 users 表

```sql
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT NOT NULL UNIQUE,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,  -- bcrypt hash
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 3.2 check_ins 表

```sql
CREATE TABLE check_ins (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  date            TEXT    NOT NULL,  -- 'YYYY-MM-DD'
  book            TEXT    NOT NULL,  -- 书卷名，如 '创世记'
  chapter_start   INTEGER NOT NULL,  -- 起始章
  chapter_end     INTEGER,           -- 结束章 (null = 同章内)
  verse_start     INTEGER,           -- 起始节 (null = 整章)
  verse_end       INTEGER,           -- 结束节 (null = 单节)
  note            TEXT    DEFAULT '',
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_check_ins_user_date ON check_ins(user_id, date);
CREATE INDEX idx_check_ins_user_book ON check_ins(user_id, book);
```

### 3.3 记录格式示例

| 场景 | book | chapter_start | chapter_end | verse_start | verse_end | 显示 |
|---|---|---|---|---|---|---|
| 创世记 1:5-10 | 创世记 | 1 | null | 5 | 10 | 创世记 **1:5-10** |
| 创世记 1:5-2:3 | 创世记 | 1 | 2 | 5 | 3 | 创世记 **1:5-2:3** |
| 诗篇 23 | 诗篇 | 23 | null | null | null | 诗篇 **23** |
| 约翰福音 3:16 | 约翰福音 | 3 | null | 16 | null | 约翰福音 **3:16** |
| 箴言 1-3 | 箴言 | 1 | 3 | null | null | 箴言 **1-3** |

### 3.4 圣经书卷数据（内置参考数据）

用于进度计算。共 66 卷，1,189 章。

```json
{
  "旧约": [
    {"name": "创世记", "chapters": 50},
    {"name": "出埃及记", "chapters": 40},
    // ... 共 39 卷
  ],
  "新约": [
    {"name": "马太福音", "chapters": 28},
    // ... 共 27 卷
  ]
}
```

---

## 4. 页面与布局

### 4.1 响应式布局策略

| 断点 | 宽度 | 布局 |
|---|---|---|
| 移动端 | < 768px | 上下结构：可折叠日历 + 时间线 |
| 桌面端 | ≥ 768px | 左右分栏：左侧面板 + 右侧详情 |

### 4.2 页面列表

| 页面 | 路由 | 说明 |
|---|---|---|
| 首页/打卡 | `/` | 主页面，含日历、时间线、添加打卡 |
| 登录 | `/login` | 邮箱+密码登录 |
| 注册 | `/register` | 邮箱+用户名+密码注册 |
| 阅读进度 | `/progress` | 圣经阅读进度总览 |

### 4.3 首页布局（移动端）

```
┌─────────────────────┐
│ 📖 圣经打卡  👤用户  │ ← 顶栏
├─────────────────────┤
│ 📅 展开日历  ▼      │ ← 默认收起，点击展开
│  (展开后显示日历网格) │
├─────────────────────┤
│ 1月8日 · 周三       │ ← 时间线，日期分组
│ │ 创世记 1:1-31    │   每条显示章节+笔记
│ │ ✂️ 🗑️           │   操作：生成卡片/删除
│ 1月7日 · 周二       │
│ │ 马太福音 5:1-12  │
├─────────────────────┤
│ [+ 添加今日打卡]    │ ← 浮动/固定底部按钮
└─────────────────────┘
```

### 4.4 首页布局（桌面端）

```
┌─ 📖 圣经打卡 ─────────────  👤用户 ─┐
├──────────────┬───────────────────────┤
│ 📊 总进度     │  📅 2025年1月8日       │
│  ████░░ 12%  │                       │
│ 🔥 连续5天   │  创世记 1:1-31  ✂️ 🗑️ │
│              │  神创造天地万物         │
│ 📅 一月       │                       │
│  日 一 二 ...│  诗篇 23:1-6    ✂️ 🗑️ │
│        1 2   │  耶和华是我的牧者       │
│   3 4 5 6    │                       │
│              │  [+ 添加]             │
│ 📖 查看进度 → │                       │
└──────────────┴───────────────────────┘
```

### 4.5 阅读进度页面

```
┌─ 阅读进度 ─────────────────┐
│ 📊 整本圣经               │
│ ████████░░░░░░ 12.5%     │
│ 已读 148 / 1,189 章      │
├───────────────────────────┤
│ 📜 旧约（39卷）            │
│ 创世记  ████░░░░  42%  ✓  │ ← 点击展开章节详情
│ 出埃及  ██░░░░░░  15%     │
│ 利未记  ░░░░░░░░   0%     │
│ ...                       │
├───────────────────────────┤
│ 📜 新约（27卷）            │
│ 马太福音 █░░░░░░░   8%    │
│ ...                       │
├───────────────────────────┤
│ 🏆 已读完的书卷            │
│ [暂无]                    │
└───────────────────────────┘
```

---

## 5. API 设计

### 5.1 认证

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/register` | 注册（username, email, password） |
| POST | `/api/auth/login` | 登录（email, password）→ 写入 session |
| GET | `/api/auth/me` | 获取当前用户信息 |
| POST | `/api/auth/logout` | 登出 |

### 5.2 打卡

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/checkins?date=YYYY-MM-DD` | 获取某天的打卡列表 |
| GET | `/api/checkins?month=YYYY-MM` | 获取某月的打卡日期（日历用） |
| POST | `/api/checkins` | 新增打卡记录 |
| DELETE | `/api/checkins/:id` | 删除打卡记录 |
| GET | `/api/checkins/stats` | 统计：连续打卡天数、本月天数 |

### 5.3 进度

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/progress` | 获取阅读进度（每卷书的已读章数 + 总百分比） |

---

## 6. 组件树

```
pages/
├── index.vue           首页（时间线 + 日历 + 添加打卡）
├── login.vue           登录
├── register.vue        注册
└── progress.vue        阅读进度

components/
├── AppHeader.vue       顶栏（logo + 用户菜单）
├── Timeline.vue        时间线列表（日期分组 + 打卡条目）
├── TimelineItem.vue    单条打卡记录
├── Calendar.vue        日历网格
├── CheckInForm.vue     添加打卡表单（书卷选择器 + 章/节输入）
├── ShareCard.vue       打卡卡片预览 + 下载
├── BibleBookPicker.vue 书卷选择器（按圣经顺序列表）
└── ProgressBar.vue     可复用的进度条组件

server/
├── api/
│   ├── auth/
│   │   ├── register.post.ts
│   │   ├── login.post.ts
│   │   ├── logout.post.ts
│   │   └── me.get.ts
│   └── checkins/
│       ├── index.get.ts
│       ├── index.post.ts
│       ├── [id].delete.ts
│       ├── stats.get.ts
│       └── progress.get.ts
├── db/
│   ├── schema.ts       建表 SQL
│   └── index.ts        数据库连接 + 初始化
└── middleware/
    └── auth.ts         登录校验 middleware
```

---

## 7. 打卡卡片（分享功能）

### 7.1 流程

1. 用户点击打卡条目上的「✂️ 生成卡片」
2. 弹出卡片预览弹窗
3. 卡片内容：日期、用户名、章节列表、笔记、本月打卡天数
4. 用户点击「保存图片」→ 浏览器下载 PNG

### 7.2 卡片设计

```
┌──────────────────────────────┐
│          📖 今日读经           │
│                              │
│   创世记 1:1-31              │
│   神创造天地万物               │
│                              │
│   诗篇 23:1-6                │
│   耶和华是我的牧者             │
│                              │
│   ─── 2025年1月8日 ───      │
│   用户名 · 本月第8天打卡      │
└──────────────────────────────┘
```

### 7.3 技术方案

使用 `html-to-image` 库将 HTML 元素渲染为 Canvas，然后导出 PNG。纯客户端操作，无需后端参与。

---

## 8. 数据库初始化数据

### 8.1 圣经书卷数据

内置完整的 66 卷书卷名和章数，用于：
- 书卷选择器（按圣经顺序排序）
- 进度计算（已读章数 / 总章数）

结构：

```typescript
const BIBLE_BOOKS = {
  "旧约": [
    { id: 1,  name: "创世记",   chapters: 50 },
    { id: 2,  name: "出埃及记", chapters: 40 },
    // ... 共 39 卷
  ],
  "新约": [
    { id: 40, name: "马太福音",  chapters: 28 },
    // ... 共 27 卷
  ]
}
```

### 8.2 进度计算逻辑

对于每卷书：
1. 查询该用户所有打卡记录中涉及该书的记录
2. 提取所有唯一的 chapter 编号（考虑 chapter_start ~ chapter_end 范围）
3. 已读章数 = 去重后的 chapter 数量
4. 进度 = 已读章数 / 该书总章数

---

## 9. 部署

### 9.1 直接部署

```bash
npm run build
node .output/server/index.mjs
```

### 9.2 Docker 部署（可选）

```dockerfile
FROM node:20-alpine
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### 9.3 环境变量

```
NUXT_SESSION_PASSWORD=<随机字符串>   # session 加密密钥
NUXT_DB_PATH=./data/bible.db        # 数据库文件路径（可选）
```

---

## 10. 安全考虑

- 密码使用 bcrypt 哈希存储
- Session 使用加密 cookie（nuxt-auth-utils 内置）
- 所有 /api/checkins 端点需登录校验
- SQL 使用参数化查询防注入

---

## 11. 未实现（后续可能的迭代方向）

- 多语言/多译本支持
- 读经计划（按计划推送每日读经内容）
- 团队/小组打卡
- 数据导出
