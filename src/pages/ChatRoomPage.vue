<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ChatBubble from '@/components/ChatBubble.vue'
import { useStore } from '@/composables/useStore'
import { useChatSocket } from '@/composables/useChatSocket'
import type { Conversation, ChatMessage } from '@/types'

const route = useRoute()
const { user } = useStore()

const conversation = ref<Conversation | null>(null)
const messages = ref<ChatMessage[]>([])
const newText = ref('')
const sending = ref(false)
const messagesEnd = ref<HTMLElement | null>(null)

const conversationId = computed(() => route.params.id as string)
const { status, error, connect, send, disconnect } = useChatSocket(conversationId)

function scrollToBottom() {
  messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
}

function appendMessage(msg: ChatMessage) {
  if (messages.value.some((m) => m.id === msg.id)) return
  messages.value.push(msg)
}

function onJoined(data: { conversation: Conversation; messages: ChatMessage[] }) {
  conversation.value = data.conversation
  messages.value = data.messages
  nextTick(scrollToBottom)
}

function startSocket() {
  connect(onJoined, (msg) => {
    appendMessage(msg)
    nextTick(scrollToBottom)
  })
}

function sendMessage() {
  const text = newText.value.trim()
  if (!text || sending.value || status.value !== 'connected') return
  sending.value = true
  const ok = send(text)
  if (ok) newText.value = ''
  else error.value = 'Не удалось отправить'
  sending.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

onMounted(startSocket)
onUnmounted(() => disconnect())

watch(conversationId, () => {
  messages.value = []
  conversation.value = null
  disconnect(false)
  startSocket()
})
</script>

<template>
  <div class="flex h-[100dvh] flex-col bg-warm-50 dark:bg-stone-950">
    <AppHeader :title="conversation?.title ?? 'Чат'" show-back />

    <div
      v-if="status === 'connecting'"
      class="border-b border-stone-200 bg-warm-100 px-4 py-1.5 text-center text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900"
    >
      Подключение…
    </div>

    <div
      v-if="conversation?.type === 'trip'"
      class="border-b border-stone-200 bg-brand-50 px-4 py-2 text-center text-xs text-brand-800 dark:border-stone-800 dark:bg-brand-950/40 dark:text-brand-200"
    >
      Общий чат участников поездки · {{ conversation.participantCount }} чел.
    </div>

    <div v-if="error" class="bg-red-50 px-4 py-2 text-center text-sm text-red-600">{{ error }}</div>

    <div class="flex-1 overflow-y-auto px-4 py-4">
      <div class="mx-auto flex max-w-2xl flex-col gap-4">
        <ChatBubble
          v-for="msg in messages"
          :key="msg.id"
          :message="msg"
          :is-own="msg.senderId === user.id"
        />
        <div ref="messagesEnd" />
      </div>
      <p v-if="!messages.length && status === 'connected' && !error" class="py-12 text-center text-stone-400">
        Напишите первое сообщение
      </p>
    </div>

    <div class="border-t border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <form class="mx-auto flex max-w-2xl gap-2" @submit.prevent="sendMessage">
        <textarea
          v-model="newText"
          rows="1"
          class="input-field max-h-32 min-h-[44px] flex-1 resize-none"
          placeholder="Сообщение..."
          :disabled="status !== 'connected'"
          @keydown="onKeydown"
        />
        <button
          type="submit"
          class="btn-primary shrink-0 self-end !px-4"
          :disabled="sending || !newText.trim() || status !== 'connected'"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  </div>
</template>
