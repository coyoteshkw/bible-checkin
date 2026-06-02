interface User {
  id: number
  username: string
  email: string
}

export const useAuth = () => {
  const user = useState<User | null>('auth-user', () => null)
  const loading = useState('auth-loading', () => true)

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
