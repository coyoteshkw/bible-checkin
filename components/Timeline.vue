<template>
  <div class="space-y-4">
    <div v-for="group in grouped" :key="group.date" class="space-y-2">
      <div class="flex items-baseline gap-2">
        <h3 class="text-sm font-bold" :class="group.isToday ? 'text-emerald-600' : 'text-gray-500'">
          {{ formatDateLabel(group.date) }}
        </h3>
        <span class="text-xs text-gray-300">{{ group.items.length }} 条</span>
      </div>
      <div class="border-l-2 pl-3 space-y-2"
        :class="group.isToday ? 'border-emerald-200' : 'border-gray-200'">
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

    <p v-if="!grouped.length" class="text-center text-gray-300 py-8 text-sm">
      还没有打卡记录 <FileText class="w-4 h-4 inline-block" /> 开始你的第一天吧！
    </p>
  </div>
</template>

<script setup lang="ts">
import { FileText } from 'lucide-vue-next'
const props = defineProps<{
  checkIns: any[]
}>()

defineEmits<{
  deleteRequest: [item: any]
  edit: [item: any]
  share: [item: any]
}>()

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const today = new Date()
  const isToday = dateStr === today.toISOString().split('T')[0]
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = dateStr === yesterday.toISOString().split('T')[0]

  const label = `${d.getMonth() + 1}月${d.getDate()}日`
  const weekday = weekdays[d.getDay()]

  if (isToday) return `今天 · ${label} · ${weekday}`
  if (isYesterday) return `昨天 · ${label} · ${weekday}`
  return `${label} · ${weekday}`
}

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