<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { chatsApi } from '@/api'
import type { Conversation, ChatUser } from '@/types'
import { ApiError } from '@/api/client'

const router = useRouter()

const conversations = ref<Conversation[]>([])
const loading = ref(true)
const error = ref('')
const showNewChat = ref(false)
const userSearch = ref('')
const users = ref<ChatUser[]>([])
const searchLoading = ref(false)

async function loadConversations() {
  loading.value = true
  error.value = ''
  try {
    conversations.value = await chatsApi.list()
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
}

async function searchUsers() {
  searchLoading.value = true
  try {
    users.value = await chatsApi.searchUsers(userSearch.value || undefined)
  } catch {
    users.value = []
  } finally {
    searchLoading.value = false
  }
}

async function startDm(userId: string) {
  try {
    const conv = await chatsApi.openDm(userId)
    showNewChat.value = false
    router.push(`/chats/${conv.id}`)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Не удалось создать чат'
  }
}

function formatPreview(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

onMounted(() => {
  loadConversations()
  searchUsers()
})
</script>

<template>
  <div class="page-shell">
    <AppHeader title="Чаты" show-back />

    <div class="page-container max-w-2xl">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100">Чаты</h1>
        <button type="button" class="btn-primary" @click="showNewChat = true">Написать</button>
      </div>

      <div v-if="error" class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{{ error }}</div>

      <p v-if="loading" class="py-12 text-center text-stone-400">Загрузка…</p>

      <div v-else-if="!conversations.length" class="card py-16 text-center">
        <p class="text-4xl">💬</p>
        <p class="mt-3 text-stone-500 dark:text-stone-400">Пока нет чатов</p>
        <button type="button" class="btn-primary mt-4" @click="showNewChat = true">Начать переписку</button>
      </div>

      <div v-else class="space-y-2">
        <RouterLink
          v-for="conv in conversations"
          :key="conv.id"
          :to="`/chats/${conv.id}`"
          class="card flex items-center gap-3 p-4 transition hover:shadow-md"
        >
          <div class="relative shrink-0">
            <img
              v-if="conv.avatar"
              :src="conv.avatar"
              :alt="conv.title"
              class="h-12 w-12 rounded-full object-cover"
              :class="conv.type === 'trip' ? 'rounded-xl' : 'rounded-full'"
            />
            <div
              v-else
              class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-brand-500 text-lg text-white"
              :class="conv.type === 'trip' ? 'rounded-xl' : 'rounded-full'"
            >
              {{ conv.type === 'trip' ? '🚌' : '👤' }}
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <h3 class="truncate font-semibold text-stone-900 dark:text-stone-100">{{ conv.title }}</h3>
              <span class="shrink-0 text-xs text-stone-400">{{ formatPreview(conv.lastMessageAt) }}</span>
            </div>
            <p v-if="conv.type === 'trip' && conv.participantCount" class="truncate text-xs text-stone-500 dark:text-stone-400">
              {{ conv.participantCount }} участников
            </p>
            <p v-else-if="conv.subtitle" class="truncate text-xs text-stone-500 dark:text-stone-400">{{ conv.subtitle }}</p>
            <p v-if="conv.lastMessage" class="truncate text-sm text-stone-500 dark:text-stone-400">{{ conv.lastMessage }}</p>
          </div>
        </RouterLink>
      </div>
    </div>

    <Teleport to="body">
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
        <div v-if="showNewChat" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" @click.self="showNewChat = false">
          <div class="flex max-h-[80vh] w-full max-w-md flex-col rounded-t-2xl bg-white dark:bg-stone-900 sm:rounded-2xl">
            <div class="border-b border-stone-200 p-4 dark:border-stone-700">
              <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">Новый чат</h3>
              <input
                v-model="userSearch"
                type="text"
                class="input-field mt-3"
                placeholder="Поиск по нику или имени..."
                @input="searchUsers"
              />
            </div>
            <div class="overflow-y-auto p-2">
              <p v-if="searchLoading" class="py-8 text-center text-sm text-stone-400">Поиск…</p>
              <button
                v-for="u in users"
                :key="u.id"
                type="button"
                class="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-warm-100 dark:hover:bg-stone-800"
                @click="startDm(u.id)"
              >
                <img :src="u.avatar" :alt="u.nickname" class="h-10 w-10 rounded-full object-cover" />
                <div>
                  <div class="font-medium text-stone-900 dark:text-stone-100">@{{ u.nickname }}</div>
                  <div class="text-sm text-stone-500">{{ u.firstName }} {{ u.lastName }}</div>
                </div>
              </button>
              <p v-if="!searchLoading && !users.length" class="py-8 text-center text-sm text-stone-400">Пользователи не найдены</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
