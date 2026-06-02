<template>
  <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
    <!-- 卡片预览 -->
    <div ref="cardEl" class="p-6 bg-gradient-to-br from-emerald-50 to-white">
      <div class="text-center mb-4">
        <BookOpen class="w-10 h-10 text-emerald-500 mx-auto" />
        <h3 class="text-lg font-bold text-gray-800 mt-1">今日读经</h3>
      </div>

      <div class="space-y-3 mb-4">
        <div class="bg-white/80 rounded-lg p-3.5 border border-emerald-100">
          <div class="font-bold text-emerald-700 text-sm">{{ formatRef(record) }}</div>
          <p v-if="record.note" class="text-xs text-gray-500 mt-1">{{ record.note }}</p>
        </div>
      </div>

      <div class="text-center border-t border-emerald-100 pt-3">
        <p class="text-xs text-gray-400">—— {{ formatDate }} ——</p>
        <p class="text-sm font-medium text-gray-600 mt-0.5">{{ username }}</p>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="p-4 flex gap-2">
      <button @click="$emit('close')" class="flex-1 py-2.5 text-sm text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        关闭
      </button>
      <button @click="downloadCard" class="flex-1 py-2.5 text-sm text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors">
        保存图片
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'
import { toPng } from 'html-to-image'

const props = defineProps<{
  item: any
  username: string
}>()

defineEmits<{
  close: []
}>()

const cardEl = ref<HTMLDivElement>()

const record = computed(() => props.item)

const formatDate = computed(() => {
  if (!record.value?.date) return ''
  const d = new Date(record.value.date + 'T00:00:00')
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

function formatRef(item: any): string {
  if (!item) return ''
  const hasChapterRange = item.chapter_end && item.chapter_end !== item.chapter_start
  const hasVerseStart = item.verse_start != null
  const hasVerseEnd = item.verse_end != null
  const hasVerseRange = hasVerseStart && hasVerseEnd && item.verse_end !== item.verse_start

  let text = item.book + ' '

  if (hasChapterRange && hasVerseStart) {
    text += item.chapter_start + ':' + item.verse_start
    text += '-' + item.chapter_end + ':' + (hasVerseEnd ? item.verse_end : '')
  } else if (hasChapterRange) {
    text += item.chapter_start + '-' + item.chapter_end
  } else if (hasVerseRange) {
    text += item.chapter_start + ':' + item.verse_start + '-' + item.verse_end
  } else if (hasVerseStart) {
    text += item.chapter_start + ':' + item.verse_start
  } else {
    text += item.chapter_start
  }

  return text
}

async function downloadCard() {
  if (!cardEl.value) return
  try {
    const dataUrl = await toPng(cardEl.value, {
      backgroundColor: '#ffffff',
      pixelRatio: 2
    })
    const link = document.createElement('a')
    link.download = `bible-${record.value.date}-${record.value.id}.png`
    link.href = dataUrl
    link.click()
  } catch (e) {
    console.error('生成卡片失败', e)
  }
}
</script>
