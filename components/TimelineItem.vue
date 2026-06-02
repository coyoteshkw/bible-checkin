<template>
  <div class="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
    <div class="px-3 py-3.5">
      <div class="flex justify-between items-start gap-2">
        <div class="flex-1 min-w-0 space-y-1.5">
          <!-- 书卷名徽章 + 时间 -->
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
              <BookOpen class="w-3 h-3" />
              {{ item.book }}
            </span>
          </div>

          <!-- 章节引用（大字） -->
          <div class="text-base font-bold text-gray-800 leading-tight">
            {{ formatRef(item) }}
          </div>

          <!-- 笔记（引用风格） -->
          <p v-if="item.note" class="text-sm text-gray-500">
            {{ item.note }}
          </p>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-1">
          <button @click="$emit('edit', item)" title="编辑"
            class="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
            <Pencil class="w-3.5 h-3.5" />
          </button>
          <button @click="$emit('share', item)" title="生成卡片"
            class="p-1.5 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all">
            <Image class="w-3.5 h-3.5" />
          </button>
          <button @click="$emit('deleteRequest', item)" title="删除"
            class="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, Pencil, Image, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  item: any
}>()

defineEmits<{
  deleteRequest: [item: any]
  edit: [item: any]
  share: [item: any]
}>()



function formatRef(item: any): string {
  const hasChapterRange = item.chapter_end && item.chapter_end !== item.chapter_start
  const hasVerseStart = item.verse_start != null
  const hasVerseEnd = item.verse_end != null
  const hasVerseRange = hasVerseStart && hasVerseEnd && item.verse_end !== item.verse_start

  let ref = ''

  if (hasChapterRange && hasVerseStart) {
    ref += item.chapter_start + ':' + item.verse_start
    ref += ' — ' + item.chapter_end + ':' + (hasVerseEnd ? item.verse_end : '')
  } else if (hasChapterRange) {
    ref += item.chapter_start + ' — ' + item.chapter_end
  } else if (hasVerseRange) {
    ref += item.chapter_start + ':' + item.verse_start + ' — ' + item.verse_end
  } else if (hasVerseStart) {
    ref += item.chapter_start + ':' + item.verse_start
  } else {
    ref += '' + item.chapter_start
  }

  return ref
}
</script>
