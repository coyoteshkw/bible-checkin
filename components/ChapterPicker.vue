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
}>()

const start = defineModel<number | undefined>('chapterStart')
const end = defineModel<number | undefined>('chapterEnd')

function toggleChapter(ch: number) {
  if (start.value === undefined) {
    // 第一次点击：选中该章
    start.value = ch
    end.value = undefined
  } else if (end.value !== undefined) {
    // 已有范围：重置为该章
    start.value = ch
    end.value = undefined
  } else if (ch === start.value) {
    // 点击同一个：取消选中
    start.value = undefined
    end.value = undefined
  } else {
    // 第二次点击不同章：确定范围
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
    'bg-emerald-100 text-emerald-700': isInRange,
    'bg-gray-50 text-gray-600 hover:bg-gray-100': !isInRange
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
