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
  <div class="screen">
    <div class="screen-header">
      <button class="btn btn--icon btn--back-muted" @click="emit('back')">
        <ChevronLeft :size="20" class="icon--gray-darker" />
      </button>
      <TripAvatar :trip="trip" size="xs" />
      <div class="screen-header__info">
        <p class="screen-header__title truncate">{{ trip.fromShort }} → {{ trip.toShort }}</p>
        <p class="screen-header__subtitle">{{ participantsLabel(totalParticipants) }} · {{ trip.date }}</p>
      </div>
    </div>
    <div class="date-divider">
      <div class="date-divider__line" />
      <span class="date-divider__text">{{ trip.date }}</span>
      <div class="date-divider__line" />
    </div>
    <div class="chat-screen__messages">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="chat-message"
        :class="{ 'chat-message--mine': msg.isMe }"
      >
        <img v-if="!msg.isMe" :src="msg.avatar" alt="" class="chat-message__avatar">
        <div
          class="chat-message__content"
          :class="msg.isMe ? 'chat-message__content--end' : 'chat-message__content--start'"
        >
          <span v-if="!msg.isMe" class="chat-message__sender">{{ msg.sender }}</span>
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
    <div class="chat-input-bar">
      <div class="chat-input-bar__row">
        <button class="btn btn--icon-lg btn--camera">
          <Camera :size="17" class="icon--orange" />
        </button>
        <div class="chat-input-bar__field">
          <input
            v-model="input"
            placeholder="Сообщение для команды..."
            class="chat-input-bar__input"
            @keydown.enter="sendMessage"
          >
        </div>
        <button class="btn btn--icon-lg btn--send" @click="sendMessage">
          <Send :size="15" class="icon--white" />
        </button>
      </div>
    </div>
  </div>
</template>
