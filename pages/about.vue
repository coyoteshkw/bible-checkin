<template>
  <div class="max-w-xl mx-auto px-4 py-12">
    <div class="text-center space-y-6">
      <!-- 头像/图标 -->
      <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
        <BookOpen class="w-8 h-8 text-emerald-500" />
      </div>

      <!-- 标题 -->
      <h1 class="text-2xl font-bold text-gray-800">关于我</h1>
      <p class="text-lg text-gray-500 font-medium">coyoteshkw</p>

      <!-- 分割线 -->
      <div class="border-t border-gray-100 pt-6">
        <p class="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
          我制作这个应用是为了方便记录每日的圣经打卡。
        </p>
        <p class="text-sm text-gray-600 leading-relaxed max-w-md mx-auto mt-3">
          我知道有很多的圣经软件都自带打卡功能，但他们只有跟随每日读经计划的打卡，没有自己选择进度的打卡，而这个时期的我比较需要这样的应用。并且我希望看到自己距离读完一整本还差多少。
        </p>
      </div>

      <!-- 反馈 -->
      <div class="border-t border-gray-100 pt-6">
        <h2 class="text-sm font-bold text-gray-600 mb-3">反馈</h2>
        <p class="text-sm text-gray-500">
          如果你有任何的意见或想法，可以发送到这个邮箱
        </p>
        <a href="mailto:coyoteshkw@proton.me"
          class="inline-block mt-2 text-emerald-500 hover:text-emerald-600 font-medium transition-colors">
          coyoteshkw@proton.me
        </a>
      </div>

      <!-- 底部 -->
      <div class="border-t border-gray-100 pt-6">
        <NuxtLink to="/" class="text-sm text-gray-400 hover:text-emerald-500 transition-colors">
          ← 返回打卡
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'
</script>
