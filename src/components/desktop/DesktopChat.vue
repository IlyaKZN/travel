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
  <div class="flex flex-1 overflow-hidden">
    <aside class="w-64 flex-shrink-0 bg-white border-r border-orange-50 flex flex-col">
      <div class="p-4 border-b border-orange-50">
        <h3 class="font-extrabold text-gray-900 text-sm mb-3">Чаты</h3>
        <div class="flex gap-1.5">
          <button
            v-for="tab in chatTabs"
            :key="tab.id"
            class="flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all"
            :class="chatView === tab.id ? 'bg-orange-500 text-white' : 'bg-secondary text-gray-600'"
            @click="chatView = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto" style="scrollbar-width: none">
        <template v-if="chatView === 'trip'">
          <button
            v-for="(t, i) in TRIPS"
            :key="t.id"
            class="w-full flex items-center gap-3 px-4 py-3.5 border-b border-orange-50 transition-colors text-left"
            :class="t.id === activeTrip.id && !selectedDm ? 'bg-orange-50' : 'hover:bg-background'"
            @click="emit('select-trip', t); chatView = 'trip'"
          >
            <TripAvatar :trip="t" class="w-10 h-10 rounded-2xl text-xs flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-800 truncate">{{ t.fromShort }} → {{ t.toShort }}</p>
              <p class="text-xs text-gray-400 truncate">{{ t.date }}</p>
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
            class="w-full flex items-center gap-3 px-4 py-3.5 border-b border-orange-50 transition-colors text-left"
            :class="dm.id === activeDm.id ? 'bg-orange-50' : 'hover:bg-background'"
            @click="emit('select-dm', dm); chatView = 'personal'"
          >
            <img :src="dm.user.avatar" :alt="dm.user.name" class="w-10 h-10 rounded-2xl object-cover flex-shrink-0">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-800 truncate">{{ dm.user.name }}</p>
              <p class="text-xs text-gray-400 truncate">{{ dm.lastMessage }}</p>
            </div>
            <div v-if="dm.unread" class="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-[9px] font-extrabold text-white">{{ dm.unread }}</span>
            </div>
          </button>
        </template>
      </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-orange-50 flex-shrink-0">
        <template v-if="chatView === 'personal'">
          <img :src="activeDm.user.avatar" :alt="activeDm.user.name" class="w-10 h-10 rounded-2xl object-cover flex-shrink-0">
          <div>
            <p class="font-extrabold text-gray-900">{{ activeDm.user.name }}</p>
            <p class="text-xs text-gray-400">Личные сообщения</p>
          </div>
        </template>
        <template v-else>
          <TripAvatar :trip="activeTrip" class="w-10 h-10 rounded-2xl text-xs flex-shrink-0" />
          <div>
            <p class="font-extrabold text-gray-900">{{ activeTrip.fromShort }} → {{ activeTrip.toShort }}</p>
            <p class="text-xs text-gray-400">{{ participantsLabel(totalParticipants) }} · {{ activeTrip.date }}</p>
          </div>
        </template>
      </div>

      <div class="flex-1 overflow-y-auto px-5 pb-4 space-y-3" style="scrollbar-width: thin">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex items-end gap-2"
          :class="msg.isMe ? 'flex-row-reverse' : ''"
        >
          <img v-if="!msg.isMe" :src="msg.avatar" alt="" class="w-8 h-8 rounded-full object-cover flex-shrink-0 mb-1">
          <div class="max-w-[65%] flex flex-col gap-0.5" :class="msg.isMe ? 'items-end' : 'items-start'">
            <span v-if="chatView === 'trip' && !msg.isMe" class="text-xs text-gray-400 font-medium ml-1">{{ msg.sender }}</span>
            <div
              class="px-4 py-2.5 text-sm leading-relaxed font-medium"
              :class="msg.isMe ? 'bg-orange-500 text-white rounded-2xl rounded-br-sm' : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm'"
              :style="!msg.isMe ? { boxShadow: '0 1px 6px rgba(0,0,0,0.06)' } : {}"
            >
              {{ msg.text }}
            </div>
            <span class="text-[10px] text-gray-400 mx-1">{{ msg.time }}</span>
          </div>
        </div>
        <div ref="bottomRef" />
      </div>

      <div class="px-5 py-3.5 bg-white border-t border-orange-50 flex-shrink-0">
        <div class="flex items-center gap-3">
          <button class="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Camera :size="16" class="text-orange-400" />
          </button>
          <div class="flex-1 flex items-center gap-2 bg-input-background rounded-2xl px-4 py-2.5 border border-orange-50">
            <input
              v-model="input"
              :placeholder="chatView === 'personal' ? 'Личное сообщение...' : 'Сообщение для команды...'"
              class="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              @keydown.enter="sendMessage"
            >
          </div>
          <button
            class="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0"
            style="box-shadow: 0 4px 12px rgba(249,115,22,0.4)"
            @click="sendMessage"
          >
            <Send :size="15" class="text-white" />
          </button>
        </div>
      </div>
    </div>

    <aside v-if="chatView === 'trip'" class="w-72 flex-shrink-0 bg-white border-l border-orange-50 overflow-y-auto p-5" style="scrollbar-width: none">
      <h3 class="font-extrabold text-gray-900 mb-4">Детали поездки</h3>
      <TripAvatar :trip="activeTrip" class="relative h-28 rounded-2xl text-3xl mb-4" />
      <div class="space-y-2 mb-5">
        <div v-for="(r, i) in tripDetailRows" :key="i" class="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
          <Calendar v-if="r.icon === 'calendar'" :size="13" class="text-orange-400" />
          <Clock v-else-if="r.icon === 'clock'" :size="13" class="text-orange-400" />
          <TransportIcon v-else-if="r.icon === 'transport'" :type="activeTrip.transport" :size="13" />
          <Users v-else :size="13" class="text-orange-400" />
          {{ r.label }}
        </div>
      </div>
      <div class="border-t border-orange-50 pt-4">
        <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Участники</p>
        <div class="space-y-3">
          <div v-for="(member, i) in members" :key="i" class="flex items-center gap-2.5">
            <img :src="member.avatar" :alt="member.name" class="w-9 h-9 rounded-xl object-cover flex-shrink-0">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-800 truncate">{{ member.name }}</p>
              <p class="text-xs text-gray-400">{{ member.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
