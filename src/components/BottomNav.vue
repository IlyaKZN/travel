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
  <div class="bottom-nav">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="bottom-nav__tab"
      @click="emit('tab-change', tab.id)"
    >
      <template v-if="tab.isMain">
        <div class="bottom-nav__fab">
          <Plus :size="24" class="icon--white" />
        </div>
      </template>
      <template v-else>
        <div :class="activeTab === tab.id ? 'bottom-nav__icon--active' : 'bottom-nav__icon'">
          <Home v-if="tab.id === 'home'" :size="20" />
          <MessageSquare v-else-if="tab.id === 'chat'" :size="20" />
          <User v-else :size="20" />
        </div>
        <span
          class="bottom-nav__label"
          :class="{ 'bottom-nav__label--active': activeTab === tab.id }"
        >
          {{ tab.label }}
        </span>
        <div v-if="activeTab === tab.id" class="bottom-nav__dot" />
      </template>
    </button>
  </div>
</template>
