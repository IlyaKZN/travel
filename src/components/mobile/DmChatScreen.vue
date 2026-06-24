<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ChevronLeft, Send } from 'lucide-vue-next'
import { DM_MESSAGES } from '@/lib/mockData'
import type { DmConversation, Message } from '@/lib/mockData'
import { formatTime } from '@/lib/locale'

defineProps<{
  dm: DmConversation
}>()

const emit = defineEmits<{
  back: []
}>()

const messages = ref<Message[]>([...DM_MESSAGES])
const input = ref('')
const bottomRef = ref<HTMLDivElement | null>(null)

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
      <img :src="dm.user.avatar" :alt="dm.user.name" class="trip-detail__dm-avatar">
      <div class="screen-header__info">
        <p class="screen-header__title truncate">{{ dm.user.name }}</p>
        <p class="screen-header__subtitle">Личные сообщения</p>
      </div>
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
        <div class="chat-input-bar__field">
          <input
            v-model="input"
            placeholder="Сообщение..."
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
