<script setup lang="ts">
import type { ChatMessage } from '@/types'

defineProps<{
  message: ChatMessage
  isOwn: boolean
}>()

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex gap-2" :class="isOwn ? 'flex-row-reverse' : ''">
    <img
      v-if="!isOwn"
      :src="message.senderAvatar"
      :alt="message.senderName"
      class="mt-1 h-8 w-8 shrink-0 rounded-full object-cover"
    />
    <div class="max-w-[75%]" :class="isOwn ? 'items-end' : ''">
      <p v-if="!isOwn" class="mb-0.5 text-xs text-stone-500 dark:text-stone-400">{{ message.senderName }}</p>
      <div
        class="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        :class="isOwn
          ? 'rounded-br-md bg-gradient-to-r from-sky-500 to-brand-500 text-white'
          : 'rounded-bl-md bg-white text-stone-800 shadow-sm dark:bg-stone-800 dark:text-stone-100'"
      >
        {{ message.text }}
      </div>
      <p class="mt-1 text-[10px] text-stone-400" :class="isOwn ? 'text-right' : ''">{{ formatTime(message.createdAt) }}</p>
    </div>
  </div>
</template>
