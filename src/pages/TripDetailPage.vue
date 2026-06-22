<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useStore } from '@/composables/useStore'
import { formatDateTime, formatPrice, locationTypeLabels } from '@/data/mock'
import type { Trip } from '@/types'
import { ApiError, getToken } from '@/api/client'
import { chatsApi } from '@/api'

const route = useRoute()
const router = useRouter()
const { getTrip, signupTrip } = useStore()

const trip = ref<Trip | null>(null)
const error = ref('')
const message = ref('')

onMounted(async () => {
  try {
    trip.value = await getTrip(route.params.id as string)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Поездка не найдена'
  }
})

async function signUp() {
  if (!trip.value) return
  error.value = ''
  message.value = ''
  try {
    await signupTrip(trip.value.id)
    message.value = 'Вы записаны на поездку!'
    trip.value = await getTrip(trip.value.id)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Не удалось записаться'
  }
}

async function openTripChat() {
  if (!trip.value) return
  if (!getToken()) {
    router.push('/login')
    return
  }
  error.value = ''
  try {
    const conv = await chatsApi.openTripChat(trip.value.id)
    router.push(`/chats/${conv.id}`)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Чат доступен участникам поездки'
  }
}
</script>

<template>
  <div v-if="trip" class="page-shell">
    <AppHeader :title="`Поездка №${trip.id}`" show-back />

    <div class="page-container py-6">
      <div v-if="error" class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{{ error }}</div>
      <div v-if="message" class="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{{ message }}</div>

      <div class="card overflow-hidden">
        <div v-if="trip.images.length" class="grid gap-1 sm:grid-cols-2">
          <img
            v-for="(img, i) in trip.images"
            :key="i"
            :src="img"
            :alt="trip.location"
            class="aspect-[16/10] w-full object-cover"
            :class="i === 0 && trip.images.length > 1 ? 'sm:col-span-2' : ''"
          />
        </div>

        <div class="p-6 sm:p-8">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div class="flex flex-wrap gap-2">
                <span class="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  {{ locationTypeLabels[trip.locationType] }}
                </span>
                <span class="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                  {{ trip.transport }}
                </span>
              </div>
              <h1 class="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">{{ trip.location }}</h1>
              <p class="mt-2 text-slate-600 dark:text-slate-300">{{ trip.shortDescription }}</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-brand-600">{{ formatPrice(trip.price) }}</div>
              <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ trip.freeSpots }}/{{ trip.maxParticipants }} мест</div>
            </div>
          </div>

          <div class="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6 dark:border-stone-800">
            <img :src="trip.creatorAvatar" :alt="trip.creatorName" class="h-10 w-10 rounded-full" />
            <div>
              <div class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ trip.creatorName }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">Организатор поездки</div>
            </div>
          </div>

          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div class="surface-muted rounded-xl p-4">
              <div class="text-xs font-medium uppercase text-slate-400 dark:text-slate-500">Начало</div>
              <div class="mt-1 text-sm font-medium">{{ formatDateTime(trip.startDate) }}</div>
            </div>
            <div class="surface-muted rounded-xl p-4">
              <div class="text-xs font-medium uppercase text-slate-400 dark:text-slate-500">Окончание</div>
              <div class="mt-1 text-sm font-medium">{{ formatDateTime(trip.endDate) }}</div>
            </div>
          </div>

          <div class="mt-6">
            <h2 class="font-semibold text-slate-900 dark:text-slate-100">План поездки</h2>
            <pre class="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-600 dark:text-slate-300">{{ trip.fullPlan }}</pre>
          </div>

          <div v-if="trip.isClosed" class="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Закрытая группа — запись по приглашению
          </div>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" class="btn-primary flex-1" @click="signUp">Записаться на поездку</button>
            <button type="button" class="btn-secondary flex-1" @click="openTripChat">
              💬 Чат поездки
            </button>
            <button type="button" class="btn-secondary flex-1" @click="router.push('/trips')">Вернуться к поездкам</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="error" class="page-shell flex items-center justify-center">
    <p class="text-slate-400">{{ error }}</p>
  </div>

  <div v-else class="page-shell flex items-center justify-center">
    <p class="text-slate-400">Загрузка…</p>
  </div>
</template>
