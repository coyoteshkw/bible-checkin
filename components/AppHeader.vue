<template>
  <header class="bg-white border-b border-gray-100 sticky top-0 z-40">
    <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-gray-800">
        <BookOpen class="w-5 h-5 text-emerald-500" />
        <span class="hidden sm:inline">圣经打卡</span>
      </NuxtLink>

      <nav class="flex items-center gap-4 text-sm">
        <NuxtLink to="/" class="text-gray-500 hover:text-emerald-600 transition-colors">
          打卡
        </NuxtLink>
        <NuxtLink to="/progress" class="text-gray-500 hover:text-emerald-600 transition-colors">
          进度
        </NuxtLink>
        <NuxtLink to="/about" class="text-gray-500 hover:text-emerald-600 transition-colors">
          关于
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
import { BookOpen } from 'lucide-vue-next'
const { user, logout } = useAuth()

async function handleLogout() {
  await logout()
}
</script>
