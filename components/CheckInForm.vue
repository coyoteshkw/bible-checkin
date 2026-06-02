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

    <div v-if="expanded" class="px-4 pb-5 space-y-5 border-t border-gray-50 pt-4">
      <!-- 第一步：选书卷 -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1.5">① 选择书卷</label>
        <BibleBookPicker v-model:book="form.book" />
      </div>

      <!-- 第二步：选章节（网格点选） -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1.5">② 选择章节</label>
        <div class="bg-gray-50 rounded-lg p-3">
          <ChapterPicker
            :book="form.book"
            :total-chapters="maxChapters"
            v-model:chapter-start="form.chapter_start"
            v-model:chapter-end="form.chapter_end"
          />
        </div>
      </div>

      <!-- 第三步：选节（可选） -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1.5">③ 节范围（可选）</label>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-400">从第</span>
          <input
            v-model.number="form.verse_start"
            type="number"
            min="1"
            max="176"
            placeholder="节"
            class="w-20 px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <span class="text-sm text-gray-400">到第</span>
          <input
            v-model.number="form.verse_end"
            type="number"
            min="1"
            max="176"
            placeholder="节"
            class="w-20 px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <span class="text-xs text-gray-300">（不填则选整章）</span>
        </div>
      </div>

      <!-- 第四步：笔记 -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1.5">④ 默想笔记（可选）</label>
        <textarea
          v-model="form.note"
          rows="2"
          placeholder="今天的感动和思考..."
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
        ></textarea>
      </div>

      <!-- 预览 -->
      <div v-if="form.book && form.chapter_start" class="bg-emerald-50 rounded-lg p-3 text-sm text-emerald-800">
        📖 <strong>{{ previewRef }}</strong>
      </div>

      <!-- 错误与操作 -->
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

      <div class="flex justify-end gap-2">
        <button @click="reset" type="button" class="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">取消</button>
        <button
          @click="submit"
          :disabled="submitting"
          class="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {{ submitting ? '保存中...' : '✅ 保存打卡' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAllBooks } from '~/utils/bible-data'

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

// 根据选中的书卷计算最大章数
const maxChapters = computed(() => {
  if (!form.book) return 0
  const book = getAllBooks().find(b => b.name === form.book)
  return book?.chapters || 0
})

// 预览文本
const previewRef = computed(() => {
  let ref = form.book
  if (form.chapter_start) {
    ref += ' 第' + form.chapter_start + '章'
    if (form.chapter_end && form.chapter_end !== form.chapter_start) {
      ref += '至' + form.chapter_end + '章'
    }
    if (form.verse_start) {
      ref += ' ' + form.verse_start + '节'
      if (form.verse_end && form.verse_end !== form.verse_start) {
        ref += '至' + form.verse_end + '节'
      }
    }
  }
  return ref
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
  if (!form.book) {
    error.value = '请选择书卷'
    return
  }
  if (!form.chapter_start) {
    error.value = '请点击选择章节'
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
        chapter_end: form.chapter_end === form.chapter_start ? null : (form.chapter_end || null),
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
