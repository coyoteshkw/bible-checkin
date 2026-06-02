<template>
  <div>
    <div v-if="!totalChapters" class="text-center py-4 text-gray-300 text-sm">
      请先选择书卷
    </div>
    <div v-else>
      <!-- 选中状态显示 -->
      <div class="text-sm mb-2">
        <span v-if="!start" class="text-gray-400">点击选择章节</span>
        <span v-else class="font-medium text-emerald-700">
          已选：第 {{ start }} 章
          <template v-if="end && end !== start">— 第 {{ end }} 章</template>
        </span>
      </div>

      <!-- 章节网格 -->
      <div class="grid grid-cols-8 sm:grid-cols-10 gap-1">
        <button
          v-for="ch in totalChapters"
          :key="ch"
          @click="toggleChapter(ch)"
          class="text-center py-1.5 text-sm rounded-lg transition-all"
          :class="chapterClass(ch)"
        >
          {{ ch }}
        </button>
      </div>

      <!-- 清空按钮 -->
      <button
        v-if="start"
        @click="clear"
        class="mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        清除选择
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  book?: string
  totalChapters: number
  chapterStart?: number
  chapterEnd?: number
}>()

const emit = defineEmits<{
  'update:chapterStart': [value: number | undefined]
  'update:chapterEnd': [value: number | undefined]
}>()

// 本地状态
const start = computed({
  get: () => props.chapterStart,
  set: (val) => emit('update:chapterStart', val)
})
const end = computed({
  get: () => props.chapterEnd,
  set: (val) => emit('update:chapterEnd', val)
})

function toggleChapter(ch: number) {
  if (start.value === undefined) {
    start.value = ch
    end.value = undefined
  } else if (end.value !== undefined) {
    start.value = ch
    end.value = undefined
  } else if (ch === start.value) {
    start.value = undefined
    end.value = undefined
  } else {
    const s = start.value
    const e = ch
    start.value = Math.min(s, e)
    end.value = Math.max(s, e)
  }
}

function chapterClass(ch: number): Record<string, boolean> {
  const isInRange = start.value !== undefined && (
    (end.value === undefined && ch === start.value) ||
    (end.value !== undefined && ch >= start.value! && ch <= end.value)
  )
  return {
    'bg-emerald-500 text-white font-medium shadow-sm': isInRange,
    'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700': !isInRange
  }
}

function clear() {
  start.value = undefined
  end.value = undefined
}

// 当书卷变化时重置选择
watch(() => props.book, () => {
  start.value = undefined
  end.value = undefined
})
</script>
