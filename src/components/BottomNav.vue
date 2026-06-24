<script setup lang="ts">
import { Home, Plus, User, MessageSquare } from 'lucide-vue-next'
import type { Tab } from '@/types'

defineProps<{
  activeTab: Tab
}>()

const emit = defineEmits<{
  'tab-change': [tab: Tab]
}>()

const tabs: { id: Tab; label: string | null; isMain?: boolean }[] = [
  { id: 'home', label: 'Главная' },
  { id: 'create', label: null, isMain: true },
  { id: 'chat', label: 'Чаты' },
  { id: 'profile', label: 'Профиль' },
]
</script>

<template>
  <div
    class="absolute bottom-0 left-0 right-0 bg-white border-t border-orange-50 pb-6 pt-2 flex items-center justify-around"
    style="box-shadow: 0 -4px 20px rgba(249,115,22,0.08)"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="flex flex-col items-center gap-0.5 relative"
      @click="emit('tab-change', tab.id)"
    >
      <template v-if="tab.isMain">
        <div
          class="w-14 h-14 -mt-7 rounded-[1.1rem] bg-orange-500 flex items-center justify-center"
          style="box-shadow: 0 8px 24px rgba(249,115,22,0.5)"
        >
          <Plus :size="24" class="text-white" />
        </div>
      </template>
      <template v-else>
        <div :class="activeTab === tab.id ? 'text-orange-500' : 'text-gray-400'">
          <Home v-if="tab.id === 'home'" :size="20" />
          <MessageSquare v-else-if="tab.id === 'chat'" :size="20" />
          <User v-else :size="20" />
        </div>
        <span
          class="text-[10px] font-bold transition-colors"
          :class="activeTab === tab.id ? 'text-orange-500' : 'text-gray-400'"
        >
          {{ tab.label }}
        </span>
        <div
          v-if="activeTab === tab.id"
          class="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"
        />
      </template>
    </button>
  </div>
</template>
