<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import TripCard from '@/components/TripCard.vue'
import { useStore } from '@/composables/useStore'
import { usersApi } from '@/api'
import { ApiError } from '@/api/client'
import { defaultAvatar } from '@/utils/unsplash'
import type { User } from '@/types'

const route = useRoute()
const { user: currentUser, trips, fetchTrips } = useStore()

const profileUser = ref<User | null>(null)
const error = ref('')
const loading = ref(true)

const routeUserId = computed(() => String(route.params.userId))
const isOwnProfile = computed(() => routeUserId.value === 'me' || routeUserId.value === currentUser.id)
const displayUser = computed(() => (isOwnProfile.value ? currentUser : profileUser.value))

const displayName = computed(() => {
  const u = displayUser.value
  if (!u) return ''
  if (u.nickname) return u.nickname
  return `${u.firstName} ${u.lastName}`.trim()
})

const userTrips = computed(() => {
  if (!displayUser.value) return []
  return trips.value.filter((t) => t.creatorId === displayUser.value!.id)
})

const showTripsSection = computed(() => isOwnProfile.value || displayUser.value?.showTours)

onMounted(async () => {
  try {
    if (isOwnProfile.value) {
      if (!currentUser.id) {
        loading.value = false
        return
      }
      profileUser.value = currentUser
      await fetchTrips({ creatorId: currentUser.id })
    } else {
      profileUser.value = await usersApi.get(routeUserId.value)
      await fetchTrips({ creatorId: routeUserId.value })
    }
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Ошибка загрузки профиля'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-shell">
    <AppHeader title="Профиль" />

    <div class="page-container">
      <div v-if="error" class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{{ error }}</div>

      <div v-if="loading" class="py-20 text-center text-slate-400">Загрузка…</div>

      <template v-else-if="displayUser">
        <div class="card p-6 sm:p-8">
          <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <img
              :src="displayUser.avatar || defaultAvatar()"
              :alt="displayName"
              class="h-24 w-24 rounded-full object-cover ring-4 ring-brand-200 dark:ring-brand-800 sm:h-28 sm:w-28"
            />
            <div class="flex-1 text-center sm:text-left">
              <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">{{ displayName }}</h1>
              <p v-if="displayUser.about" class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ displayUser.about }}</p>
            </div>
            <div v-if="isOwnProfile">
              <RouterLink to="/settings" class="btn-secondary !px-3" title="Настройки профиля">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </RouterLink>
            </div>
          </div>
        </div>

        <div v-if="showTripsSection" class="mt-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {{ isOwnProfile ? 'Мои поездки' : 'Поездки' }}
          </h2>
          <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TripCard v-for="trip in userTrips" :key="trip.id" :trip="trip" />
            <p v-if="!userTrips.length" class="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
              {{ isOwnProfile ? 'У вас пока нет поездок' : 'У пользователя пока нет поездок' }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
