<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{ postId: string }>()
const emit = defineEmits<{ edit: [id: string]; delete: [id: string] }>()

const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function toggle(e: Event) {
  e.stopPropagation()
  open.value = !open.value
}

function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="menuRef" class="relative">
    <button
      type="button"
      class="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
      @click="toggle"
    >
      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
      </svg>
    </button>
    <div
      v-if="open"
      class="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
    >
      <button
        type="button"
        class="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
        @click="emit('edit', postId); open = false"
      >
        Редактировать
      </button>
      <button
        type="button"
        class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
        @click="emit('delete', postId); open = false"
      >
        Удалить
      </button>
    </div>
  </div>
</template>
