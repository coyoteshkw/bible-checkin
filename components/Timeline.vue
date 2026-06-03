<template>
  <div class="space-y-0">
    <!-- 骨架屏 -->
    <template v-if="skeleton">
      <div v-for="i in 3" :key="i" class="flex gap-3">
        <div class="flex flex-col items-center w-6 flex-shrink-0 pt-[4px]">
          <div class="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div v-if="i < 3" class="w-0.5 flex-1 mt-1 bg-gray-100 dark:bg-gray-800"></div>
        </div>
        <div class="flex-1 pb-6 min-w-0">
          <div class="flex items-baseline gap-2 mb-2">
            <div class="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div class="h-3 w-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div class="space-y-2">
            <div v-for="j in [1,2]" :key="j" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-3.5">
              <div class="flex gap-2">
                <div class="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div class="flex-1">
                  <div class="h-4 w-3/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1.5"></div>
                  <div class="h-3 w-2/5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-for="(group, gi) in grouped" :key="group.date" v-if="!skeleton">
      <!-- 日期组 -->
      <div class="flex gap-3">
        <!-- 左侧：圆点 + 连线 -->
        <div class="flex flex-col items-center w-6 flex-shrink-0 pt-[4px]">
          <div
            class="rounded-full ring-2 z-10"
            :class="group.isToday
              ? 'w-3 h-3 bg-emerald-500 ring-emerald-100'
              : 'w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 ring-gray-50 dark:ring-gray-950'"
          ></div>
          <div
            v-if="gi < grouped.length - 1 || hasMore"
            class="w-0.5 flex-1 mt-1"
            :class="group.isToday ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-gray-200 dark:bg-gray-700'"
          ></div>
        </div>

        <!-- 右侧：标题 + 卡片 -->
        <div class="flex-1 pb-6 min-w-0">
          <div class="flex items-baseline gap-2 mb-2">
            <h3 :id="'timeline-date-' + group.date" class="text-sm font-bold leading-5 scroll-mt-20"
              :class="group.isToday ? 'text-emerald-600' : 'text-gray-500'">
              {{ formatDateLabel(group.date) }}
            </h3>
            <span class="text-xs text-gray-300 dark:text-gray-600">{{ group.items.length }} 条</span>
          </div>
          <div class="space-y-2">
            <TimelineItem
              v-for="item in group.items"
              :key="item.id"
              :item="item"
              @delete-request="$emit('deleteRequest', $event)"
              @edit="$emit('edit', $event)"
              @share="$emit('share', $event)"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- 加载更多 -->
    <div v-if="hasMore && grouped.length > 0" class="flex gap-3">
      <div class="flex flex-col items-center w-6 flex-shrink-0">
        <div class="w-0.5 h-6 bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div class="flex-1 pb-4">
        <button
          @click="$emit('loadMore')"
          :disabled="loading"
          class="w-full py-2.5 text-sm font-medium rounded-lg transition-colors"
          :class="loading
            ? 'text-gray-300 bg-gray-50 cursor-wait'
            : 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100'"
        >
          {{ loading ? '加载中...' : '加载更多记录 ↓' }}
        </button>
      </div>
    </div>

    <!-- 已加载全部 -->
    <div v-else-if="!hasMore && grouped.length > 0" class="flex gap-3">
      <div class="flex flex-col items-center w-6 flex-shrink-0"></div>
      <div class="flex-1 pb-4">
        <p class="text-center text-xs text-gray-300 py-2">— 已加载全部记录 —</p>
      </div>
    </div>

    <!-- 空状态 -->
    <p v-if="!skeleton && !grouped.length" class="text-center text-gray-300 py-8 text-sm">
      还没有打卡记录 <FileText class="w-4 h-4 inline-block" /> 开始你的第一天吧！
    </p>
  </div>
</template>

<script setup lang="ts">
import { FileText } from 'lucide-vue-next'

const props = defineProps<{
  checkIns: any[]
  hasMore: boolean
  loading?: boolean
}>()

defineEmits<{
  deleteRequest: [item: any]
  edit: [item: any]
  share: [item: any]
  loadMore: []
}>()

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const today = new Date().toISOString().split('T')[0]
  const isToday = dateStr === today
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = dateStr === yesterday.toISOString().split('T')[0]

  const label = `${d.getMonth() + 1}月${d.getDate()}日`
  const weekday = weekdays[d.getDay()]

  if (isToday) return `今天 · ${label} · ${weekday}`
  if (isYesterday) return `昨天 · ${label} · ${weekday}`
  return `${label} · ${weekday}`
}

// 骨架屏：首次加载且无数据时显示
const skeleton = computed(() => props.loading && (!props.checkIns || props.checkIns.length === 0))

const grouped = computed(() => {
  const items = props.checkIns || []
  const groups: { date: string; isToday: boolean; items: any[] }[] = []
  const today = new Date().toISOString().split('T')[0]

  const map = new Map<string, any[]>()
  for (const item of items) {
    if (!map.has(item.date)) map.set(item.date, [])
    map.get(item.date)!.push(item)
  }

  const sorted = [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  for (const [date, items] of sorted) {
    groups.push({ date, isToday: date === today, items })
  }

  return groups
})
</script>
