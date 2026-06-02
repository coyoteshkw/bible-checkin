<template>
  <div class="flex items-center gap-2">
    <div class="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="colorClass"
        :style="{ width: Math.min(percentage, 100) + '%' }"
      ></div>
    </div>
    <span v-if="showLabel" class="text-xs font-medium text-gray-500 w-10 text-right">{{ percentage }}%</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  percentage: number
  color?: string
  showLabel?: boolean
}>()

const colorClass = computed(() => {
  if (props.color) return props.color
  if (props.percentage >= 100) return 'bg-emerald-500'
  if (props.percentage >= 50) return 'bg-emerald-400'
  if (props.percentage >= 20) return 'bg-amber-400'
  return 'bg-blue-400'
})
</script>
