<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 transition-colors">
    <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
      <NuxtLink to="/app" class="flex items-center gap-2 font-bold text-gray-800">
        <BookOpen class="w-5 h-5 text-emerald-500" />
        <span class="hidden sm:inline">圣经打卡</span>
      </NuxtLink>

      <nav class="flex items-center gap-4 text-sm">
        <NuxtLink to="/app" class="text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors">
          打卡
        </NuxtLink>
        <NuxtLink to="/progress" class="text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors">
          进度
        </NuxtLink>
        <NuxtLink to="/about" class="text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors">
          关于
        </NuxtLink>
        <span class="text-gray-300">|</span>

        <!-- 用户下拉菜单 -->
        <div class="relative" @mouseleave="onMenuLeave">
          <button @click.stop="menuOpen = !menuOpen" class="text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer">
            {{ user?.username }}
            <ChevronDown class="w-3 h-3 transition-transform" :class="{ 'rotate-180': menuOpen }" />
          </button>

          <!-- 下拉框 -->
          <div v-show="menuOpen"
            class="absolute right-0 top-full mt-0.5 w-44 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50"
            @mouseenter="onMenuEnter" @mouseleave="onMenuLeave">
            <button @click="showClearConfirm = true; menuOpen = false"
              class="w-full text-left px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2">
              <Trash2 class="w-4 h-4" />
              清空进度
            </button>
          </div>
        </div>

        <button @click="toggle" class="text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400 text-xs transition-colors p-1" :title="isDark ? '切换浅色' : '切换深色'">
          <Sun v-if="!isDark" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4 text-amber-400" />
        </button>
        <button @click="handleLogout" :disabled="loggingOut" class="text-gray-400 dark:text-gray-500 hover:text-red-500 disabled:text-gray-300 text-xs transition-colors">
          {{ loggingOut ? '退出中...' : '退出' }}
        </button>
      </nav>
    </div>

    <!-- 清空进度确认弹窗 -->
    <ConfirmDialog
      :show="showClearConfirm"
      title="清空所有进度"
      message="确定要清除所有打卡记录吗？此操作不可恢复！"
      confirm-text="确认清空"
      @confirm="handleClearProgress"
      @cancel="showClearConfirm = false"
    />
  </header>
</template>

<script setup lang="ts">
import { BookOpen, ChevronDown, Trash2, Sun, Moon } from 'lucide-vue-next'
const { user, logout } = useAuth()
const { isDark, toggle } = useDarkMode()

const menuOpen = ref(false)
const showClearConfirm = ref(false)
const loggingOut = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

function onMenuEnter() {
  if (hideTimer) clearTimeout(hideTimer)
  menuOpen.value = true
}

function onMenuLeave() {
  hideTimer = setTimeout(() => {
    menuOpen.value = false
  }, 150)
}

async function handleLogout() {
  loggingOut.value = true
  await logout()
}

async function handleClearProgress() {
  showClearConfirm.value = false
  try {
    await $fetch('/api/checkins/clear', { method: 'POST' })
    // 刷新页面重置所有数据
    window.location.reload()
  } catch {
    alert('清空失败，请重试')
  }
}
</script>
