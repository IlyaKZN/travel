<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Trip } from '@/types'
import { formatDateTime, formatPrice, locationTypeLabels } from '@/data/mock'

defineProps<{ trip: Trip }>()
</script>

<template>
  <RouterLink :to="`/trips/${trip.id}`" class="card block overflow-hidden transition hover:shadow-md">
    <img
      v-if="trip.images[0]"
      :src="trip.images[0]"
      :alt="trip.location"
      class="aspect-[16/9] w-full object-cover"
    />
    <div class="p-4">
      <div class="mb-3 flex items-center gap-2">
        <img :src="trip.creatorAvatar" :alt="trip.creatorName" class="h-8 w-8 rounded-full object-cover" />
        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ trip.creatorName }}</span>
      </div>
      <h3 class="font-semibold text-slate-900 dark:text-slate-100">{{ trip.location }}</h3>
      <p class="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{{ trip.shortDescription }}</p>
      <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span class="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1">{{ locationTypeLabels[trip.locationType] }}</span>
        <span class="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1">{{ trip.transport }}</span>
        <span class="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1">{{ trip.freeSpots }}/{{ trip.maxParticipants }} мест</span>
      </div>
      <div class="mt-3 flex items-center justify-between">
        <span class="text-lg font-bold text-brand-600">{{ formatPrice(trip.price) }}</span>
        <span class="text-xs text-slate-400 dark:text-slate-500">{{ formatDateTime(trip.startDate) }}</span>
      </div>
    </div>
  </RouterLink>
</template>
