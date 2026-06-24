<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Send, Camera, Calendar, Clock, Users } from 'lucide-vue-next'
import { TRIPS, DM_CONVERSATIONS, MESSAGES, DM_MESSAGES } from '@/lib/mockData'
import type { Trip, DmConversation, Message } from '@/lib/mockData'
import type { ChatView } from '@/types'
import { participantsLabel, transportLabel, formatTime } from '@/lib/locale'
import { tripTotalParticipants } from '@/utils/trip'
import TripAvatar from '@/components/TripAvatar.vue'
import TransportIcon from '@/components/TransportIcon.vue'

const props = defineProps<{
  trip: Trip
  selectedDm: DmConversation | null
}>()

const emit = defineEmits<{
  'select-trip': [trip: Trip]
  'select-dm': [dm: DmConversation]
}>()

const chatView = ref<ChatView>(props.selectedDm ? 'personal' : 'trip')
const messages = ref<Message[]>(props.selectedDm ? [...DM_MESSAGES] : [...MESSAGES])
const input = ref('')
const bottomRef = ref<HTMLDivElement | null>(null)

const activeDm = computed(() => props.selectedDm ?? DM_CONVERSATIONS[0])
const activeTrip = computed(() => props.trip)
const totalParticipants = computed(() => tripTotalParticipants(activeTrip.value))

const tripDetailRows = computed(() => [
  { icon: 'calendar', label: activeTrip.value.date },
  { icon: 'clock', label: activeTrip.value.time },
  { icon: 'calendar', label: activeTrip.value.endDate },
  { icon: 'clock', label: activeTrip.value.endTime },
  { icon: 'transport', label: transportLabel(activeTrip.value.transport) },
  { icon: 'users', label: participantsLabel(totalParticipants.value) },
])

const members = computed(() => [
  { name: activeTrip.value.host.name, avatar: activeTrip.value.host.avatar, role: 'Организатор' },
  ...activeTrip.value.participants.map((p) => ({ name: p.name, avatar: p.avatar, role: 'Путешественник' })),
])

watch([chatView, () => activeDm.value.id, () => activeTrip.value.id], () => {
  messages.value = chatView.value === 'personal' ? [...DM_MESSAGES] : [...MESSAGES]
})

async function sendMessage() {
  if (!input.value.trim()) return
  messages.value = [
    ...messages.value,
    { id: messages.value.length + 1, sender: 'Я', avatar: '', text: input.value, time: formatTime(), isMe: true },
  ]
  input.value = ''
  await nextTick()
  bottomRef.value?.scrollIntoView({ behavior: 'smooth' })
}

const chatTabs: { id: ChatView; label: string }[] = [
  { id: 'trip', label: 'Поездки' },
  { id: 'personal', label: 'Личные' },
]
</script>

<template>
  <div class="desktop-chat">
    <aside class="desktop-chat__sidebar">
      <div class="desktop-chat__sidebar-header">
        <h3 class="desktop-chat__sidebar-title">Чаты</h3>
        <div class="desktop-chat__tabs">
          <button
            v-for="tab in chatTabs"
            :key="tab.id"
            class="desktop-chat__tab"
            :class="{ 'desktop-chat__tab--active': chatView === tab.id }"
            @click="chatView = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
      <div class="desktop-chat__list">
        <template v-if="chatView === 'trip'">
          <button
            v-for="(t, i) in TRIPS"
            :key="t.id"
            class="desktop-chat__list-item"
            :class="{ 'desktop-chat__list-item--active': t.id === activeTrip.id && !selectedDm }"
            @click="emit('select-trip', t); chatView = 'trip'"
          >
            <TripAvatar :trip="t" size="xs" />
            <div class="chats-list__info">
              <p class="desktop-chat__list-name truncate">{{ t.fromShort }} → {{ t.toShort }}</p>
              <p class="desktop-chat__list-preview truncate">{{ t.date }}</p>
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
            class="desktop-chat__list-item"
            :class="{ 'desktop-chat__list-item--active': dm.id === activeDm.id }"
            @click="emit('select-dm', dm); chatView = 'personal'"
          >
            <img :src="dm.user.avatar" :alt="dm.user.name" class="desktop-chat__list-avatar">
            <div class="chats-list__info">
              <p class="desktop-chat__list-name truncate">{{ dm.user.name }}</p>
              <p class="desktop-chat__list-preview truncate">{{ dm.lastMessage }}</p>
            </div>
            <div v-if="dm.unread" class="unread-badge">
              <span class="unread-badge__count">{{ dm.unread }}</span>
            </div>
          </button>
        </template>
      </div>
    </aside>

    <div class="desktop-chat__main">
      <div class="desktop-chat__header">
        <template v-if="chatView === 'personal'">
          <img :src="activeDm.user.avatar" :alt="activeDm.user.name" class="desktop-chat__list-avatar">
          <div>
            <p class="desktop-chat__header-name">{{ activeDm.user.name }}</p>
            <p class="desktop-chat__header-sub">Личные сообщения</p>
          </div>
        </template>
        <template v-else>
          <TripAvatar :trip="activeTrip" size="xs" />
          <div>
            <p class="desktop-chat__header-name">{{ activeTrip.fromShort }} → {{ activeTrip.toShort }}</p>
            <p class="desktop-chat__header-sub">{{ participantsLabel(totalParticipants) }} · {{ activeTrip.date }}</p>
          </div>
        </template>
      </div>

      <div class="desktop-chat__messages">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="chat-message"
          :class="{ 'chat-message--mine': msg.isMe }"
        >
          <img v-if="!msg.isMe" :src="msg.avatar" alt="" class="chat-message__avatar chat-message__avatar--md">
          <div
            class="chat-message__content chat-message__content--desktop"
            :class="msg.isMe ? 'chat-message__content--end' : 'chat-message__content--start'"
          >
            <span v-if="chatView === 'trip' && !msg.isMe" class="chat-message__sender">{{ msg.sender }}</span>
            <div
              class="chat-message__bubble"
              :class="msg.isMe ? 'chat-message__bubble--mine' : 'chat-message__bubble--other'"
            >
              {{ msg.text }}
            </div>
            <span class="chat-message__time">{{ msg.time }}</span>
          </div>
        </div>
        <div ref="bottomRef" />
      </div>

      <div class="desktop-chat__input-bar">
        <div class="desktop-chat__input-row">
          <button class="btn btn--icon btn--camera">
            <Camera :size="16" class="icon--orange" />
          </button>
          <div class="chat-input-bar__field chat-input-bar__field--bordered" style="flex: 1">
            <input
              v-model="input"
              :placeholder="chatView === 'personal' ? 'Личное сообщение...' : 'Сообщение для команды...'"
              class="chat-input-bar__input"
              @keydown.enter="sendMessage"
            >
          </div>
          <button class="btn btn--icon btn--send" @click="sendMessage">
            <Send :size="15" class="icon--white" />
          </button>
        </div>
      </div>
    </div>

    <aside v-if="chatView === 'trip'" class="desktop-chat__detail">
      <h3 class="desktop-chat__detail-title">Детали поездки</h3>
      <TripAvatar :trip="activeTrip" size="banner" />
      <div class="desktop-chat__detail-rows">
        <div v-for="(r, i) in tripDetailRows" :key="i" class="desktop-chat__detail-row">
          <Calendar v-if="r.icon === 'calendar'" :size="13" class="icon--orange" />
          <Clock v-else-if="r.icon === 'clock'" :size="13" class="icon--orange" />
          <TransportIcon v-else-if="r.icon === 'transport'" :type="activeTrip.transport" :size="13" />
          <Users v-else :size="13" class="icon--orange" />
          {{ r.label }}
        </div>
      </div>
      <div class="desktop-chat__members">
        <p class="desktop-chat__members-title">Участники</p>
        <div class="desktop-chat__members-list">
          <div v-for="(member, i) in members" :key="i" class="desktop-chat__member">
            <img :src="member.avatar" :alt="member.name" class="desktop-chat__member-avatar">
            <div class="chats-list__info">
              <p class="desktop-chat__member-name truncate">{{ member.name }}</p>
              <p class="desktop-chat__member-role">{{ member.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
