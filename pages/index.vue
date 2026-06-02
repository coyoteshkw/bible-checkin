<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <!-- 移动端：上下结构 / 桌面端：左右分栏 -->
    <div class="md:grid md:grid-cols-12 md:gap-6">

      <!-- ====== 左侧面板（桌面端显示） ====== -->
      <div class="md:col-span-4 space-y-5">
        <!-- 日历（移动端可折叠，桌面端常开） -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <Calendar
            :refresh-key="calendarKey"
            :selected-date="currentDate"
            :always-open="isDesktop"
            @select-date="onSelectDate"
          />
        </div>

        <!-- 今日统计 -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          <h3 class="text-xs font-medium text-gray-400 uppercase tracking-wider">统计</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-emerald-50 rounded-lg p-3 text-center">
              <div class="text-lg font-bold text-emerald-600">{{ stats.streak || 0 }}</div>
              <div class="text-xs text-gray-400">连续打卡</div>
            </div>
            <div class="bg-amber-50 rounded-lg p-3 text-center">
              <div class="text-lg font-bold text-amber-600">{{ stats.thisMonth || 0 }}</div>
              <div class="text-xs text-gray-400">本月打卡</div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs text-gray-400 mb-1">
              <span>阅读进度</span>
              <span>{{ progressPercent }}%</span>
            </div>
            <ProgressBar :percentage="progressPercent" :show-label="false" />
          </div>
          <NuxtLink to="/progress" class="block text-xs text-emerald-500 hover:text-emerald-600 font-medium text-center pt-1">
            查看完整进度 →
          </NuxtLink>
        </div>
      </div>

      <!-- ====== 右侧主内容 ====== -->
      <div class="md:col-span-8 space-y-4 mt-5 md:mt-0">
        <!-- 日期标题 -->
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-1.5">
            <CalendarIcon class="w-5 h-5 text-emerald-500" />
            {{ formatTitleDate }}
          </h2>
          <span class="text-xs text-gray-400 leading-relaxed">{{ checkIns.length }} 条记录</span>
        </div>

        <!-- 打卡表单 -->
        <CheckInForm :date="currentDate" :edit-item="editingItem" @saved="onCheckInSaved" @cancel-edit="editingItem = null" />

        <!-- 时间线 -->
        <Timeline
          :check-ins="timelineCheckIns"
          :has-more="hasMore"
          :loading="loadingMore"
          @delete-request="handleDeleteRequest"
          @edit="handleEdit"
          @share="handleShare"
          @load-more="loadMore"
        />
      </div>
    </div>

    <!-- 返回顶部按钮 -->
    <Teleport to="body">
      <button
        v-if="showBackToTop"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 z-40 w-10 h-10 bg-white border border-gray-200 shadow-lg rounded-full flex items-center justify-center hover:shadow-xl hover:border-emerald-300 transition-all duration-200"
        title="返回顶部"
      >
        <ArrowUp class="w-5 h-5 text-emerald-500" />
      </button>
    </Teleport>

    <!-- 删除确认弹窗 -->
    <ConfirmDialog
      :show="!!deleteTarget"
      title="删除打卡记录"
      message="确定要删除这条打卡记录吗？删除后无法恢复。"
      confirm-text="确认删除"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />

    <!-- 分享卡片弹窗 -->
    <Teleport to="body">
      <div v-if="shareItem" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="shareItem = null">
        <ShareCard
          :item="shareItem"
          :username="user?.username || ''"
          @close="shareItem = null"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { CalendarIcon, ArrowUp } from 'lucide-vue-next'
const { user } = useAuth()

// 响应式检测桌面端
const isDesktop = ref(false)
onMounted(() => {
  isDesktop.value = window.innerWidth >= 768
  window.addEventListener('resize', () => {
    isDesktop.value = window.innerWidth >= 768
  })
})

// 当前选中的日期
const currentDate = ref(new Date().toISOString().split('T')[0])
const checkIns = ref<any[]>([])
const calendarKey = ref(0)
const stats = ref<any>({ streak: 0, thisMonth: 0 })
const progressPercent = ref(0)
const shareItem = ref<any>(null)
const editingItem = ref<any>(null)
const deleteTarget = ref<any>(null)
const showBackToTop = ref(false)

// 时间线数据（独立于日期选择）
const timelineCheckIns = ref<any[]>([])
const hasMore = ref(true)
const loadingMore = ref(false)

// 格式化标题日期
const formatTitleDate = computed(() => {
  const d = new Date(currentDate.value + 'T00:00:00')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const today = new Date().toISOString().split('T')[0]
  if (currentDate.value === today) return '今天'
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (currentDate.value === yesterday.toISOString().split('T')[0]) return '昨天'
  return `${d.getMonth() + 1}月${d.getDate()}日 · ${weekdays[d.getDay()]}`
})

// 打卡保存后（同时刷新时间线和日历）
function onCheckInSaved() {
  fetchRecentTimeline()
  fetchDateCheckIns()
  calendarKey.value++
  fetchStats()
  fetchProgress()
}

// 切换日期 — 滚动到时间线对应位置，不在当前视图中则加载更多
async function onSelectDate(date: string) {
  currentDate.value = date
  fetchDateCheckIns()
  await scrollToTimelineDate(date)
}

async function scrollToTimelineDate(date: string) {
  await nextTick()
  const el = document.getElementById('timeline-date-' + date)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  // 不在当前加载范围内 → 逐批加载更多直到找到
  while (hasMore.value) {
    await loadMoreBatch()
    await nextTick()
    const found = document.getElementById('timeline-date-' + date)
    if (found) {
      found.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
  }
}

// 加载一批（返回 Promise 供 scrollToTimelineDate 复用）
async function loadMoreBatch(): Promise<void> {
  if (loadingMore.value || !timelineCheckIns.value.length) return
  loadingMore.value = true
  try {
    const oldest = [...timelineCheckIns.value].sort(
      (a, b) => a.date.localeCompare(b.date)
    )[0]
    const data = await $fetch(`/api/checkins?before=${oldest.date}`)
    const newItems = data.checkIns || []
    if (newItems.length === 0) {
      hasMore.value = false
    } else {
      timelineCheckIns.value = [...timelineCheckIns.value, ...newItems]
    }
  } catch {}
  finally {
    loadingMore.value = false
  }
}

// 返回顶部
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 监听滚动显示/隐藏返回顶部按钮
function onScroll() {
  showBackToTop.value = window.scrollY > 400
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

// 获取选中日期的打卡数
async function fetchDateCheckIns() {
  try {
    const data = await $fetch(`/api/checkins?date=${currentDate.value}`)
    checkIns.value = data.checkIns || []
  } catch {}
}

// 加载时间线（最近 7 天）
async function fetchRecentTimeline() {
  try {
    const data = await $fetch('/api/checkins')
    timelineCheckIns.value = data.checkIns || []
    hasMore.value = (data.checkIns || []).length > 0
  } catch {}
}

// 加载更多历史（由 Timeline 底部按钮触发）
async function loadMore() {
  await loadMoreBatch()
}

// 获取统计
async function fetchStats() {
  try {
    const data = await $fetch('/api/checkins/stats')
    stats.value = data
  } catch {}
}

// 获取总进度百分比
async function fetchProgress() {
  try {
    const data = await $fetch('/api/progress')
    progressPercent.value = data.total?.percentage || 0
  } catch {}
}

// 删除请求（弹出确认框）
function handleDeleteRequest(item: any) {
  deleteTarget.value = item
}

// 确认删除
async function confirmDelete() {
  if (!deleteTarget.value) return
  const id = deleteTarget.value.id
  deleteTarget.value = null
  try {
    await $fetch(`/api/checkins/${id}`, { method: 'DELETE' })
    fetchRecentTimeline()
    calendarKey.value++
    fetchStats()
    fetchProgress()
  } catch {}
}

// 编辑
function handleEdit(item: any) {
  editingItem.value = item
}

// 分享
function handleShare(item: any) {
  shareItem.value = item
}

// 初始化
onMounted(() => {
  fetchRecentTimeline()
  fetchStats()
  fetchProgress()
})
</script>
