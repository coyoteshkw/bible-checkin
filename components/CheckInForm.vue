<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm">
    <button
      @click="toggleExpand"
      class="w-full px-4 py-3 flex items-center justify-between text-sm font-medium transition-colors"
      :class="isEditing ? 'text-blue-600' : 'text-gray-600 hover:text-emerald-600'"
    >
      <span class="flex items-center gap-2">
        <Pencil v-if="isEditing" class="w-5 h-5" />
        <Plus v-else class="w-5 h-5 text-emerald-500" />
        {{ isEditing ? '编辑打卡记录' : '添加打卡记录' }}
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

        <div v-if="isSingleChapter" class="flex items-center gap-2">
          <span class="text-sm text-gray-400">从第</span>
          <input v-model.number="form.verse_start" type="number" min="1" max="176" placeholder="节"
            class="w-20 px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          <span class="text-sm text-gray-400">到第</span>
          <input v-model.number="form.verse_end" type="number" min="1" max="176" placeholder="节"
            class="w-20 px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          <span class="text-xs text-gray-300">（不填=整章）</span>
        </div>

        <div v-else-if="isMultiChapter" class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">第{{ form.chapter_start }}章</span>
            <span class="text-sm text-gray-400">从第</span>
            <input v-model.number="form.verse_start" type="number" min="1" max="176" placeholder="节"
              class="w-20 px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">第{{ form.chapter_end }}章</span>
            <span class="text-sm text-gray-400">到第</span>
            <input v-model.number="form.verse_end" type="number" min="1" max="176" placeholder="节"
              class="w-20 px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <p class="text-xs text-gray-400">留空=该章整章</p>
        </div>

        <p v-else class="text-xs text-gray-300">请先选择章节</p>
      </div>

      <!-- 第四步：笔记 -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1.5">④ 默想笔记（可选）</label>
        <textarea v-model="form.note" rows="2" placeholder="今天的感动和思考..."
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"></textarea>
      </div>

      <!-- 预览 -->
      <div v-if="form.book && form.chapter_start" class="bg-emerald-50 rounded-lg p-3 text-sm text-emerald-800">
        <BookOpen class="w-4 h-4 inline-block" /> <strong>{{ previewText }}</strong>
      </div>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

      <div class="flex justify-end gap-2">
        <button @click="reset" type="button" class="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          {{ isEditing ? '取消编辑' : '取消' }}
        </button>
        <button @click="submit" :disabled="submitting"
          class="px-5 py-2 text-white text-sm font-medium rounded-lg transition-colors"
          :class="isEditing ? 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300' : 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300'"
        >
          {{ submitting ? '保存中...' : isEditing ? '保存修改' : '保存打卡' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, Pencil, Plus } from 'lucide-vue-next'
const props = defineProps<{
  date?: string
  editItem?: any | null
}>()

const emit = defineEmits<{
  saved: []
  cancelEdit: []
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

const BOOK_CHAPTERS: Record<string, number> = {
  '创世记':50,'出埃及记':40,'利未记':27,'民数记':36,'申命记':34,'约书亚记':24,'士师记':21,'路得记':4,
  '撒母耳记上':31,'撒母耳记下':24,'列王纪上':22,'列王纪下':25,'历代志上':29,'历代志下':36,'以斯拉记':10,
  '尼希米记':13,'以斯帖记':10,'约伯记':42,'诗篇':150,'箴言':31,'传道书':12,'雅歌':8,
  '以赛亚书':66,'耶利米书':52,'耶利米哀歌':5,'以西结书':48,'但以理书':12,'何西阿书':14,'约珥书':3,
  '阿摩司书':9,'俄巴底亚书':1,'约拿书':4,'弥迦书':7,'那鸿书':3,'哈巴谷书':3,'西番雅书':3,
  '哈该书':2,'撒迦利亚书':14,'玛拉基书':4,
  '马太福音':28,'马可福音':16,'路加福音':24,'约翰福音':21,'使徒行传':28,'罗马书':16,
  '哥林多前书':16,'哥林多后书':13,'加拉太书':6,'以弗所书':6,'腓立比书':4,'歌罗西书':4,
  '帖撒罗尼迦前书':5,'帖撒罗尼迦后书':3,'提摩太前书':6,'提摩太后书':4,'提多书':3,'腓利门书':1,
  '希伯来书':13,'雅各书':5,'彼得前书':5,'彼得后书':3,'约翰一书':5,'约翰二书':1,'约翰三书':1,
  '犹大书':1,'启示录':22
}

const isEditing = computed(() => !!props.editItem)

// 监听 editItem 变化，预填表单
watch(() => props.editItem, (item) => {
  if (item) {
    expanded.value = true
    form.book = item.book || ''
    form.chapter_start = item.chapter_start || undefined
    form.chapter_end = item.chapter_end || undefined
    form.verse_start = item.verse_start || undefined
    form.verse_end = item.verse_end || undefined
    form.note = item.note || ''
    error.value = ''
  }
}, { immediate: true })

const maxChapters = computed(() => {
  if (!form.book) return 0
  return BOOK_CHAPTERS[form.book] || 0
})

const isSingleChapter = computed(() => {
  return form.chapter_start && (!form.chapter_end || form.chapter_end === form.chapter_start)
})

const isMultiChapter = computed(() => {
  return form.chapter_start && form.chapter_end && form.chapter_end > form.chapter_start
})

const previewText = computed(() => {
  let text = form.book
  if (form.chapter_start) {
    text += ' 第' + form.chapter_start + '章'
    if (isMultiChapter.value) {
      text += '至' + form.chapter_end + '章'
      if (form.verse_start) text += ' ' + form.chapter_start + '章' + form.verse_start + '节'
      if (form.verse_end) text += '至' + form.chapter_end + '章' + form.verse_end + '节'
    } else {
      if (form.verse_start) {
        text += ' ' + form.verse_start + '节'
        if (form.verse_end && form.verse_end !== form.verse_start) {
          text += '至' + form.verse_end + '节'
        }
      }
    }
  }
  return text
})

function toggleExpand() {
  if (isEditing.value) return // 编辑模式不能手动折叠
  expanded.value = !expanded.value
}

function reset() {
  form.book = ''
  form.chapter_start = undefined
  form.chapter_end = undefined
  form.verse_start = undefined
  form.verse_end = undefined
  form.note = ''
  expanded.value = false
  error.value = ''

  if (isEditing.value) {
    emit('cancelEdit')
  }
}

async function submit() {
  if (!form.book) { error.value = '请选择书卷'; return }
  if (!form.chapter_start) { error.value = '请点击选择章节'; return }

  submitting.value = true
  error.value = ''

  const body = {
    date: props.date || new Date().toISOString().split('T')[0],
    book: form.book,
    chapter_start: form.chapter_start,
    chapter_end: form.chapter_end === form.chapter_start ? null : (form.chapter_end || null),
    verse_start: form.verse_start || null,
    verse_end: form.verse_end || null,
    note: form.note
  }

  try {
    if (isEditing.value) {
      await $fetch(`/api/checkins/${props.editItem.id}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/checkins', { method: 'POST', body })
    }
    reset()
    emit('saved')
  } catch (e: any) {
    error.value = e.data?.statusMessage || '保存失败'
  } finally {
    submitting.value = false
  }
}
</script>
