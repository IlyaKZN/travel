<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Tour } from '@/types'
import { formatDateTime, formatPrice, locationTypeLabels } from '@/data/mock'

defineProps<{ tour: Tour }>()
</script>

<template>
  <RouterLink :to="`/tours/${tour.id}`" class="card block overflow-hidden transition hover:shadow-md">
    <img
      v-if="tour.images[0]"
      :src="tour.images[0]"
      :alt="tour.location"
      class="aspect-[16/9] w-full object-cover"
    />
    <div class="p-4">
      <div class="mb-3 flex items-center gap-2">
        <img :src="tour.creatorAvatar" :alt="tour.creatorName" class="h-8 w-8 rounded-full object-cover" />
        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ tour.creatorName }}</span>
        <span
          v-if="tour.isClosed"
          class="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
        >
          Закрытая
        </span>
      </div>
      <h3 class="font-semibold text-slate-900 dark:text-slate-100">{{ tour.location }}</h3>
      <p class="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{{ tour.shortDescription }}</p>
      <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span class="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1">{{ locationTypeLabels[tour.locationType] }}</span>
        <span class="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1">{{ tour.freeSpots }}/{{ tour.maxParticipants }} мест</span>
      </div>
      <div class="mt-3 flex items-center justify-between">
        <span class="text-lg font-bold text-brand-600">{{ formatPrice(tour.price) }}</span>
        <span class="text-xs text-slate-400 dark:text-slate-500">{{ formatDateTime(tour.startDate) }}</span>
      </div>
    </div>
  </RouterLink>
</template>
