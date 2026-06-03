<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <div class="md:grid md:grid-cols-12 md:gap-6">
      <!-- 左侧面板 -->
      <div class="md:col-span-4 space-y-5">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 transition-colors">
          <Calendar
            :refresh-key="calendarKey"
            :selected-date="currentDate"
            :always-open="isDesktop"
            @select-date="onSelectDate"
          />
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 space-y-3 transition-colors">
          <h3 class="text-xs font-medium text-gray-400 uppercase tracking-wider">统计</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-3 text-center">
              <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ stats.streak || 0 }}</div>
              <div class="text-xs text-gray-400 dark:text-gray-500">连续打卡</div>
            </div>
            <div class="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3 text-center">
              <div class="text-lg font-bold text-amber-600 dark:text-amber-400">{{ stats.thisMonth || 0 }}</div>
              <div class="text-xs text-gray-400 dark:text-gray-500">本月打卡</div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1">
              <span>阅读进度</span>
              <span>{{ progressPercent }}%</span>
            </div>
            <ProgressBar :percentage="progressPercent" :show-label="false" />
          </div>
          <NuxtLink to="/progress" class="block text-xs text-emerald-500 hover:text-emerald-600 font-medium text-center pt-1">查看完整进度 →</NuxtLink>
        </div>
      </div>

      <!-- 右侧主内容 -->
      <div class="md:col-span-8 space-y-4 mt-5 md:mt-0">
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-1.5">
            <CalendarIcon class="w-5 h-5 text-emerald-500" />
            {{ formatTitleDate }}
          </h2>
          <span class="text-xs text-gray-400 leading-relaxed">{{ checkIns.length }} 条记录</span>
        </div>

        <CheckInForm :date="currentDate" :edit-item="editingItem" @saved="onCheckInSaved" @cancel-edit="editingItem = null" />

        <Timeline
          :check-ins="timelineCheckIns" :has-more="hasMore" :loading="loadingMore"
          @delete-request="handleDeleteRequest" @edit="handleEdit" @share="handleShare" @load-more="loadMore"
        />
      </div>
    </div>

    <Teleport to="body">
      <button v-if="showBackToTop" @click="scrollToTop"
        class="fixed bottom-6 right-6 z-40 w-10 h-10 bg-white border border-gray-200 shadow-lg rounded-full flex items-center justify-center hover:shadow-xl hover:border-emerald-300 transition-all duration-200" title="返回顶部">
        <ArrowUp class="w-5 h-5 text-emerald-500" />
      </button>
    </Teleport>

    <ConfirmDialog :show="!!deleteTarget" title="删除打卡记录" message="确定要删除这条打卡记录吗？删除后无法恢复。" confirm-text="确认删除"
      @confirm="confirmDelete" @cancel="deleteTarget = null" />

    <Teleport to="body">
      <div v-if="shareItem" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="shareItem = null">
        <ShareCard :item="shareItem" :username="user?.username || ''" @close="shareItem = null" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '圣经打卡 - 首页' })

definePageMeta({ middleware: 'auth' })

import { CalendarIcon, ArrowUp } from 'lucide-vue-next'
const { user } = useAuth()

const isDesktop = ref(false)
onMounted(() => {
  isDesktop.value = window.innerWidth >= 768
  window.addEventListener('resize', () => { isDesktop.value = window.innerWidth >= 768 })
})

const currentDate = ref(new Date().toISOString().split('T')[0])
const checkIns = ref<any[]>([])
const calendarKey = ref(0)
const stats = ref<any>({ streak: 0, thisMonth: 0 })
const progressPercent = ref(0)
const shareItem = ref<any>(null)
const editingItem = ref<any>(null)
const deleteTarget = ref<any>(null)
const showBackToTop = ref(false)
const timelineCheckIns = ref<any[]>([])
const hasMore = ref(true)
const loadingMore = ref(false)

const formatTitleDate = computed(() => {
  const d = new Date(currentDate.value + 'T00:00:00')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const today = new Date().toISOString().split('T')[0]
  if (currentDate.value === today) return '今天'
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  if (currentDate.value === yesterday.toISOString().split('T')[0]) return '昨天'
  return `${d.getMonth() + 1}月${d.getDate()}日 · ${weekdays[d.getDay()]}`
})

function onCheckInSaved() { fetchRecentTimeline(); fetchDateCheckIns(); calendarKey.value++; fetchStats(); fetchProgress() }

async function onSelectDate(date: string) { currentDate.value = date; fetchDateCheckIns(); await scrollToTimelineDate(date) }

async function scrollToTimelineDate(date: string) {
  await nextTick()
  const el = document.getElementById('timeline-date-' + date)
  if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
  while (hasMore.value) { await loadMoreBatch(); await nextTick(); const found = document.getElementById('timeline-date-' + date); if (found) { found.scrollIntoView({ behavior: 'smooth', block: 'start' }); return } }
}

async function loadMoreBatch() {
  if (loadingMore.value || !timelineCheckIns.value.length) return
  loadingMore.value = true
  try {
    const oldest = [...timelineCheckIns.value].sort((a, b) => a.date.localeCompare(b.date))[0]
    const data = await $fetch(`/api/checkins?before=${oldest.date}`)
    const newItems = data.checkIns || []
    if (newItems.length === 0) hasMore.value = false
    else timelineCheckIns.value = [...timelineCheckIns.value, ...newItems]
  } catch {} finally { loadingMore.value = false }
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
function onScroll() { showBackToTop.value = window.scrollY > 400 }
onMounted(() => { window.addEventListener('scroll', onScroll) })
onUnmounted(() => { window.removeEventListener('scroll', onScroll) })

async function fetchDateCheckIns() { try { const data = await $fetch(`/api/checkins?date=${currentDate.value}`); checkIns.value = data.checkIns || [] } catch {} }
async function fetchRecentTimeline() { try { const data = await $fetch('/api/checkins'); timelineCheckIns.value = data.checkIns || []; hasMore.value = (data.checkIns || []).length > 0 } catch {} }
async function loadMore() { await loadMoreBatch() }
async function fetchStats() { try { const data = await $fetch('/api/checkins/stats'); stats.value = data } catch {} }
async function fetchProgress() { try { const data = await $fetch('/api/progress'); progressPercent.value = data.total?.percentage || 0 } catch {} }

function handleDeleteRequest(item: any) { deleteTarget.value = item }
async function confirmDelete() { if (!deleteTarget.value) return; const id = deleteTarget.value.id; deleteTarget.value = null; try { await $fetch(`/api/checkins/${id}`, { method: 'DELETE' }); fetchRecentTimeline(); calendarKey.value++; fetchStats(); fetchProgress() } catch {} }
function handleEdit(item: any) { editingItem.value = item }
function handleShare(item: any) { shareItem.value = item }

onMounted(() => { fetchRecentTimeline(); fetchDateCheckIns(); fetchStats(); fetchProgress() })
</script>
