<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import PopupMenu from './PopupMenu.vue'
import InfoDropdown from './InfoDropdown.vue'
import ThemeToggle from './ThemeToggle.vue'
import { isTelegram, setupBackButton } from '@/composables/useTelegram'

const props = defineProps<{
  title?: string
  showAuth?: boolean
  showBack?: boolean
  infoMenu?: boolean
}>()

const router = useRouter()
let cleanupBack: (() => void) | undefined

watch(
  () => props.showBack,
  (show) => {
    cleanupBack?.()
    cleanupBack = undefined
    if (show && isTelegram.value) {
      cleanupBack = setupBackButton(() => router.back())
    }
  },
  { immediate: true },
)

onUnmounted(() => cleanupBack?.())
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-stone-200/80 bg-warm-50/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/90"
    :class="{ 'telegram-header': isTelegram }"
  >
    <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3">
        <button
          v-if="showBack && !isTelegram"
          type="button"
          class="btn-ghost !px-2"
          @click="router.back()"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <RouterLink :to="isTelegram ? '/tours' : '/'" class="flex items-center gap-2">
          <span class="logo-sunny">T</span>
          <span class="hidden font-bold text-stone-900 dark:text-stone-100 sm:inline">Travels</span>
        </RouterLink>
        <span v-if="title" class="ml-2 hidden text-sm text-stone-500 dark:text-stone-400 sm:inline">/ {{ title }}</span>
      </div>
      <div class="flex items-center gap-2">
        <ThemeToggle v-if="!isTelegram" />
        <InfoDropdown v-if="infoMenu" />
        <PopupMenu v-else :show-auth="showAuth" />
      </div>
    </div>
  </header>
</template>
