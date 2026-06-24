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
  <header
    class="bg-white border-b border-orange-50 px-6 h-16 flex items-center gap-4 flex-shrink-0 z-40"
    style="box-shadow: 0 2px 12px rgba(249,115,22,0.07)"
  >
    <div class="flex items-center gap-2.5 flex-shrink-0">
      <div class="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
        <Navigation :size="17" class="text-white" />
      </div>
      <span class="text-xl font-extrabold text-gray-900 tracking-tight">waymate</span>
    </div>

    <nav class="hidden lg:flex items-center gap-1">
      <button
        v-for="item in navItems"
        :key="item.screen"
        class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
        :class="activeScreen === item.screen ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'"
        @click="emit('navigate', item.screen)"
      >
        <Home v-if="item.screen === 'home'" :size="16" />
        <MessageSquare v-else-if="item.screen === 'chat'" :size="16" />
        <User v-else :size="16" />
        {{ item.label }}
      </button>
    </nav>

    <div class="flex items-center gap-2 ml-auto flex-shrink-0">
      <button
        class="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold flex-shrink-0"
        style="box-shadow: 0 4px 12px rgba(249,115,22,0.35)"
        @click="emit('create-click')"
      >
        <Plus :size="16" />Спланировать поездку
      </button>
      <button class="relative w-9 h-9 bg-input-background rounded-xl flex items-center justify-center border border-orange-100 flex-shrink-0">
        <Bell :size="17" class="text-gray-600" />
        <div class="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
      </button>
      <button
        class="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl transition-all flex-shrink-0"
        :class="activeScreen === 'profile' ? 'bg-orange-50 border border-orange-100' : 'hover:bg-gray-50'"
        @click="emit('navigate', 'profile')"
      >
        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" alt="Алексей" class="w-8 h-8 rounded-xl object-cover">
        <span class="text-sm font-bold text-gray-800 hidden xl:block">Алексей Ч.</span>
      </button>
    </div>
  </header>
</template>
