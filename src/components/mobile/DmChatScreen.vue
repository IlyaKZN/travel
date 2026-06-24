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
  <div class="flex flex-col h-full bg-background">
    <div
      class="flex items-center gap-3 px-4 pt-5 pb-3.5 bg-white border-b border-orange-50 flex-shrink-0"
      style="box-shadow: 0 2px 8px rgba(249,115,22,0.06)"
    >
      <button class="w-9 h-9 bg-input-background rounded-xl flex items-center justify-center" @click="emit('back')">
        <ChevronLeft :size="20" class="text-gray-700" />
      </button>
      <img :src="dm.user.avatar" :alt="dm.user.name" class="w-10 h-10 rounded-2xl object-cover flex-shrink-0">
      <div class="flex-1 min-w-0">
        <p class="font-extrabold text-gray-900 text-sm truncate">{{ dm.user.name }}</p>
        <p class="text-xs text-gray-400">Личные сообщения</p>
      </div>
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
        <div class="flex-1 flex items-center gap-2 bg-input-background rounded-2xl px-4 py-2.5">
          <input
            v-model="input"
            placeholder="Сообщение..."
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
