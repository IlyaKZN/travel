<script setup lang="ts">
import type { Post } from '@/types'
import PostMenu from './PostMenu.vue'

defineProps<{ post: Post; isOwner?: boolean }>()
const emit = defineEmits<{ edit: [id: string]; delete: [id: string] }>()

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}
</script>

<template>
  <article class="card overflow-hidden">
    <div class="flex items-start justify-between p-4 pb-2">
      <time class="text-xs text-slate-400 dark:text-slate-500">{{ formatDate(post.createdAt) }}</time>
      <PostMenu
        v-if="isOwner"
        :post-id="post.id"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
    <p class="px-4 pb-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{{ post.text }}</p>
    <img
      v-if="post.image"
      :src="post.image"
      :alt="post.text"
      class="aspect-[16/10] w-full object-cover"
    />
    <div class="flex items-center gap-4 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
      <span class="flex items-center gap-1">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {{ post.views }}
      </span>
      <span class="flex items-center gap-1">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {{ post.likes }}
      </span>
    </div>
  </article>
</template>
