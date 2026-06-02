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
  share: [item: any]
}>()

function formatRef(item: any): string {
  let ref = item.book + ' ' + item.chapter_start
  if (item.chapter_end) {
    ref += '-' + item.chapter_end
  }
  if (item.verse_start) {
    ref += ':' + item.verse_start
    if (item.verse_end) {
      ref += '-' + item.verse_end
    }
  }
  return ref
}

async function handleDelete() {
  if (!confirm('确定删除这条打卡记录？')) return
  emit('delete', props.item.id)
}
</script>
