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
