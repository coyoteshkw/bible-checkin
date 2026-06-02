<template>
  <div class="bg-white rounded-lg border border-gray-100 p-3.5 hover:border-emerald-100 transition-colors">
    <div class="flex justify-between items-start gap-2">
      <div class="flex-1 min-w-0">
        <div class="font-medium text-gray-800 text-sm">
          {{ formatRef(item) }}
        </div>
        <p v-if="item.note" class="text-xs text-gray-400 mt-1 line-clamp-2">{{ item.note }}</p>
      </div>
      <div class="flex gap-1.5 flex-shrink-0">
        <button @click="$emit('edit', item)" title="编辑" class="p-1.5 text-gray-300 hover:text-blue-500 transition-colors text-sm">
          ✏️
        </button>
        <button @click="$emit('share', item)" title="生成卡片" class="p-1.5 text-gray-300 hover:text-emerald-500 transition-colors text-sm">
          ✂️
        </button>
        <button @click="handleDelete" title="删除" class="p-1.5 text-gray-300 hover:text-red-500 transition-colors text-sm">
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  item: any
}>()

const emit = defineEmits<{
  delete: [id: number]
  edit: [item: any]
  share: [item: any]
}>()

function formatRef(item: any): string {
  const hasChapterRange = item.chapter_end && item.chapter_end !== item.chapter_start
  const hasVerseStart = item.verse_start != null
  const hasVerseEnd = item.verse_end != null
  const hasVerseRange = hasVerseStart && hasVerseEnd && item.verse_end !== item.verse_start

  let ref = item.book + ' '

  if (hasChapterRange && hasVerseStart) {
    // 多章 + 有节 → 出埃及记 7:5-8:25
    ref += item.chapter_start + ':' + item.verse_start
    ref += '-' + item.chapter_end + ':' + (hasVerseEnd ? item.verse_end : '')
  } else if (hasChapterRange) {
    // 多章 + 无节 → 出埃及记 7-8
    ref += item.chapter_start + '-' + item.chapter_end
  } else if (hasVerseRange) {
    // 单章 + 节范围 → 出埃及记 7:5-25
    ref += item.chapter_start + ':' + item.verse_start + '-' + item.verse_end
  } else if (hasVerseStart) {
    // 单章 + 单节 → 出埃及记 7:5
    ref += item.chapter_start + ':' + item.verse_start
  } else {
    // 单章 + 无节 → 出埃及记 7
    ref += item.chapter_start
  }

  return ref
}

async function handleDelete() {
  if (!confirm('确定删除这条打卡记录？')) return
  emit('delete', props.item.id)
}
</script>
