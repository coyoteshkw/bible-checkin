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
