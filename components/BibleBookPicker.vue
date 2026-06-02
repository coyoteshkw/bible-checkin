<template>
  <div ref="pickerRef" class="relative">
    <button
      @click="open = !open"
      type="button"
      class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-left flex justify-between items-center bg-white dark:bg-gray-800 hover:border-emerald-300 transition-colors dark:text-gray-100"
    >
      <span :class="selected ? 'text-gray-800' : 'text-gray-400'">
        {{ selected || '选择书卷...' }}
      </span>
      <svg class="w-4 h-4 text-gray-400" :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="open" class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      <div v-for="t in bibleData" :key="t.name">
        <div class="px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 sticky top-0">
          {{ t.name }}
        </div>
        <button
          v-for="book in t.books"
          :key="book.id"
          @click="selectBook(book.name)"
          class="w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
          :class="{ 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium': selected === book.name }"
        >
          {{ book.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const bibleData = [
  {
    name: '旧约',
    books: [
      '创世记','出埃及记','利未记','民数记','申命记','约书亚记','士师记','路得记',
      '撒母耳记上','撒母耳记下','列王纪上','列王纪下','历代志上','历代志下','以斯拉记',
      '尼希米记','以斯帖记','约伯记','诗篇','箴言','传道书','雅歌','以赛亚书',
      '耶利米书','耶利米哀歌','以西结书','但以理书','何西阿书','约珥书','阿摩司书',
      '俄巴底亚书','约拿书','弥迦书','那鸿书','哈巴谷书','西番雅书','哈该书',
      '撒迦利亚书','玛拉基书'
    ].map((name, i) => ({ id: i + 1, name }))
  },
  {
    name: '新约',
    books: [
      '马太福音','马可福音','路加福音','约翰福音','使徒行传','罗马书','哥林多前书',
      '哥林多后书','加拉太书','以弗所书','腓立比书','歌罗西书','帖撒罗尼迦前书',
      '帖撒罗尼迦后书','提摩太前书','提摩太后书','提多书','腓利门书','希伯来书',
      '雅各书','彼得前书','彼得后书','约翰一书','约翰二书','约翰三书','犹大书','启示录'
    ].map((name, i) => ({ id: 40 + i, name }))
  }
]

const selected = defineModel<string>('book')
const open = ref(false)
const pickerRef = ref<HTMLDivElement>()

function selectBook(name: string) {
  selected.value = name
  open.value = false
}

// 点击外部关闭
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (pickerRef.value && !pickerRef.value.contains(e.target as Node)) {
      open.value = false
    }
  })
})
</script>
