# 圣经打卡记录 · 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个功能完整的圣经读经打卡网页应用，支持注册登录、每日打卡（精确到节）、阅读进度统计、打卡卡片分享。

**Architecture:** Nuxt 3 全栈项目，SQLite 作为数据库，Tailwind CSS 负责样式。认证使用 bcryptjs + session token + cookie。所有 API 在 `server/api/` 下，前端页面在 `pages/` 下，可复用组件在 `components/` 下。

**Tech Stack:** Nuxt 3 + Tailwind CSS + SQLite (better-sqlite3) + bcryptjs + html-to-image

---

## 文件结构

```
bible-checkin/
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register.post.ts     # 注册
│   │   │   ├── login.post.ts        # 登录
│   │   │   ├── logout.post.ts       # 登出
│   │   │   └── me.get.ts            # 获取当前用户
│   │   └── checkins/
│   │       ├── index.get.ts         # 按日期/月份查打卡
│   │       ├── index.post.ts        # 新增打卡
│   │       ├── [id].delete.ts       # 删除打卡
│   │       ├── stats.get.ts         # 连续打卡统计
│   │       └── progress.get.ts      # 阅读进度
│   ├── db/
│   │   ├── index.ts                 # 数据库连接 + 初始化建表
│   │   └── bible-data.ts            # 圣经 66 卷书数据
│   └── middleware/
│       └── auth.ts                  # 登录校验中间件
├── pages/
│   ├── index.vue                    # 首页（时间线+日历+打卡）
│   ├── login.vue                    # 登录页
│   ├── register.vue                 # 注册页
│   └── progress.vue                 # 阅读进度页
├── components/
│   ├── AppHeader.vue                # 顶栏
│   ├── Timeline.vue                 # 时间线列表
│   ├── TimelineItem.vue             # 单条打卡记录
│   ├── Calendar.vue                 # 日历网格
│   ├── CheckInForm.vue              # 添加打卡表单
│   ├── ShareCard.vue                # 打卡卡片生成
│   ├── BibleBookPicker.vue          # 书卷选择器
│   └── ProgressBar.vue              # 进度条组件
├── composables/
│   └── useAuth.ts                   # 认证相关组合式函数
├── app.vue                          # 根组件
├── nuxt.config.ts                   # Nuxt 配置
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## Task 1: 项目脚手架

**Files:**
- Create: `package.json`
- Create: `nuxt.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `app.vue`
- Create: `server/db/index.ts`
- Create: `server/db/bible-data.ts`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "bible-checkin",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxi dev",
    "build": "nuxi build",
    "start": "node .output/server/index.mjs"
  },
  "dependencies": {
    "nuxt": "^3.15.0",
    "@nuxtjs/tailwindcss": "^6.13.0",
    "better-sqlite3": "^11.7.0",
    "bcryptjs": "^2.4.3",
    "html-to-image": "^1.11.11"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.12",
    "@types/bcryptjs": "^2.4.6"
  }
}
```

- [ ] **Step 2: 创建 nuxt.config.ts**

```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    plugins: ['~/server/db/index.ts']
  },
  runtimeConfig: {
    sessionSecret: process.env.NUXT_SESSION_SECRET || 'dev-secret-change-in-production'
  },
  compatibilityDate: '2026-06-02'
})
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

- [ ] **Step 4: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app.vue',
    './pages/**/*.vue',
    './components/**/*.vue'
  ],
  theme: {
    extend: {
      colors: {
        bible: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b'
        }
      }
    }
  }
}
```

- [ ] **Step 5: 创建 app.vue（空壳）**

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
body {
  @apply bg-gray-50 text-gray-800 antialiased;
  font-family: -apple-system, 'Noto Sans SC', system-ui, sans-serif;
}
</style>
```

- [ ] **Step 6: 创建 server/db/bible-data.ts（圣经 66 卷数据）**

```typescript
export interface BibleBook {
  id: number
  name: string
  chapters: number
}

export interface BibleTestament {
  name: string
  books: BibleBook[]
}

export const BIBLE_DATA: BibleTestament[] = [
  {
    name: '旧约',
    books: [
      { id: 1, name: '创世记', chapters: 50 },
      { id: 2, name: '出埃及记', chapters: 40 },
      { id: 3, name: '利未记', chapters: 27 },
      { id: 4, name: '民数记', chapters: 36 },
      { id: 5, name: '申命记', chapters: 34 },
      { id: 6, name: '约书亚记', chapters: 24 },
      { id: 7, name: '士师记', chapters: 21 },
      { id: 8, name: '路得记', chapters: 4 },
      { id: 9, name: '撒母耳记上', chapters: 31 },
      { id: 10, name: '撒母耳记下', chapters: 24 },
      { id: 11, name: '列王纪上', chapters: 22 },
      { id: 12, name: '列王纪下', chapters: 25 },
      { id: 13, name: '历代志上', chapters: 29 },
      { id: 14, name: '历代志下', chapters: 36 },
      { id: 15, name: '以斯拉记', chapters: 10 },
      { id: 16, name: '尼希米记', chapters: 13 },
      { id: 17, name: '以斯帖记', chapters: 10 },
      { id: 18, name: '约伯记', chapters: 42 },
      { id: 19, name: '诗篇', chapters: 150 },
      { id: 20, name: '箴言', chapters: 31 },
      { id: 21, name: '传道书', chapters: 12 },
      { id: 22, name: '雅歌', chapters: 8 },
      { id: 23, name: '以赛亚书', chapters: 66 },
      { id: 24, name: '耶利米书', chapters: 52 },
      { id: 25, name: '耶利米哀歌', chapters: 5 },
      { id: 26, name: '以西结书', chapters: 48 },
      { id: 27, name: '但以理书', chapters: 12 },
      { id: 28, name: '何西阿书', chapters: 14 },
      { id: 29, name: '约珥书', chapters: 3 },
      { id: 30, name: '阿摩司书', chapters: 9 },
      { id: 31, name: '俄巴底亚书', chapters: 1 },
      { id: 32, name: '约拿书', chapters: 4 },
      { id: 33, name: '弥迦书', chapters: 7 },
      { id: 34, name: '那鸿书', chapters: 3 },
      { id: 35, name: '哈巴谷书', chapters: 3 },
      { id: 36, name: '西番雅书', chapters: 3 },
      { id: 37, name: '哈该书', chapters: 2 },
      { id: 38, name: '撒迦利亚书', chapters: 14 },
      { id: 39, name: '玛拉基书', chapters: 4 }
    ]
  },
  {
    name: '新约',
    books: [
      { id: 40, name: '马太福音', chapters: 28 },
      { id: 41, name: '马可福音', chapters: 16 },
      { id: 42, name: '路加福音', chapters: 24 },
      { id: 43, name: '约翰福音', chapters: 21 },
      { id: 44, name: '使徒行传', chapters: 28 },
      { id: 45, name: '罗马书', chapters: 16 },
      { id: 46, name: '哥林多前书', chapters: 16 },
      { id: 47, name: '哥林多后书', chapters: 13 },
      { id: 48, name: '加拉太书', chapters: 6 },
      { id: 49, name: '以弗所书', chapters: 6 },
      { id: 50, name: '腓立比书', chapters: 4 },
      { id: 51, name: '歌罗西书', chapters: 4 },
      { id: 52, name: '帖撒罗尼迦前书', chapters: 5 },
      { id: 53, name: '帖撒罗尼迦后书', chapters: 3 },
      { id: 54, name: '提摩太前书', chapters: 6 },
      { id: 55, name: '提摩太后书', chapters: 4 },
      { id: 56, name: '提多书', chapters: 3 },
      { id: 57, name: '腓利门书', chapters: 1 },
      { id: 58, name: '希伯来书', chapters: 13 },
      { id: 59, name: '雅各书', chapters: 5 },
      { id: 60, name: '彼得前书', chapters: 5 },
      { id: 61, name: '彼得后书', chapters: 3 },
      { id: 62, name: '约翰一书', chapters: 5 },
      { id: 63, name: '约翰二书', chapters: 1 },
      { id: 64, name: '约翰三书', chapters: 1 },
      { id: 65, name: '犹大书', chapters: 1 },
      { id: 66, name: '启示录', chapters: 22 }
    ]
  }
]

export function getAllBooks(): BibleBook[] {
  return BIBLE_DATA.flatMap(t => t.books)
}

export function getTotalChapters(): number {
  return getAllBooks().reduce((sum, b) => sum + b.chapters, 0)
}

export function getBookByName(name: string): BibleBook | undefined {
  return getAllBooks().find(b => b.name === name)
}
```

- [ ] **Step 7: 创建 server/db/index.ts（数据库初始化）**

```typescript
import Database from 'better-sqlite3'
import { defineNitroPlugin } from 'nitropack/runtime/plugin'
import path from 'path'
import fs from 'fs'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized')
  return db
}

export default defineNitroPlugin(() => {
  const dbDir = process.env.NUXT_DB_PATH
    ? path.dirname(process.env.NUXT_DB_PATH)
    : path.resolve(process.cwd(), '.data')

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  const dbPath = process.env.NUXT_DB_PATH || path.join(dbDir, 'bible.db')
  db = new Database(dbPath)

  // Enable WAL mode for better concurrent access
  db.pragma('journal_mode = WAL')

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT NOT NULL UNIQUE,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id         TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS check_ins (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL REFERENCES users(id),
      date          TEXT NOT NULL,
      book          TEXT NOT NULL,
      chapter_start INTEGER NOT NULL,
      chapter_end   INTEGER,
      verse_start   INTEGER,
      verse_end     INTEGER,
      note          TEXT DEFAULT '',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_check_ins_user_date ON check_ins(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_check_ins_user_book ON check_ins(user_id, book);
  `)

  console.log(`[DB] SQLite initialized at ${dbPath}`)
})
```

- [ ] **Step 8: 安装依赖**

Run: `npm install`
Expected: 依赖安装成功，无报错

- [ ] **Step 9: 验证项目能启动**

Run: `npx nuxi build`
Expected: 编译成功，无 TypeScript 错误

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: 项目脚手架 - Nuxt 3 + Tailwind + SQLite"
```

---

## Task 2: 认证系统 — 数据库层 + Session 中间件

**Files:**
- Create: `server/middleware/auth.ts`

- [ ] **Step 1: 创建 auth middleware**

```typescript
// server/middleware/auth.ts
import { getDb } from '../db/index'
import { defineEventHandler, getCookie, setCookie, sendError, createError } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

// 生成 session token
export function createSessionToken(): string {
  return crypto.randomUUID()
}

// 创建 session
export function createSession(userId: number): { token: string } {
  const db = getDb()
  const token = createSessionToken()
  db.prepare('INSERT INTO sessions (id, user_id) VALUES (?, ?)').run(token, userId)
  return { token }
}

// 删除 session
export function deleteSession(token: string): void {
  const db = getDb()
  db.prepare('DELETE FROM sessions WHERE id = ?').run(token)
}

// 验证 session 并获取用户
export function getSessionUser(token: string): { id: number; username: string; email: string } | null {
  const db = getDb()
  const row = db.prepare(`
    SELECT u.id, u.username, u.email
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ?
  `).get(token) as { id: number; username: string; email: string } | undefined

  return row || null
}

// 需要登录的 API 中间件
export function requireAuth(event: any): { id: number; username: string; email: string } {
  const token = getCookie(event, 'session_token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }
  const user = getSessionUser(token)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '会话已过期' })
  }
  return user
}
```

Note: We don't need `uuid` package — Node.js 20+ has `crypto.randomUUID()` built-in.

- [ ] **Step 2: Commit**

```bash
git add server/middleware/auth.ts
git commit -m "feat: session 中间件 - 创建/验证/删除 session"
```

---

## Task 3: 认证 API

**Files:**
- Create: `server/api/auth/register.post.ts`
- Create: `server/api/auth/login.post.ts`
- Create: `server/api/auth/logout.post.ts`
- Create: `server/api/auth/me.get.ts`

- [ ] **Step 1: 注册 API**

```typescript
// server/api/auth/register.post.ts
import { defineEventHandler, readBody, sendError, createError, setCookie } from 'h3'
import bcrypt from 'bcryptjs'
import { getDb } from '../../db/index'
import { createSession } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, email, password } = body

  if (!username || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: '请填写所有字段' })
  }
  if (username.length < 2 || username.length > 20) {
    throw createError({ statusCode: 400, statusMessage: '用户名长度 2-20 个字符' })
  }
  if (password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: '密码至少 6 个字符' })
  }

  const db = getDb()

  // 检查邮箱/用户名是否已注册
  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username)
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: '邮箱或用户名已被注册' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hashedPassword)

  // 创建 session
  const { token } = createSession(result.lastInsertRowid as number)
  setCookie(event, 'session_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 天
  })

  return { success: true, user: { id: result.lastInsertRowid, username, email } }
})
```

- [ ] **Step 2: 登录 API**

```typescript
// server/api/auth/login.post.ts
import { defineEventHandler, readBody, createError, setCookie } from 'h3'
import bcrypt from 'bcryptjs'
import { getDb } from '../../db/index'
import { createSession } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: '请填写邮箱和密码' })
  }

  const db = getDb()
  const user = db.prepare('SELECT id, username, email, password FROM users WHERE email = ?').get(email) as any

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '邮箱或密码错误' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: '邮箱或密码错误' })
  }

  const { token } = createSession(user.id)
  setCookie(event, 'session_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  })

  return { success: true, user: { id: user.id, username: user.username, email: user.email } }
})
```

- [ ] **Step 3: 登出 API**

```typescript
// server/api/auth/logout.post.ts
import { defineEventHandler, getCookie, deleteCookie } from 'h3'
import { deleteSession } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'session_token')
  if (token) {
    deleteSession(token)
  }
  deleteCookie(event, 'session_token')
  return { success: true }
})
```

- [ ] **Step 4: 获取当前用户 API**

```typescript
// server/api/auth/me.get.ts
import { defineEventHandler } from 'h3'
import { requireAuth } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  return { user }
})
```

- [ ] **Step 5: Commit**

```bash
git add server/api/auth/
git commit -m "feat: 认证 API - 注册/登录/登出/获取用户"
```

---

## Task 4: 认证页面 + useAuth composable

**Files:**
- Create: `composables/useAuth.ts`
- Create: `pages/login.vue`
- Create: `pages/register.vue`
- Modify: `app.vue` (添加全局导航守卫)

- [ ] **Step 1: 创建 useAuth composable**

```typescript
// composables/useAuth.ts
interface User {
  id: number
  username: string
  email: string
}

export const useAuth = () => {
  const user = useState<User | null>('auth-user', () => null)
  const loading = useState('auth-loading', () => true)

  // 初始化时检查登录状态
  async function init() {
    loading.value = true
    try {
      const data = await $fetch('/api/auth/me')
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    user.value = data.user
    return data
  }

  async function register(username: string, email: string, password: string) {
    const data = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { username, email, password }
    })
    user.value = data.user
    return data
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/login')
  }

  return { user, loading, init, login, register, logout }
}
```

- [ ] **Step 2: 创建 login.vue**

```vue
<!-- pages/login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="text-4xl mb-2">📖</div>
        <h1 class="text-2xl font-bold text-gray-800">圣经打卡</h1>
        <p class="text-gray-400 text-sm mt-1">登录你的账号</p>
      </div>

      <form @submit.prevent="handleLogin" class="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">邮箱</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="your@email.com"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">密码</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
          />
        </div>

        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          {{ submitting ? '登录中...' : '登录' }}
        </button>

        <p class="text-center text-sm text-gray-400">
          还没有账号？
          <NuxtLink to="/register" class="text-emerald-500 hover:text-emerald-600">注册</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { login } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function handleLogin() {
  error.value = ''
  submitting.value = true
  try {
    await login(email.value, password.value)
    router.push('/')
  } catch (e: any) {
    error.value = e.data?.statusMessage || '登录失败'
  } finally {
    submitting.value = false
  }
}
</script>
```

- [ ] **Step 3: 创建 register.vue**

```vue
<!-- pages/register.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="text-4xl mb-2">📖</div>
        <h1 class="text-2xl font-bold text-gray-800">圣经打卡</h1>
        <p class="text-gray-400 text-sm mt-1">创建新账号</p>
      </div>

      <form @submit.prevent="handleRegister" class="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">用户名</label>
          <input
            v-model="username"
            type="text"
            required
            placeholder="你的昵称"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">邮箱</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="your@email.com"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">密码</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            placeholder="至少 6 位"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
          />
        </div>

        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          {{ submitting ? '注册中...' : '注册' }}
        </button>

        <p class="text-center text-sm text-gray-400">
          已有账号？
          <NuxtLink to="/login" class="text-emerald-500 hover:text-emerald-600">登录</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { register } = useAuth()
const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function handleRegister() {
  error.value = ''
  submitting.value = true
  try {
    await register(username.value, email.value, password.value)
    router.push('/')
  } catch (e: any) {
    error.value = e.data?.statusMessage || '注册失败'
  } finally {
    submitting.value = false
  }
}
</script>
```

- [ ] **Step 4: 修改 app.vue — 添加全局导航守卫**

```vue
<template>
  <div>
    <AppHeader v-if="user" />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const { user, loading, init } = useAuth()

onMounted(() => {
  init()
})

// 未登录时重定向到登录页
watchEffect(() => {
  if (!loading.value && !user.value) {
    const publicPages = ['/login', '/register']
    if (!publicPages.includes(useRoute().path)) {
      navigateTo('/login')
    }
  }
})
</script>

<style>
body {
  @apply bg-gray-50 text-gray-800 antialiased;
  font-family: -apple-system, 'Noto Sans SC', system-ui, sans-serif;
}
</style>
```

- [ ] **Step 5: 创建 AppHeader.vue**

```vue
<!-- components/AppHeader.vue -->
<template>
  <header class="bg-white border-b border-gray-100 sticky top-0 z-40">
    <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-gray-800">
        <span class="text-xl">📖</span>
        <span class="hidden sm:inline">圣经打卡</span>
      </NuxtLink>

      <nav class="flex items-center gap-4 text-sm">
        <NuxtLink to="/" class="text-gray-500 hover:text-emerald-600 transition-colors">
          打卡
        </NuxtLink>
        <NuxtLink to="/progress" class="text-gray-500 hover:text-emerald-600 transition-colors">
          进度
        </NuxtLink>
        <span class="text-gray-300">|</span>
        <span class="text-gray-600">{{ user?.username }}</span>
        <button @click="handleLogout" class="text-gray-400 hover:text-red-500 text-xs transition-colors">
          退出
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()

async function handleLogout() {
  await logout()
}
</script>
```

- [ ] **Step 6: Commit**

```bash
git add composables/useAuth.ts pages/login.vue pages/register.vue app.vue components/AppHeader.vue
git commit -m "feat: 认证页面 - 登录/注册 UI + 导航守卫"
```

---

## Task 5: 打卡 API

**Files:**
- Create: `server/api/checkins/index.get.ts`
- Create: `server/api/checkins/index.post.ts`
- Create: `server/api/checkins/[id].delete.ts`
- Create: `server/api/checkins/stats.get.ts`
- Create: `server/api/checkins/progress.get.ts`

- [ ] **Step 1: 查询打卡 API（按日期/按月份）**

```typescript
// server/api/checkins/index.get.ts
import { defineEventHandler, getQuery, createError } from 'h3'
import { getDb } from '../../db/index'
import { requireAuth } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const db = getDb()

  // 按日期查询某天的打卡
  if (query.date) {
    const rows = db.prepare(`
      SELECT * FROM check_ins
      WHERE user_id = ? AND date = ?
      ORDER BY created_at ASC
    `).all(user.id, query.date)
    return { data: rows }
  }

  // 按月份查询有哪些日期打过卡（日历用）
  if (query.month) {
    const rows = db.prepare(`
      SELECT DISTINCT date FROM check_ins
      WHERE user_id = ? AND date LIKE ?
      ORDER BY date ASC
    `).all(user.id, `${query.month}%`) as { date: string }[]
    return { dates: rows.map(r => r.date) }
  }

  // 默认返回最近 30 天
  const rows = db.prepare(`
    SELECT * FROM check_ins
    WHERE user_id = ?
    ORDER BY date DESC, created_at ASC
    LIMIT 100
  `).all(user.id)

  return { data: rows }
})
```

- [ ] **Step 2: 新增打卡 API**

```typescript
// server/api/checkins/index.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { getDb } from '../../db/index'
import { requireAuth } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const db = getDb()

  const { date, book, chapter_start, chapter_end, verse_start, verse_end, note } = body

  if (!date || !book || !chapter_start) {
    throw createError({ statusCode: 400, statusMessage: '请填写日期、书卷和章' })
  }

  if (chapter_start < 1) {
    throw createError({ statusCode: 400, statusMessage: '章数无效' })
  }

  const result = db.prepare(`
    INSERT INTO check_ins (user_id, date, book, chapter_start, chapter_end, verse_start, verse_end, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    user.id,
    date,
    book,
    chapter_start,
    chapter_end || null,
    verse_start || null,
    verse_end || null,
    note || ''
  )

  const record = db.prepare('SELECT * FROM check_ins WHERE id = ?').get(result.lastInsertRowid)
  return { success: true, data: record }
})
```

- [ ] **Step 3: 删除打卡 API**

```typescript
// server/api/checkins/[id].delete.ts
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { getDb } from '../../db/index'
import { requireAuth } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')
  const db = getDb()

  const record = db.prepare('SELECT * FROM check_ins WHERE id = ? AND user_id = ?').get(id, user.id)
  if (!record) {
    throw createError({ statusCode: 404, statusMessage: '记录不存在' })
  }

  db.prepare('DELETE FROM check_ins WHERE id = ?').run(id)
  return { success: true }
})
```

- [ ] **Step 4: 统计 API（连续打卡天数、本月打卡天数）**

```typescript
// server/api/checkins/stats.get.ts
import { defineEventHandler } from 'h3'
import { getDb } from '../../db/index'
import { requireAuth } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const db = getDb()

  // 获取所有有打卡的日期（去重）
  const rows = db.prepare(`
    SELECT DISTINCT date FROM check_ins
    WHERE user_id = ?
    ORDER BY date DESC
  `).all(user.id) as { date: string }[]

  const dates = rows.map(r => r.date)

  // 计算连续打卡天数
  let streak = 0
  const today = new Date()
  // 如果今天还没打卡，从昨天开始算
  const checkDate = dates.includes(today.toISOString().slice(0, 10))
    ? today
    : new Date(today.getTime() - 86400000)

  let current = checkDate
  while (dates.includes(current.toISOString().slice(0, 10))) {
    streak++
    current = new Date(current.getTime() - 86400000)
  }

  // 本月打卡天数
  const month = today.toISOString().slice(0, 7)
  const monthDays = dates.filter(d => d.startsWith(month)).length

  // 总打卡天数
  const totalDays = dates.length

  return {
    streak,
    monthDays,
    totalDays,
    todayChecked: dates.includes(today.toISOString().slice(0, 10))
  }
})
```

- [ ] **Step 5: 阅读进度 API**

```typescript
// server/api/checkins/progress.get.ts
import { defineEventHandler } from 'h3'
import { getDb } from '../../db/index'
import { requireAuth } from '../../middleware/auth'
import { BIBLE_DATA, getAllBooks, getTotalChapters } from '../../db/bible-data'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const db = getDb()

  // 获取用户所有打卡记录中涉及的章节
  const rows = db.prepare(`
    SELECT book, chapter_start, chapter_end FROM check_ins
    WHERE user_id = ?
  `).all(user.id) as { book: string; chapter_start: number; chapter_end: number | null }[]

  // 统计每卷书已读的章数
  const bookChapters: Record<string, Set<number>> = {}

  for (const row of rows) {
    if (!bookChapters[row.book]) {
      bookChapters[row.book] = new Set()
    }
    const end = row.chapter_end ?? row.chapter_start
    for (let ch = row.chapter_start; ch <= end; ch++) {
      bookChapters[row.book].add(ch)
    }
  }

  // 构建进度数据
  const allBooks = getAllBooks()
  const testamentProgress = BIBLE_DATA.map(t => ({
    name: t.name,
    books: t.books.map(b => {
      const read = bookChapters[b.name]?.size || 0
      return {
        name: b.name,
        total: b.chapters,
        read,
        percent: Math.round((read / b.chapters) * 100)
      }
    })
  }))

  const totalRead = Object.values(bookChapters).reduce((sum, set) => sum + set.size, 0)
  const totalChapters = getTotalChapters()

  return {
    totalPercent: Math.round((totalRead / totalChapters) * 100),
    totalRead,
    totalChapters,
    testamentProgress
  }
})
```

- [ ] **Step 6: Commit**

```bash
git add server/api/checkins/
git commit -m "feat: 打卡 API - CRUD + 统计 + 进度"
```

---

## Task 6: 打卡 UI 组件

**Files:**
- Create: `components/BibleBookPicker.vue`
- Create: `components/CheckInForm.vue`

- [ ] **Step 1: 书卷选择器组件**

```vue
<!-- components/BibleBookPicker.vue -->
<template>
  <div class="relative">
    <button
      @click="open = !open"
      type="button"
      class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-left flex items-center justify-between bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
    >
      <span :class="modelValue ? 'text-gray-800' : 'text-gray-400'">
        {{ modelValue || '选择书卷...' }}
      </span>
      <svg class="w-4 h-4 text-gray-400" :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="open" class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      <!-- 搜索框 -->
      <div class="sticky top-0 bg-white p-2 border-b">
        <input
          v-model="search"
          type="text"
          placeholder="搜索书卷..."
          class="w-full px-2 py-1.5 text-sm border border-gray-100 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-400"
        />
      </div>

      <div v-for="testament in filteredBooks" :key="testament.name">
        <div class="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-50">{{ testament.name }}</div>
        <button
          v-for="book in testament.books"
          :key="book.id"
          @click="selectBook(book.name)"
          class="w-full px-3 py-2 text-sm text-left hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
          :class="{ 'bg-emerald-50 text-emerald-700': modelValue === book.name }"
        >
          {{ book.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BIBLE_DATA } from '~/server/db/bible-data'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const open = ref(false)
const search = ref('')

const filteredBooks = computed(() => {
  if (!search.value) return BIBLE_DATA
  const q = search.value.toLowerCase()
  return BIBLE_DATA.map(t => ({
    ...t,
    books: t.books.filter(b => b.name.toLowerCase().includes(q))
  })).filter(t => t.books.length > 0)
})

function selectBook(name: string) {
  emit('update:modelValue', name)
  open.value = false
  search.value = ''
}

// 点击外部关闭
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (open.value) open.value = false
  })
})
</script>
```

- [ ] **Step 2: 打卡表单组件**

```vue
<!-- components/CheckInForm.vue -->
<template>
  <div class="bg-white rounded-xl shadow-sm p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-medium text-gray-600">+ 添加打卡记录</h3>
      <button @click="cancel" class="text-xs text-gray-400 hover:text-gray-600">收起</button>
    </div>

    <div class="space-y-3">
      <!-- 日期 -->
      <input
        v-model="form.date"
        type="date"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />

      <!-- 书卷 -->
      <BibleBookPicker v-model="form.book" />

      <!-- 章节范围 -->
      <div class="flex gap-2">
        <div class="flex-1">
          <label class="block text-xs text-gray-400 mb-1">起始章 *</label>
          <input
            v-model.number="form.chapter_start"
            type="number"
            min="1"
            placeholder="1"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div class="flex-1">
          <label class="block text-xs text-gray-400 mb-1">结束章</label>
          <input
            v-model.number="form.chapter_end"
            type="number"
            min="1"
            placeholder="同章留空"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      <!-- 节范围 -->
      <div class="flex gap-2">
        <div class="flex-1">
          <label class="block text-xs text-gray-400 mb-1">起始节</label>
          <input
            v-model.number="form.verse_start"
            type="number"
            min="1"
            placeholder="整章留空"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div class="flex-1">
          <label class="block text-xs text-gray-400 mb-1">结束节</label>
          <input
            v-model.number="form.verse_end"
            type="number"
            min="1"
            placeholder="单节留空"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      <!-- 笔记 -->
      <textarea
        v-model="form.note"
        placeholder="默想笔记（可选）"
        rows="2"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
      ></textarea>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

      <div class="flex gap-2">
        <button
          @click="submit"
          :disabled="submitting"
          class="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-2 rounded-lg text-sm transition-colors"
        >
          {{ submitting ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  saved: [record: any]
  cancel: []
}>()

const today = new Date().toISOString().slice(0, 10)

const form = reactive({
  date: today,
  book: '',
  chapter_start: null as number | null,
  chapter_end: null as number | null,
  verse_start: null as number | null,
  verse_end: null as number | null,
  note: ''
})

const error = ref('')
const submitting = ref(false)

async function submit() {
  error.value = ''

  if (!form.book) {
    error.value = '请选择书卷'
    return
  }
  if (!form.chapter_start) {
    error.value = '请填写章数'
    return
  }

  submitting.value = true
  try {
    const data = await $fetch('/api/checkins', {
      method: 'POST',
      body: {
        date: form.date,
        book: form.book,
        chapter_start: form.chapter_start,
        chapter_end: form.chapter_end || undefined,
        verse_start: form.verse_start || undefined,
        verse_end: form.verse_end || undefined,
        note: form.note
      }
    })
    emit('saved', data.data)
    // 重置表单
    form.book = ''
    form.chapter_start = null
    form.chapter_end = null
    form.verse_start = null
    form.verse_end = null
    form.note = ''
  } catch (e: any) {
    error.value = e.data?.statusMessage || '保存失败'
  } finally {
    submitting.value = false
  }
}

function cancel() {
  emit('cancel')
}
</script>
```

- [ ] **Step 3: Commit**

```bash
git add components/BibleBookPicker.vue components/CheckInForm.vue
git commit -m "feat: 打卡组件 - 书卷选择器 + 打卡表单"
```

---

## Task 7: 时间线 + 日历组件 + 首页

**Files:**
- Create: `components/Timeline.vue`
- Create: `components/TimelineItem.vue`
- Create: `components/Calendar.vue`
- Create: `pages/index.vue`

- [ ] **Step 1: 格式化章节显示的工具函数**

在 `components/TimelineItem.vue` 中内联实现，逻辑：

```typescript
function formatReference(item: { book: string; chapter_start: number; chapter_end: number | null; verse_start: number | null; verse_end: number | null }): string {
  let ref = `${item.book} ${item.chapter_start}`
  if (item.chapter_end && item.chapter_end !== item.chapter_start) {
    ref += `-${item.chapter_end}`
  }
  if (item.verse_start != null) {
    ref += `:${item.verse_start}`
    if (item.verse_end != null) {
      ref += `-${item.verse_end}`
    }
  }
  return ref
}
```

- [ ] **Step 2: 创建 TimelineItem.vue**

```vue
<!-- components/TimelineItem.vue -->
<template>
  <div class="bg-white rounded-lg p-3 border border-gray-100 hover:border-emerald-100 transition-colors">
    <div class="flex justify-between items-start">
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-gray-800">{{ displayRef }}</div>
        <p v-if="item.note" class="text-xs text-gray-400 mt-1 line-clamp-2">{{ item.note }}</p>
      </div>
      <div class="flex gap-2 ml-3 flex-shrink-0">
        <button @click="$emit('share', item)" class="text-xs text-gray-300 hover:text-emerald-500 transition-colors" title="生成卡片">
          ✂️
        </button>
        <button @click="handleDelete" class="text-xs text-gray-300 hover:text-red-500 transition-colors" title="删除">
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CheckInRecord {
  id: number
  book: string
  chapter_start: number
  chapter_end: number | null
  verse_start: number | null
  verse_end: number | null
  note: string
}

const props = defineProps<{ item: CheckInRecord }>()
const emit = defineEmits<{ delete: [id: number]; share: [item: CheckInRecord] }>()

const displayRef = computed(() => {
  const i = props.item
  let ref = `${i.book} ${i.chapter_start}`
  if (i.chapter_end && i.chapter_end !== i.chapter_start) {
    ref += `-${i.chapter_end}`
  }
  if (i.verse_start != null) {
    ref += `:${i.verse_start}`
    if (i.verse_end != null && i.verse_end !== i.verse_start) {
      ref += `-${i.verse_end}`
    }
  }
  return ref
})

async function handleDelete() {
  if (!confirm('确定删除这条记录？')) return
  try {
    await $fetch(`/api/checkins/${props.item.id}`, { method: 'DELETE' })
    emit('delete', props.item.id)
  } catch {
    alert('删除失败')
  }
}
</script>
```

- [ ] **Step 3: 创建 Timeline.vue**

```vue
<!-- components/Timeline.vue -->
<template>
  <div class="space-y-4">
    <div v-for="group in grouped" :key="group.date" class="space-y-2">
      <!-- 日期分组标题 -->
      <div class="flex items-center gap-2">
        <div class="text-sm font-bold" :class="group.isToday ? 'text-emerald-600' : 'text-gray-500'">
          {{ formatDate(group.date) }}
        </div>
        <div class="flex-1 h-px bg-gray-100"></div>
        <span class="text-xs text-gray-400">{{ group.items.length }} 条</span>
      </div>

      <!-- 打卡条目列表 -->
      <div class="border-l-2 ml-1" :class="group.isToday ? 'border-emerald-200' : 'border-gray-100'">
        <div class="pl-4 space-y-2 pb-1">
          <TimelineItem
            v-for="item in group.items"
            :key="item.id"
            :item="item"
            @delete="(id) => $emit('delete', id)"
            @share="(item) => $emit('share', item)"
          />
        </div>
      </div>
    </div>

    <div v-if="!grouped.length" class="text-center py-12 text-gray-400">
      <div class="text-3xl mb-2">📖</div>
      <p class="text-sm">还没有打卡记录</p>
      <p class="text-xs mt-1">点击下方按钮开始今天的读经打卡</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CheckInRecord {
  id: number
  date: string
  book: string
  chapter_start: number
  chapter_end: number | null
  verse_start: number | null
  verse_end: number | null
  note: string
}

const props = defineProps<{ records: CheckInRecord[] }>()
defineEmits<{ delete: [id: number]; share: [item: CheckInRecord] }>()

const grouped = computed(() => {
  const groups: Record<string, CheckInRecord[]> = {}
  for (const r of props.records) {
    if (!groups[r.date]) groups[r.date] = []
    groups[r.date].push(r)
  }

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      items,
      isToday: date === today,
      isYesterday: date === yesterday
    }))
})

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const month = d.getMonth() + 1
  const day = d.getDate()
  const wd = weekdays[d.getDay()]

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  if (dateStr === todayStr) return `今天 · ${month}月${day}日`
  const yesterday = new Date(today.getTime() - 86400000).toISOString().slice(0, 10)
  if (dateStr === yesterday) return `昨天 · ${month}月${day}日`

  return `${month}月${day}日 · ${wd}`
}
</script>
```

- [ ] **Step 4: 创建 Calendar.vue**

```vue
<!-- components/Calendar.vue -->
<template>
  <div>
    <!-- 月份导航 -->
    <div class="flex items-center justify-between mb-3">
      <button @click="prevMonth" class="p-1 hover:bg-gray-100 rounded text-gray-400">
        ←
      </button>
      <div class="text-sm font-medium text-gray-700">{{ currentYear }}年{{ currentMonth + 1 }}月</div>
      <button @click="nextMonth" class="p-1 hover:bg-gray-100 rounded text-gray-400">
        →
      </button>
    </div>

    <!-- 星期标题 -->
    <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-1">
      <div v-for="d in weekDays" :key="d">{{ d }}</div>
    </div>

    <!-- 日期网格 -->
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="(cell, idx) in calendarCells"
        :key="idx"
        @click="cell.date && $emit('selectDate', cell.date)"
        class="aspect-square flex items-center justify-center text-xs rounded-full cursor-pointer transition-colors"
        :class="cellClasses(cell)"
      >
        {{ cell.day }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ checkedDates: string[] }>()
defineEmits<{ selectDate: [date: string] }>()

const weekDays = ['一', '二', '三', '四', '五', '六', '日']
const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())

const todayStr = computed(() => now.toISOString().slice(0, 10))

const calendarCells = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // 周一=0
  const daysInMonth = lastDay.getDate()

  const cells: Array<{ day: number | null; date: string | null; isToday: boolean; checked: boolean }> = []

  // 空白填充
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: null, date: null, isToday: false, checked: false })
  }

  // 日期
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      day: d,
      date: dateStr,
      isToday: dateStr === todayStr.value,
      checked: props.checkedDates.includes(dateStr)
    })
  }

  return cells
})

function cellClasses(cell: any) {
  if (!cell.date) return 'text-transparent'
  return {
    'bg-emerald-500 text-white': cell.isToday,
    'bg-emerald-100 text-emerald-700': cell.checked && !cell.isToday,
    'hover:bg-gray-100 text-gray-700': !cell.checked && !cell.isToday
  }
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}
</script>
```

- [ ] **Step 5: 创建首页 index.vue**

```vue
<!-- pages/index.vue -->
<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <!-- 桌面端：左右分栏 -->
    <div class="lg:flex lg:gap-6">
      <!-- 左栏（桌面） / 上方（移动） -->
      <div class="lg:w-72 space-y-4">
        <!-- 统计卡片 -->
        <div v-if="stats" class="bg-white rounded-xl shadow-sm p-4 hidden lg:block">
          <div class="text-xs text-gray-400 mb-1">总阅读进度</div>
          <div class="text-lg font-bold text-emerald-600">{{ progress }}%</div>
          <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1">
            <div class="bg-emerald-500 rounded-full h-1.5 transition-all" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="mt-3 flex justify-between text-xs text-gray-400">
            <span>🔥 连续 {{ stats.streak }} 天</span>
            <span>📅 本月 {{ stats.monthDays }} 天</span>
          </div>
          <NuxtLink to="/progress" class="block mt-3 text-xs text-emerald-600 font-medium hover:text-emerald-700">
            📊 查看完整进度 →
          </NuxtLink>
        </div>

        <!-- 日历（移动端可折叠，桌面常开） -->
        <div class="bg-white rounded-xl shadow-sm p-4">
          <details :open="isDesktop" class="group">
            <summary class="text-sm font-medium text-gray-600 cursor-pointer list-none flex items-center justify-between lg:hidden">
              <span>📅 日历</span>
              <span class="text-xs text-gray-400 group-open:hidden">展开</span>
              <span class="text-xs text-gray-400 hidden group-open:inline">收起</span>
            </summary>
            <div class="mt-3">
              <Calendar :checked-dates="checkedDates" @select-date="selectDate" />
            </div>
          </details>
          <div class="hidden lg:block">
            <Calendar :checked-dates="checkedDates" @select-date="selectDate" />
          </div>
        </div>
      </div>

      <!-- 右栏（桌面）/ 主体（移动） -->
      <div class="flex-1 mt-4 lg:mt-0 space-y-4">
        <!-- 移动端统计 -->
        <div v-if="stats" class="bg-white rounded-xl shadow-sm p-4 flex items-center justify-around lg:hidden">
          <div class="text-center">
            <div class="text-lg font-bold text-emerald-600">{{ progress }}%</div>
            <div class="text-xs text-gray-400">阅读进度</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-amber-500">{{ stats.streak }}</div>
            <div class="text-xs text-gray-400">连续天数</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-blue-500">{{ stats.monthDays }}</div>
            <div class="text-xs text-gray-400">本月天数</div>
          </div>
        </div>

        <!-- 添加打卡按钮 / 表单 -->
        <div v-if="!showForm">
          <button
            @click="showForm = true"
            class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            + 添加今日打卡
          </button>
        </div>
        <CheckInForm
          v-else
          @saved="onSaved"
          @cancel="showForm = false"
        />

        <!-- 时间线 -->
        <Timeline
          :records="records"
          @delete="onDelete"
          @share="onShare"
        />
      </div>
    </div>

    <!-- 分享卡片弹窗 -->
    <ShareCard
      v-if="shareItem"
      :records="shareRecords"
      :username="user?.username || ''"
      @close="shareItem = null"
    />
  </div>
</template>

<script setup lang="ts">
interface CheckInRecord {
  id: number
  date: string
  book: string
  chapter_start: number
  chapter_end: number | null
  verse_start: number | null
  verse_end: number | null
  note: string
}

const { user } = useAuth()
const showForm = ref(false)
const records = ref<CheckInRecord[]>([])
const checkedDates = ref<string[]>([])
const stats = ref<{ streak: number; monthDays: number; totalDays: number } | null>(null)
const progress = ref(0)
const shareItem = ref<CheckInRecord | null>(null)
const shareRecords = ref<CheckInRecord[]>([])

const isDesktop = ref(false)

onMounted(() => {
  isDesktop.value = window.innerWidth >= 1024
  loadRecords()
  loadStats()
  loadProgress()
})

// 监听窗口变化
onMounted(() => {
  window.addEventListener('resize', () => {
    isDesktop.value = window.innerWidth >= 1024
  })
})

const today = new Date().toISOString().slice(0, 10)
const currentMonth = today.slice(0, 7)

async function loadRecords() {
  try {
    const data = await $fetch<{ data: CheckInRecord[] }>('/api/checkins')
    records.value = data.data || []
  } catch { /* ignore */ }
}

async function loadCheckedDates() {
  try {
    const data = await $fetch<{ dates: string[] }>(`/api/checkins?month=${currentMonth}`)
    checkedDates.value = data.dates || []
  } catch { /* ignore */ }
}

async function loadStats() {
  try {
    stats.value = await $fetch('/api/checkins/stats')
  } catch { /* ignore */ }
}

async function loadProgress() {
  try {
    const data = await $fetch<any>('/api/checkins/progress')
    progress.value = data.totalPercent || 0
  } catch { /* ignore */ }
}

async function selectDate(dateStr: string) {
  try {
    const data = await $fetch<{ data: CheckInRecord[] }>(`/api/checkins?date=${dateStr}`)
    records.value = data.data || []
  } catch { /* ignore */ }
}

async function onSaved(record: CheckInRecord) {
  records.value.unshift(record)
  showForm.value = false
  loadCheckedDates()
  loadStats()
  loadProgress()
}

async function onDelete(id: number) {
  records.value = records.value.filter(r => r.id !== id)
  loadCheckedDates()
  loadStats()
  loadProgress()
}

function onShare(item: CheckInRecord) {
  // 收集当天所有记录
  const dateRecords = records.value.filter(r => r.date === item.date)
  shareRecords.value = dateRecords
  shareItem.value = item
}
</script>
```

- [ ] **Step 6: Commit**

```bash
git add components/Timeline.vue components/TimelineItem.vue components/Calendar.vue pages/index.vue
git commit -m "feat: 首页 - 日历 + 时间线 + 打卡表单"
```

---

## Task 8: 阅读进度页面

**Files:**
- Create: `components/ProgressBar.vue`
- Create: `pages/progress.vue`

- [ ] **Step 1: 进度条组件**

```vue
<!-- components/ProgressBar.vue -->
<template>
  <div>
    <div class="flex items-center gap-2">
      <div class="flex-1 bg-gray-100 rounded-full h-2">
        <div
          class="rounded-full h-2 transition-all duration-500"
          :class="colorClass"
          :style="{ width: Math.min(percent, 100) + '%' }"
        ></div>
      </div>
      <span class="text-xs font-medium flex-shrink-0" :class="textClass">{{ percent }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ percent: number }>()

const colorClass = computed(() => {
  if (props.percent >= 100) return 'bg-amber-500'
  if (props.percent >= 50) return 'bg-emerald-500'
  if (props.percent > 0) return 'bg-emerald-400'
  return 'bg-gray-200'
})

const textClass = computed(() => {
  if (props.percent >= 100) return 'text-amber-600'
  if (props.percent > 0) return 'text-emerald-600'
  return 'text-gray-300'
})
</script>
```

- [ ] **Step 2: 阅读进度页面**

```vue
<!-- pages/progress.vue -->
<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <h1 class="text-lg font-bold text-gray-800 mb-4">📊 阅读进度</h1>

    <!-- 总进度 -->
    <div class="bg-white rounded-xl shadow-sm p-5 mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">整本圣经</span>
        <span class="text-lg font-bold text-emerald-600">{{ data?.totalPercent || 0 }}%</span>
      </div>
      <ProgressBar :percent="data?.totalPercent || 0" />
      <div class="text-xs text-gray-400 mt-1">
        已读 {{ data?.totalRead || 0 }} / {{ data?.totalChapters || 1189 }} 章
      </div>
    </div>

    <!-- 各卷进度 -->
    <div v-for="testament in data?.testamentProgress" :key="testament.name" class="mb-4">
      <h2 class="text-sm font-bold text-gray-600 mb-2 px-1">{{ testament.name === '旧约' ? '📜' : '📜' }} {{ testament.name }}</h2>
      <div class="bg-white rounded-xl shadow-sm divide-y divide-gray-50">
        <div
          v-for="book in testament.books"
          :key="book.name"
          @click="toggleBook(book.name)"
          class="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-700 w-20 flex-shrink-0">{{ book.name }}</span>
            <div class="flex-1">
              <ProgressBar :percent="book.percent" />
            </div>
            <span class="text-xs text-gray-400 w-16 text-right flex-shrink-0">
              {{ book.read }}/{{ book.total }}章
            </span>
            <span v-if="book.percent >= 100" class="text-xs">✅</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BookProgress {
  name: string
  total: number
  read: number
  percent: number
}

interface TestamentProgress {
  name: string
  books: BookProgress[]
}

interface ProgressData {
  totalPercent: number
  totalRead: number
  totalChapters: number
  testamentProgress: TestamentProgress[]
}

const data = ref<ProgressData | null>(null)
const expandedBooks = ref<Set<string>>(new Set())

onMounted(async () => {
  try {
    data.value = await $fetch('/api/checkins/progress')
  } catch { /* ignore */ }
})

function toggleBook(name: string) {
  if (expandedBooks.value.has(name)) {
    expandedBooks.value.delete(name)
  } else {
    expandedBooks.value.add(name)
  }
}
</script>
```

- [ ] **Step 3: Commit**

```bash
git add components/ProgressBar.vue pages/progress.vue
git commit -m "feat: 阅读进度页面 - 总进度 + 每卷书进度条"
```

---

## Task 9: 分享卡片组件

**Files:**
- Create: `components/ShareCard.vue`

- [ ] **Step 1: 创建 ShareCard 组件**

```vue
<!-- components/ShareCard.vue -->
<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
      <!-- 卡片预览 -->
      <div ref="cardRef" class="p-6 bg-gradient-to-br from-emerald-50 to-white">
        <div class="text-center">
          <div class="text-3xl mb-2">📖</div>
          <h2 class="text-sm font-bold text-gray-700">今日读经</h2>
        </div>

        <div class="mt-4 space-y-3">
          <div v-for="r in records" :key="r.id" class="text-center">
            <div class="text-base font-bold text-gray-800">{{ formatRef(r) }}</div>
            <p v-if="r.note" class="text-xs text-gray-500 mt-0.5">{{ r.note }}</p>
          </div>
        </div>

        <div class="mt-5 pt-3 border-t border-emerald-100 text-center">
          <div class="text-xs text-gray-400">{{ dateDisplay }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ username }}</div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="p-4 flex gap-2">
        <button @click="$emit('close')" class="flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
          关闭
        </button>
        <button @click="downloadCard" :disabled="downloading" class="flex-1 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-emerald-300">
          {{ downloading ? '生成中...' : '保存图片' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CheckInRecord {
  id: number
  date: string
  book: string
  chapter_start: number
  chapter_end: number | null
  verse_start: number | null
  verse_end: number | null
  note: string
}

const props = defineProps<{
  records: CheckInRecord[]
  username: string
}>()

defineEmits<{ close: [] }>()

const cardRef = ref<HTMLDivElement | null>(null)
const downloading = ref(false)

// 只在客户端引入 html-to-image
const { toPng } = await import('html-to-image')

const dateDisplay = computed(() => {
  if (!props.records.length) return ''
  const d = new Date(props.records[0].date + 'T00:00:00')
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

function formatRef(r: CheckInRecord): string {
  let ref = `${r.book} ${r.chapter_start}`
  if (r.chapter_end && r.chapter_end !== r.chapter_start) {
    ref += `-${r.chapter_end}`
  }
  if (r.verse_start != null) {
    ref += `:${r.verse_start}`
    if (r.verse_end != null && r.verse_end !== r.verse_start) {
      ref += `-${r.verse_end}`
    }
  }
  return ref
}

async function downloadCard() {
  if (!cardRef.value) return
  downloading.value = true
  try {
    const dataUrl = await toPng(cardRef.value, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    })
    const link = document.createElement('a')
    link.download = `bible-checkin-${props.records[0]?.date || 'card'}.png`
    link.href = dataUrl
    link.click()
  } catch (err) {
    console.error('生成卡片失败', err)
    alert('生成卡片失败，请重试')
  } finally {
    downloading.value = false
  }
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add components/ShareCard.vue
git commit -m "feat: 分享卡片组件 - 预览 + 下载 PNG"
```

---

## Task 10: 验证 + 构建测试

- [ ] **Step 1: 启动开发服务器并确认可运行**

Run: `npx nuxi dev`
Expected: 服务启动在 http://localhost:3000，注册/登录/打卡流程正常

- [ ] **Step 2: 构建生产版本**

Run: `npm run build`
Expected: 编译成功，生成 .output/ 目录

- [ ] **Step 3: 最终 commit**

```bash
git add -A && git commit -m "chore: v1.0 完成 - 圣经打卡应用"
```

---

## 验证清单

| 功能 | 验收条件 |
|---|---|
| 注册 | 填写用户名+邮箱+密码，成功后自动登录跳转首页 |
| 登录 | 邮箱+密码，成功后跳转首页 |
| 登出 | 点击退出，跳转登录页，未登录无法访问首页 |
| 添加打卡 | 选书卷 → 填章/节 → 可选笔记 → 保存后在时间线出现 |
| 删除打卡 | 点击 🗑️ → 确认删除 → 时间线移除 |
| 日历 | 显示已打卡日期的高亮，点击日期过滤时间线 |
| 统计 | 首页显示进度%、连续天数、本月天数 |
| 进度页 | 66卷书列表，每卷显示进度条 |
| 卡片分享 | 点击 ✂️ → 预览带日期和笔记的卡片 → 下载 PNG |
| 响应式 | 手机端上下布局，桌面端左右分栏 |
