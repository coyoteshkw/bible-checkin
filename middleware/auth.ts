export default defineNuxtRouteMiddleware((to, from) => {
  // 客户端检查：尝试从 useAuth 获取用户状态
  if (import.meta.client) {
    const { user, loading } = useAuth()
    if (!loading.value && !user.value) {
      return navigateTo('/login')
    }
  }
})
