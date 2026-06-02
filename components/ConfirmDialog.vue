<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="$emit('cancel')">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
        <div class="p-6 text-center">
          <Trash2 class="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 class="text-lg font-bold text-gray-800 mb-2">{{ title }}</h3>
          <p class="text-sm text-gray-500">{{ message }}</p>
        </div>
        <div class="px-6 pb-5 flex gap-2">
          <button @click="$emit('cancel')"
            class="flex-1 py-2.5 text-sm text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            取消
          </button>
          <button @click="$emit('confirm')"
            class="flex-1 py-2.5 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors font-medium">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'

defineProps<{
  show: boolean
  title?: string
  message?: string
  confirmText?: string
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
