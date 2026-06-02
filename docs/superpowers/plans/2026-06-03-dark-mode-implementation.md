# 深色模式完整实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为所有页面和组件完整实现深色模式，使用 Tailwind `dark:` 变体 + `darkMode: 'class'` 策略，不依赖全局 CSS 覆盖。

**Architecture:** Tailwind `darkMode: 'class'` 策略。`useDarkMode` composable 管理切换 + localStorage 持久化 + 系统偏好跟随。所有颜色通过 `dark:` 前缀变体逐组件控制。body 用 `transition-colors` 过渡。

**Tech Stack:** Tailwind CSS `dark:` variants, composables/useDarkMode.ts

---

### 文件映射

| 文件 | 改动 |
|------|------|
| `tailwind.config.js` | 添加 `darkMode: 'class'` |
| `composables/useDarkMode.ts` | 新建 — 深色模式状态管理 |
| `app.vue` | body 添加 `dark:` 变体 + JS 初始化 |
| `components/AppHeader.vue` | 深色样式 + 切换按钮 |
| `components/Calendar.vue` | 深色样式 |
| `components/CheckInForm.vue` | 深色样式 |
| `components/ChapterPicker.vue` | 深色样式 |
| `components/BibleBookPicker.vue` | 深色样式 |
| `components/Timeline.vue` | 深色样式 |
| `components/TimelineItem.vue` | 深色样式 |
| `components/ShareCard.vue` | 深色样式 |
| `components/ConfirmDialog.vue` | 深色样式 |
| `components/ProgressBar.vue` | 深色样式 |
| `pages/index.vue` | 深色样式 |
| `pages/login.vue` | 深色样式 |
| `pages/register.vue` | 深色样式 |
| `pages/progress.vue` | 深色样式 |
| `pages/about.vue` | 深色样式 |
| `tests/dark-mode.test.ts` | 新建 — 深色模式逻辑测试 |

---

### Task 1: 基础设施 — tailwind.config + composable + app.vue

**Files:**
- Modify: `tailwind.config.js`
- Create: `composables/useDarkMode.ts`
- Modify: `app.vue`
- Test: `tests/dark-mode.test.ts`

- [ ] **Step 1: 更新 tailwind.config.js**

```js
export default {
  darkMode: 'class',
  content: [
    './app.vue',
    './pages/**/*.vue',
    './components/**/*.vue'
  ],
  // ... rest unchanged
}
```

- [ ] **Step 2: 创建 composables/useDarkMode.ts**

```ts
export const useDarkMode = () => {
  const isDark = useState('dark-mode', () => false)

  function apply(val: boolean) {
    isDark.value = val
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', val)
      localStorage.setItem('dark-mode', val ? 'true' : 'false')
    }
  }

  function toggle() { apply(!isDark.value) }

  function init() {
    if (import.meta.client) {
      const saved = localStorage.getItem('dark-mode')
      if (saved === null) {
        apply(window.matchMedia('(prefers-color-scheme: dark)').matches)
      } else {
        apply(saved === 'true')
      }
    }
  }

  return { isDark, toggle, init }
}
```

- [ ] **Step 3: 更新 app.vue**

```vue
<script setup>
const { user, loading, init } = useAuth()
const { init: initDark } = useDarkMode()

onMounted(() => {
  init()
  initDark()
})
</script>

<style>
body {
  @apply bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 antialiased transition-colors duration-200;
}
</style>
```

- [ ] **Step 4: 写测试 tests/dark-mode.test.ts 并验证**

```ts
// 测试深色模式核心逻辑
import { strict as assert } from 'assert'

const store: Record<string, string> = {}
let htmlClass = ''
globalThis.localStorage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
  get length() { return Object.keys(store).length },
  key: (i: number) => Object.keys(store)[i] ?? null
} as any

function createDarkMode() {
  let isDark = false
  function apply(val: boolean) { isDark = val; htmlClass = val ? 'dark' : ''; localStorage.setItem('dark-mode', val ? 'true' : 'false') }
  function toggle() { apply(!isDark) }
  function init() {
    const saved = localStorage.getItem('dark-mode')
    if (saved === null) apply(false)
    else apply(saved === 'true')
  }
  return { get isDark() { return isDark }, toggle, init }
}
// ... 8 test cases
```

Run: `npx tsx tests/dark-mode.test.ts`
Expected: 8 passing

- [ ] **Step 5: 安装依赖**

Run: `npm install`
Expected: dependencies installed

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.js composables/useDarkMode.ts app.vue tests/dark-mode.test.ts
git commit -m "feat: 深色模式基础设施 - tailwind class 策略 + composable + 测试"
```

---

### Task 2: AppHeader — 背景、导航、用户下拉、切换按钮

**Files:**
- Modify: `components/AppHeader.vue`

- [ ] **Step 1: 添加 dark 样式到 AppHeader 根元素和所有子元素**

```vue
<!-- 根 header -->
<header class="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 transition-colors">

<!-- 导航链接：保留现有 text-gray-500，添加 dark:text-gray-400 -->
<NuxtLink to="/" class="... text-gray-500 dark:text-gray-400 hover:text-emerald-600 ...">

<!-- 用户名 -->
<span class="text-gray-600 dark:text-gray-300">{{ user?.username }}</span>

<!-- 用户下拉菜单容器 -->
<div class="relative ...">

<!-- 下拉菜单 -->
<div v-show="menuOpen" class="absolute ... bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 ...">

<!-- 清空进度按钮 -->
<button @click="..." class="... text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 ...">

<!-- 退出按钮 -->
<button @click="..." class="text-gray-400 dark:text-gray-500 hover:text-red-500 ...">
```

- [ ] **Step 2: 添加深色模式切换按钮**

```vue
<!-- 放在退出按钮之前 -->
<button @click="toggle" class="text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400 text-xs transition-colors p-1" :title="isDark ? '切换浅色' : '切换深色'">
  <Sun v-if="!isDark" class="w-4 h-4" />
  <Moon v-else class="w-4 h-4 text-amber-400" />
</button>
```

- [ ] **Step 3: 添加 import**

```ts
import { ..., Sun, Moon } from 'lucide-vue-next'
const { isDark, toggle } = useDarkMode()
```

- [ ] **Step 4: 构建验证**

Run: `npx nuxi build`
Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add components/AppHeader.vue
git commit -m "feat: AppHeader 深色模式 - 导航+下拉+切换按钮"
```

---

### Task 3: 首页面板 — Calendar + 统计 + 日期标题

**Files:**
- Modify: `components/Calendar.vue`
- Modify: `pages/index.vue`

- [ ] **Step 1: Calendar.vue — 容器 + 文字 + 网格按钮**

```vue
<!-- 日历卡片容器 -->
<div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 transition-colors">

<!-- 月份文字 -->
<span class="... text-gray-700 dark:text-gray-300">

<!-- 月份切换 -->
<button class="... text-gray-400 dark:text-gray-500 hover:text-emerald-500 ...">

<!-- 星期行 -->
<span class="... text-gray-400 dark:text-gray-500">

<!-- 日期按钮 — 未选中的已打卡日期 -->
'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
  hover:bg-emerald-200 dark:hover:bg-emerald-800

<!-- 日期按钮 — 未选中的未打卡日期 -->
'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'

<!-- 日期按钮 — 未来日期 -->
'text-gray-300 dark:text-gray-700'
```

- [ ] **Step 2: pages/index.vue — 统计面板 + 日期标题**

```vue
<!-- 统计面板容器 -->
<div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 space-y-3 transition-colors">

<!-- 今日/昨天/日期文字 — 用 dark:text-gray-300 继承 body 的 text-gray-100 即可 -->
```

- [ ] **Step 3: 构建验证**

Run: `npx nuxi build`
Expected: 无错误

- [ ] **Step 4: Commit**

```bash
git add components/Calendar.vue pages/index.vue
git commit -m "feat: 日历+统计面板深色模式"
```

---

### Task 4: 打卡表单 — CheckInForm + ChapterPicker + BibleBookPicker

**Files:**
- Modify: `components/CheckInForm.vue`
- Modify: `components/ChapterPicker.vue`
- Modify: `components/BibleBookPicker.vue`

- [ ] **Step 1: CheckInForm.vue**

```vue
<!-- 表单根容器 -->
<div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">

<!-- 展开按钮 -->
<button class="... text-gray-600 dark:text-gray-400 hover:text-emerald-600 ...">

<!-- 章节选中的背景 -->
<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">

<!-- 预览 -->
<div class="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-3 text-sm text-emerald-800 dark:text-emerald-300">

<!-- 输入框 — 章节输入 -->
<input class="... border-gray-200 dark:border-gray-600 ... dark:bg-gray-800 dark:text-gray-100 ...">

<!-- 输入框 — 节输入 -->
<input class="... dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ...">

<!-- 文本域 — 笔记 -->
<textarea class="... dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ...">
```

- [ ] **Step 2: ChapterPicker.vue**

```vue
<!-- 未选书卷 -->
<div class="text-center py-4 text-gray-300 dark:text-gray-600 text-sm">

<!-- 选中文字 -->
<span class="... text-emerald-700 dark:text-emerald-400">

<!-- 未选中的按钮 -->
'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
```

- [ ] **Step 3: BibleBookPicker.vue**

```vue
<!-- 触发器按钮 -->
<button class="... border-gray-200 dark:border-gray-600 ... bg-white dark:bg-gray-800 ... dark:text-gray-100">

<!-- 选中文字 -->
<span :class="selected ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'">

<!-- 下拉菜单 -->
<div class="absolute ... bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 ...">

<!-- 旧约/新约标题 -->
<div class="... text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 ...">

<!-- 书卷选项按钮 -->
<button class="... hover:bg-emerald-50 dark:hover:bg-emerald-900/30 ...">
  :class="{ 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium': ... }"
```

- [ ] **Step 4: 构建验证**

Run: `npx nuxi build`
Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add components/CheckInForm.vue components/ChapterPicker.vue components/BibleBookPicker.vue
git commit -m "feat: 打卡表单+章节选择器+书卷选择器深色模式"
```

---

### Task 5: 时间线 — Timeline + TimelineItem

**Files:**
- Modify: `components/Timeline.vue`
- Modify: `components/TimelineItem.vue`

- [ ] **Step 1: Timeline.vue**

```vue
<!-- 圆点 — 历史日期 -->
'w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 ring-gray-50 dark:ring-gray-900'

<!-- 竖线 — 今天的连线 -->
'bg-emerald-200 dark:bg-emerald-800'

<!-- 竖线 — 历史的连线 -->
'bg-gray-200 dark:bg-gray-700'

<!-- 日期标题 — 历史 -->
'text-gray-500 dark:text-gray-400'

<!-- 日期标题 — 条数 -->
<span class="text-xs text-gray-300 dark:text-gray-600">

<!-- 加载更多按钮 — 默认 -->
'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'

<!-- 加载更多按钮 — 加载中 -->
'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800 cursor-wait'

<!-- 空状态 -->
<p class="... text-gray-300 dark:text-gray-600 ...">

<!-- 已加载全部 -->
<p class="... text-gray-300 dark:text-gray-600 ...">
```

- [ ] **Step 2: TimelineItem.vue**

```vue
<!-- 卡片容器 -->
<div class="group bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">

<!-- 书卷徽章 -->
<span class="... bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">

<!-- 章节引用 -->
<div class="text-base font-bold text-gray-800 dark:text-gray-100">

<!-- 笔记 -->
<p class="text-sm text-gray-500 dark:text-gray-400">

<!-- 操作按钮 hover 背景 -->
'p-1.5 text-gray-300 dark:text-gray-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30'
'p-1.5 text-gray-300 dark:text-gray-600 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
'p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
```

- [ ] **Step 3: 构建验证**

Run: `npx nuxi build`
Expected: 无错误

- [ ] **Step 4: Commit**

```bash
git add components/Timeline.vue components/TimelineItem.vue
git commit -m "feat: 时间线深色模式 - 圆点+竖线+卡片+加载更多"
```

---

### Task 6: 弹窗类 — ShareCard + ConfirmDialog

**Files:**
- Modify: `components/ShareCard.vue`
- Modify: `components/ConfirmDialog.vue`

- [ ] **Step 1: ShareCard.vue**

```vue
<!-- 卡片容器 -->
<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden transition-colors">

<!-- 卡片预览渐变背景 -->
<div ref="cardEl" class="p-6 bg-gradient-to-br from-emerald-50 dark:from-emerald-900/30 to-white dark:to-gray-900">

<!-- 标题 -->
<h3 class="... text-gray-800 dark:text-gray-100">

<!-- 章节文字 -->
<div class="... text-emerald-700 dark:text-emerald-300">

<!-- 关闭按钮 -->
<button class="... text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
```

- [ ] **Step 2: ConfirmDialog.vue**

```vue
<!-- 弹窗容器 -->
<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">

<!-- 标题 -->
<h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">

<!-- 消息 -->
<p class="text-sm text-gray-500 dark:text-gray-400">

<!-- 取消按钮 -->
<button class="... text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">

<!-- 深色图标颜色 -->
<Trash2 class="w-12 h-12 text-red-400 dark:text-red-500 mx-auto mb-3" />
```

- [ ] **Step 3: 构建验证**

Run: `npx nuxi build`
Expected: 无错误

- [ ] **Step 4: Commit**

```bash
git add components/ShareCard.vue components/ConfirmDialog.vue
git commit -m "feat: 分享卡片+确认弹窗深色模式"
```

---

### Task 7: 登录/注册/关于页面

**Files:**
- Modify: `pages/login.vue`
- Modify: `pages/register.vue`
- Modify: `pages/about.vue`

- [ ] **Step 1: login.vue + register.vue**

```vue
<!-- 背景容器 -->
<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors">

<!-- 卡片 -->
<form class="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 space-y-4 transition-colors">

<!-- 标题文字 — 用默认的 dark:text-gray-100 继承 body -->

<!-- 输入框 — 邮箱/用户名/密码 -->
<input class="... border-gray-200 dark:border-gray-600 ... dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ...">

<!-- 错误信息 -->
<p class="text-red-500 dark:text-red-400 text-sm">
```

- [ ] **Step 2: about.vue**

```vue
<!-- dark: 变体已由 body 继承，只需要改特定颜色 -->
<!-- 分割线 -->
<div class="border-t border-gray-100 dark:border-gray-800 pt-6">

<!-- 正文文字 — 用 dark:text-gray-300 继承 body -->
<p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">

<!-- 返回链接 -->
<NuxtLink to="/" class="text-sm text-gray-400 dark:text-gray-500 hover:text-emerald-500 ...">
```

- [ ] **Step 3: 构建验证**

Run: `npx nuxi build`
Expected: 无错误

- [ ] **Step 4: Commit**

```bash
git add pages/login.vue pages/register.vue pages/about.vue
git commit -m "feat: 登录/注册/关于页面深色模式"
```

---

### Task 8: 进度页面 — ProgressBar + progress.vue

**Files:**
- Modify: `components/ProgressBar.vue`
- Modify: `pages/progress.vue`

- [ ] **Step 1: ProgressBar.vue**

```vue
<!-- 背景轨道 -->
<div class="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">

<!-- 百分比文字 -->
<span class="text-xs font-medium text-gray-500 dark:text-gray-400 w-10 text-right">{{ percentage }}%</span>
```

- [ ] **Step 2: progress.vue**

```vue
<!-- 各卡片容器 — 已由前面所有页面统一模式 -->
<div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 transition-colors">

<!-- 书卷名称 -->
<span class="text-xs w-20 text-gray-500 dark:text-gray-400 font-medium truncate">

<!-- 已读完/未读完文字 -->
<span class="text-xs text-gray-400 dark:text-gray-500 w-16 text-right">

<!-- 已读完勾号 -->
<span class="text-emerald-500 dark:text-emerald-400 text-xs">✓</span>

<!-- 章节网格 — 灰色格子 -->
'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'

<!-- 章节网格 — 已读格子 -->
'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200'

<!-- 已读完标签 -->
<span class="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full">
```

- [ ] **Step 3: 构建验证**

Run: `npx nuxi build`
Expected: 无错误

- [ ] **Step 4: Commit**

```bash
git add components/ProgressBar.vue pages/progress.vue
git commit -m "feat: 进度页面深色模式 - 进度条+书卷列表+章节网格"
```

---

### 最终验证

- [ ] **Step 1: 运行全部测试**

```bash
npx tsx tests/dark-mode.test.ts
npx tsx tests/validation.test.ts
```
Expected: 全部通过

- [ ] **Step 2: 运行 dev server 手动检查**

```bash
npx nuxi dev --port 3333
```

- [ ] **Step 3: 最终提交**

```bash
git add -A && git commit -m "feat: 完整深色模式实现 - 所有页面和组件"
```
