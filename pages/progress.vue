<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <h1 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><BarChart3 class="w-6 h-6 text-emerald-500" /> 阅读进度</h1>

    <!-- 总进度 -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6 transition-colors">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-bold text-gray-700">整本圣经</span>
        <span class="text-2xl font-bold text-emerald-600">{{ progress.total?.percentage || 0 }}%</span>
      </div>
      <ProgressBar :percentage="progress.total?.percentage || 0" :show-label="false" />
      <p class="text-xs text-gray-400 mt-2">
        已读 {{ progress.total?.read || 0 }} / {{ progress.total?.total || 1189 }} 章
      </p>
    </div>

    <!-- 按卷查看 -->
    <div class="space-y-6">
      <div v-for="t in progress.testaments" :key="t.name" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 transition-colors">
        <h2 class="text-sm font-bold text-gray-600 mb-3">{{ t.name }}（{{ t.books.length }} 卷）</h2>

        <div class="space-y-2">
          <div
            v-for="book in t.books"
            :key="book.id"
            @click="toggleBook(book.id)"
            class="rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            :class="{ 'bg-emerald-50 dark:bg-emerald-900/30': book.done }"
          >
            <div class="flex items-center gap-3 px-2 py-2">
              <span class="text-xs w-20 text-gray-500 font-medium truncate">{{ book.name }}</span>
              <div class="flex-1">
                <ProgressBar :percentage="book.percentage" :show-label="false" />
              </div>
              <span class="text-xs text-gray-400 w-16 text-right">{{ book.readChapters }}/{{ book.totalChapters }}</span>
              <span v-if="book.done" class="text-emerald-500 text-xs">✓</span>
            </div>

            <!-- 展开章节详情 -->
            <div v-if="expandedBooks.has(book.id)" class="px-2 pb-2 grid grid-cols-10 gap-1">
              <div
                v-for="ch in book.totalChapters"
                :key="ch"
                class="text-center text-xs py-1 rounded"
                :class="isChapterRead(book.name, ch) ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'"
              >
                {{ ch }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 已读完的书卷 -->
    <div class="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 transition-colors">
      <h2 class="text-sm font-bold text-gray-600 mb-3">🏆 已读完的书卷</h2>
      <div v-if="finishedBooks.length" class="flex flex-wrap gap-2">
        <span v-for="b in finishedBooks" :key="b.id" class="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
          {{ b.name }}
        </span>
      </div>
      <p v-else class="text-xs text-gray-300">还没有读完的书卷，继续加油！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: '进度' })
import { BarChart3 } from 'lucide-vue-next'
const progress = ref<any>({ total: { percentage: 0, read: 0, total: 1189 }, testaments: [] })
const expandedBooks = ref(new Set<number>())
const allCheckIns = ref<any[]>([])

// 已读完的书卷
const finishedBooks = computed(() => {
  const books: any[] = []
  for (const t of progress.value.testaments || []) {
    for (const b of t.books) {
      if (b.done) books.push(b)
    }
  }
  return books
})

// 判断某章是否已读
function isChapterRead(bookName: string, chapter: number): boolean {
  return allCheckIns.value.some((ci: any) => {
    if (ci.book !== bookName) return false
    const end = ci.chapter_end ?? ci.chapter_start
    return chapter >= ci.chapter_start && chapter <= end
  })
}

function toggleBook(id: number) {
  if (expandedBooks.value.has(id)) {
    expandedBooks.value.delete(id)
  } else {
    expandedBooks.value.add(id)
  }
  // 刷新，将 Set 替换为新引用以触发响应式
  expandedBooks.value = new Set(expandedBooks.value)
}

onMounted(async () => {
  try {
    const [progressData, checkinData] = await Promise.all([
      $fetch('/api/progress'),
      $fetch('/api/checkins')
    ])
    progress.value = progressData
    allCheckIns.value = checkinData.checkIns || []
  } catch {}
})
</script>
