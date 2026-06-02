<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm">
    <button
      @click="expanded = !expanded"
      class="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
    >
      <span class="flex items-center gap-2">
        <span class="text-emerald-500 text-lg">+</span>
        添加打卡记录
      </span>
      <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': expanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="expanded" class="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
      <BibleBookPicker v-model:book="form.book" />

      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="block text-xs text-gray-500 mb-1">起始章 *</label>
          <input v-model.number="form.chapter_start" type="number" min="1" max="150" required
            class="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">结束章</label>
          <input v-model.number="form.chapter_end" type="number" min="1" max="150" placeholder="同章"
            class="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div class="text-xs text-gray-400 self-end pb-2 pl-1">
          留空=同章
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-xs text-gray-500 mb-1">起始节</label>
          <input v-model.number="form.verse_start" type="number" min="1" max="176" placeholder="整章"
            class="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">结束节</label>
          <input v-model.number="form.verse_end" type="number" min="1" max="176" placeholder="单节"
            class="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
      </div>

      <div>
        <label class="block text-xs text-gray-500 mb-1">默想笔记</label>
        <textarea v-model="form.note" rows="2" placeholder="今天的感动和思考..."
          class="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"></textarea>
      </div>

      <div class="flex justify-end gap-2 pt-1">
        <button @click="reset" type="button" class="px-4 py-2 text-sm text-gray-400 hover:text-gray-600">取消</button>
        <button @click="submit" :disabled="submitting"
          class="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ submitting ? '保存中...' : '保存' }}
        </button>
      </div>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  date?: string
}>()

const emit = defineEmits<{
  saved: []
}>()

const expanded = ref(false)
const submitting = ref(false)
const error = ref('')

const form = reactive({
  book: '',
  chapter_start: undefined as number | undefined,
  chapter_end: undefined as number | undefined,
  verse_start: undefined as number | undefined,
  verse_end: undefined as number | undefined,
  note: ''
})

function reset() {
  form.book = ''
  form.chapter_start = undefined
  form.chapter_end = undefined
  form.verse_start = undefined
  form.verse_end = undefined
  form.note = ''
  expanded.value = false
  error.value = ''
}

async function submit() {
  if (!form.book || !form.chapter_start) {
    error.value = '请填写书卷和起始章'
    return
  }
  submitting.value = true
  error.value = ''

  try {
    await $fetch('/api/checkins', {
      method: 'POST',
      body: {
        date: props.date || new Date().toISOString().split('T')[0],
        book: form.book,
        chapter_start: form.chapter_start,
        chapter_end: form.chapter_end || null,
        verse_start: form.verse_start || null,
        verse_end: form.verse_end || null,
        note: form.note
      }
    })
    reset()
    emit('saved')
  } catch (e: any) {
    error.value = e.data?.statusMessage || '保存失败'
  } finally {
    submitting.value = false
  }
}
</script>
