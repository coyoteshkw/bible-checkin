<template>
  <div>
    <AppHeader v-if="user" />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const { user, loading, init } = useAuth()
const { init: initDark } = useDarkMode()

onMounted(() => {
  init()
  initDark()
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
html { transition: background-color .15s; }
body {
  @apply bg-gray-50 text-gray-800 antialiased;
  font-family: -apple-system, 'Noto Sans SC', system-ui, sans-serif;
}
.dark body,
.dark .bg-white,
.dark .bg-gray-50 { background:#111827; }
.dark .border-gray-50 { border-color:#1f2937; }
.dark .border-gray-100 { border-color:#1f2937; }
.dark .border-gray-200 { border-color:#374151; }
.dark .text-gray-300 { color:#6b7280; }
.dark .text-gray-400 { color:#9ca3af; }
.dark .text-gray-500,
.dark .text-gray-600 { color:#d1d5db; }
.dark .text-gray-700,
.dark .text-gray-800 { color:#f3f4f6; }
.dark .bg-emerald-50 { background:#064e3b; }
.dark .bg-amber-50 { background:#78350f; }
.dark .text-emerald-700 { color:#6ee7b7; }
.dark .text-amber-700 { color:#fbbf24; }
.dark .bg-gray-100 { background:#374151; }
.dark .bg-emerald-100 { background:#065f46; }
.dark .hover\:bg-gray-100:hover { background:#374151; }
.dark input, .dark select, .dark textarea { background:#374151; color:#f3f4f6; border-color:#4b5563; }
.dark ::-webkit-scrollbar { width:6px; }
.dark ::-webkit-scrollbar-track { background:#1f2937; }
.dark ::-webkit-scrollbar-thumb { background:#4b5563; border-radius:3px; }
.dark ::-webkit-scrollbar-thumb:hover { background:#6b7280; }
.dark * { scrollbar-width:thin; scrollbar-color:#4b5563 #1f2937; }
.dark input::placeholder, .dark textarea::placeholder { color:#6b7280; }
.dark .shadow-sm, .dark .shadow-lg { box-shadow:none; }
</style>
