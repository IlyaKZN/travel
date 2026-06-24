<script setup lang="ts">
import { Navigation, Home, MessageSquare, User, Plus, Bell } from 'lucide-vue-next'
import type { Screen } from '@/types'

defineProps<{
  activeScreen: Screen
}>()

const emit = defineEmits<{
  navigate: [screen: Screen]
  'create-click': []
}>()

const navItems: { label: string; screen: Screen }[] = [
  { label: 'Главная', screen: 'home' },
  { label: 'Чаты', screen: 'chat' },
  { label: 'Профиль', screen: 'profile' },
]
</script>

<template>
  <header class="desktop-navbar">
    <div class="desktop-navbar__logo">
      <div class="desktop-navbar__logo-icon">
        <Navigation :size="17" class="icon--white" />
      </div>
      <span class="desktop-navbar__logo-text">waymate</span>
    </div>

    <nav class="desktop-navbar__nav">
      <button
        v-for="item in navItems"
        :key="item.screen"
        class="desktop-navbar__nav-item"
        :class="{ 'desktop-navbar__nav-item--active': activeScreen === item.screen }"
        @click="emit('navigate', item.screen)"
      >
        <Home v-if="item.screen === 'home'" :size="16" />
        <MessageSquare v-else-if="item.screen === 'chat'" :size="16" />
        <User v-else :size="16" />
        {{ item.label }}
      </button>
    </nav>

    <div class="desktop-navbar__actions">
      <button class="desktop-navbar__create" @click="emit('create-click')">
        <Plus :size="16" />Спланировать поездку
      </button>
      <button class="btn btn--icon desktop-navbar__bell">
        <Bell :size="17" class="icon--gray-dark" />
        <div class="desktop-navbar__bell-dot" />
      </button>
      <button
        class="desktop-navbar__profile"
        :class="{ 'desktop-navbar__profile--active': activeScreen === 'profile' }"
        @click="emit('navigate', 'profile')"
      >
        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" alt="Алексей" class="desktop-navbar__profile-avatar">
        <span class="desktop-navbar__profile-name">Алексей Ч.</span>
      </button>
    </div>
  </header>
</template>
