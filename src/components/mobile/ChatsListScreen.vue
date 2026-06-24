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
  <div class="screen">
    <div class="chats-list__header">
      <h1 class="chats-list__title">Чаты</h1>
      <div class="chats-list__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="chip"
          :class="activeView === tab.id ? 'chip--active' : 'chip--outline'"
          @click="activeView = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
    <div class="chats-list__list">
      <template v-if="activeView === 'trip'">
        <button
          v-for="(t, i) in TRIPS"
          :key="t.id"
          class="card card--shadow chats-list__item"
          @click="emit('trip-chat', t)"
        >
          <TripAvatar :trip="t" size="sm" />
          <div class="chats-list__info">
            <p class="chats-list__name truncate">{{ t.fromShort }} → {{ t.toShort }}</p>
            <p class="chats-list__preview truncate">{{ t.date }} · групповой чат</p>
          </div>
          <div v-if="i === 0" class="unread-badge">
            <span class="unread-badge__count">2</span>
          </div>
        </button>
      </template>
      <template v-else>
        <button
          v-for="dm in DM_CONVERSATIONS"
          :key="dm.id"
          class="card card--shadow chats-list__item"
          @click="emit('dm-chat', dm)"
        >
          <img :src="dm.user.avatar" :alt="dm.user.name" class="chats-list__avatar">
          <div class="chats-list__info">
            <p class="chats-list__name truncate">{{ dm.user.name }}</p>
            <p class="chats-list__preview truncate">{{ dm.lastMessage }}</p>
          </div>
          <div class="chats-list__meta">
            <span class="chats-list__time">{{ dm.time }}</span>
            <div v-if="dm.unread" class="unread-badge">
              <span class="unread-badge__count">{{ dm.unread }}</span>
            </div>
          </div>
        </button>
      </template>
    </div>
  </div>
</template>
