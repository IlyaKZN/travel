<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ChevronLeft, Send, Camera } from 'lucide-vue-next'
import { MESSAGES } from '@/lib/mockData'
import type { Trip, Message } from '@/lib/mockData'
import { participantsLabel, formatTime } from '@/lib/locale'
import { tripTotalParticipants } from '@/utils/trip'
import TripAvatar from '@/components/TripAvatar.vue'

const props = defineProps<{
  trip: Trip
}>()

const emit = defineEmits<{
  back: []
}>()

const messages = ref<Message[]>([...MESSAGES])
const input = ref('')
const bottomRef = ref<HTMLDivElement | null>(null)
const totalParticipants = computed(() => tripTotalParticipants(props.trip))

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
</script>

<template>
  <div class="flex flex-col h-full bg-background">
    <div
      class="flex items-center gap-3 px-4 pt-14 pb-3.5 bg-white border-b border-orange-50 flex-shrink-0"
      style="box-shadow: 0 2px 8px rgba(249,115,22,0.06)"
    >
      <button class="w-9 h-9 bg-input-background rounded-xl flex items-center justify-center" @click="emit('back')">
        <ChevronLeft :size="20" class="text-gray-700" />
      </button>
      <TripAvatar :trip="trip" class="w-10 h-10 rounded-2xl text-xs flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="font-extrabold text-gray-900 text-sm truncate">{{ trip.fromShort }} → {{ trip.toShort }}</p>
        <p class="text-xs text-gray-400">{{ participantsLabel(totalParticipants) }} · {{ trip.date }}</p>
      </div>
    </div>
    <div class="flex items-center gap-3 px-5 py-3 flex-shrink-0">
      <div class="flex-1 h-px bg-orange-100" />
      <span class="text-[11px] text-gray-400 font-medium">{{ trip.date }}</span>
      <div class="flex-1 h-px bg-orange-100" />
    </div>
    <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-3" style="scrollbar-width: none">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex items-end gap-2"
        :class="msg.isMe ? 'flex-row-reverse' : ''"
      >
        <img v-if="!msg.isMe" :src="msg.avatar" alt="" class="w-7 h-7 rounded-full flex-shrink-0 mb-1 object-cover">
        <div class="max-w-[76%] flex flex-col gap-0.5" :class="msg.isMe ? 'items-end' : 'items-start'">
          <span v-if="!msg.isMe" class="text-[11px] text-gray-400 font-medium ml-1">{{ msg.sender }}</span>
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
    <div class="px-4 pb-8 pt-3 bg-white border-t border-orange-50 flex-shrink-0">
      <div class="flex items-center gap-2">
        <button class="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Camera :size="17" class="text-orange-400" />
        </button>
        <div class="flex-1 flex items-center gap-2 bg-input-background rounded-2xl px-4 py-2.5">
          <input
            v-model="input"
            placeholder="Сообщение для команды..."
            class="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            @keydown.enter="sendMessage"
          >
        </div>
        <button
          class="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0"
          style="box-shadow: 0 4px 12px rgba(249,115,22,0.4)"
          @click="sendMessage"
        >
          <Send :size="15" class="text-white" />
        </button>
      </div>
    </div>
  </div>
</template>
