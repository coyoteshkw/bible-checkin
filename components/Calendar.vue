<template>
  <details class="group" :open="alwaysOpen">
    <summary class="text-sm font-medium text-gray-500 cursor-pointer select-none list-none flex items-center gap-2 py-1">
      <span class="text-emerald-500">📅</span>
      <span>{{ expanded ? '收起日历' : '展开日历' }}</span>
      <svg class="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </summary>
    <div class="mt-3">
      <!-- 月份导航 -->
      <div class="flex items-center justify-between mb-3">
        <button @click="prevMonth" class="p-1 text-gray-400 hover:text-emerald-500 transition-colors">←</button>
        <span class="text-sm font-medium text-gray-700">{{ year }}年{{ month }}月</span>
        <button @click="nextMonth" class="p-1 text-gray-400 hover:text-emerald-500 transition-colors">→</button>
      </div>

      <!-- 星期行 -->
      <div class="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
        <span v-for="d in weekdays" :key="d">{{ d }}</span>
      </div>

      <!-- 日期网格 -->
      <div class="grid grid-cols-7 gap-1">
        <template v-for="(day, idx) in days" :key="idx">
          <div v-if="!day" class="text-center py-1"></div>
          <button
            v-else
            @click="$emit('selectDate', day.dateStr)"
            :title="day.dateStr"
            class="text-center py-1.5 text-sm rounded-lg transition-colors cursor-pointer"
            :class="{
              'bg-emerald-500 text-white font-medium hover:bg-emerald-600': day.dateStr === activeDate,
              'bg-emerald-100 text-emerald-700 hover:bg-emerald-200': day.checked && day.dateStr !== activeDate,
              'text-gray-600 hover:bg-gray-100': !day.checked && day.dateStr !== activeDate,
              'text-gray-300': day.isFuture
            }"
            :disabled="day.isFuture"
          >
            {{ day.day }}
          </button>
        </template>
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
const props = defineProps<{
  checkedDates?: string[]
  selectedDate?: string
  alwaysOpen?: boolean
}>()

const emit = defineEmits<{
  selectDate: [date: string]
}>()

const weekdays = ['一', '二', '三', '四', '五', '六', '日']

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const expanded = ref(false)

function prevMonth() {
  if (month.value === 1) {
    month.value = 12
    year.value--
  } else {
    month.value--
  }
}

function nextMonth() {
  if (month.value === 12) {
    month.value = 1
    year.value++
  } else {
    month.value++
  }
}

// 监听月份变化，获取该月已打卡日期
const checkedSet = ref(new Set<string>())
watch([year, month], async () => {
  await fetchMonthDates()
}, { immediate: true })

async function fetchMonthDates() {
  try {
    const monthStr = `${year.value}-${String(month.value).padStart(2, '0')}`
    const data = await $fetch(`/api/checkins?month=${monthStr}`)
    checkedSet.value = new Set(data.dates || [])
  } catch {
    checkedSet.value = new Set()
  }
}

// 同时监听外部 checkedDates 变化
watch(() => props.checkedDates, (dates) => {
  if (dates) checkedSet.value = new Set(dates)
}, { immediate: true })

const today = new Date()
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

const days = computed(() => {
  const firstDay = new Date(year.value, month.value - 1, 1)
  const lastDay = new Date(year.value, month.value, 0)
  const startPad = (firstDay.getDay() + 6) % 7 // 周一为一周第一天
  const totalDays = lastDay.getDate()

  const result: ({ day: number; dateStr: string; checked: boolean; isFuture: boolean } | null)[] = []

  for (let i = 0; i < startPad; i++) {
    result.push(null)
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year.value}-${String(month.value).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isFuture = dateStr > todayStr
    result.push({
      day: d,
      dateStr,
      checked: checkedSet.value.has(dateStr),
      isFuture
    })
  }

  return result
})

// 默认选中今天
const selectedDate = ref(todayStr)

// 优先使用父组件传入的 selectedDate，否则用本地值
const activeDate = computed(() => props.selectedDate || selectedDate.value)
</script>
