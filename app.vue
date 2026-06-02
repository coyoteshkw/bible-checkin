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
body {
  @apply bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 antialiased transition-colors duration-200;
  font-family: -apple-system, 'Noto Sans SC', system-ui, sans-serif;
}
</style>
