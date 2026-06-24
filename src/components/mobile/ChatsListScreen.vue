<script setup lang="ts">
import { ref } from 'vue'
import { TRIPS, DM_CONVERSATIONS } from '@/lib/mockData'
import type { Trip, DmConversation } from '@/lib/mockData'
import type { ChatView } from '@/types'
import TripAvatar from '@/components/TripAvatar.vue'

const emit = defineEmits<{
  'trip-chat': [trip: Trip]
  'dm-chat': [dm: DmConversation]
}>()

const activeView = ref<ChatView>('trip')

const tabs: { id: ChatView; label: string }[] = [
  { id: 'trip', label: 'Поездки' },
  { id: 'personal', label: 'Личные' },
]
</script>

<template>
  <div class="flex flex-col h-full bg-background">
    <div class="px-5 pt-14 pb-4">
      <h1 class="text-xl font-extrabold text-gray-900 mb-4">Чаты</h1>
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
          :class="activeView === tab.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-100'"
          @click="activeView = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto px-5 pb-24 space-y-2" style="scrollbar-width: none">
      <template v-if="activeView === 'trip'">
        <button
          v-for="(t, i) in TRIPS"
          :key="t.id"
          class="w-full flex items-center gap-3 bg-white rounded-2xl p-3.5 border border-orange-50 text-left"
          style="box-shadow: 0 1px 8px rgba(249,115,22,0.06)"
          @click="emit('trip-chat', t)"
        >
          <TripAvatar :trip="t" class="w-12 h-12 rounded-2xl text-sm flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-gray-800 truncate">{{ t.fromShort }} → {{ t.toShort }}</p>
            <p class="text-xs text-gray-400 truncate">{{ t.date }} · групповой чат</p>
          </div>
          <div v-if="i === 0" class="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-[9px] font-extrabold text-white">2</span>
          </div>
        </button>
      </template>
      <template v-else>
        <button
          v-for="dm in DM_CONVERSATIONS"
          :key="dm.id"
          class="w-full flex items-center gap-3 bg-white rounded-2xl p-3.5 border border-orange-50 text-left"
          style="box-shadow: 0 1px 8px rgba(249,115,22,0.06)"
          @click="emit('dm-chat', dm)"
        >
          <img :src="dm.user.avatar" :alt="dm.user.name" class="w-12 h-12 rounded-2xl object-cover flex-shrink-0">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-gray-800 truncate">{{ dm.user.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ dm.lastMessage }}</p>
          </div>
          <div class="flex flex-col items-end gap-1 flex-shrink-0">
            <span class="text-[10px] text-gray-400">{{ dm.time }}</span>
            <div v-if="dm.unread" class="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
              <span class="text-[9px] font-extrabold text-white">{{ dm.unread }}</span>
            </div>
          </div>
        </button>
      </template>
    </div>
  </div>
</template>
