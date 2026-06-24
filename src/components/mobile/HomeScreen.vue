<script setup lang="ts">
import { ref, computed } from 'vue'
import { MapPin, Bell, ChevronRight } from 'lucide-vue-next'
import { TRIPS } from '@/lib/mockData'
import type { Trip } from '@/lib/mockData'
import { TRANSPORT_FILTERS } from '@/lib/locale'
import TripCard from '@/components/TripCard.vue'

const emit = defineEmits<{
  'trip-select': [trip: Trip]
}>()

const activeFilter = ref('all')

const filteredTrips = computed(() =>
  activeFilter.value === 'all'
    ? TRIPS
    : TRIPS.filter((t) => {
        if (activeFilter.value === 'flight') return t.transport === 'plane'
        return t.transport === activeFilter.value
      }),
)
</script>

<template>
  <div class="flex flex-col h-full bg-background">
    <div class="px-5 pt-5 pb-3">
      <div class="flex items-center justify-between mb-1">
        <div>
          <p class="text-xs text-gray-400 font-medium">Доброе утро,</p>
          <h1 class="text-xl font-extrabold text-gray-900">Алексей Ч. 👋</h1>
        </div>
        <button
          class="relative w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-orange-100"
          style="box-shadow: 0 2px 8px rgba(249,115,22,0.1)"
        >
          <Bell :size="18" class="text-gray-600" />
          <div class="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>
      </div>
      <div class="flex items-center gap-1 mt-1">
        <MapPin :size="13" class="text-orange-400" />
        <span class="text-xs text-gray-500 font-medium">Москва</span>
        <ChevronRight :size="12" class="text-gray-400" />
      </div>
    </div>
    <div class="px-5 mb-4">
      <div class="flex gap-2 overflow-x-auto pb-1" style="scrollbar-width: none">
        <button
          v-for="f in TRANSPORT_FILTERS"
          :key="f.id"
          class="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          :class="activeFilter === f.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-100'"
          :style="activeFilter === f.id ? { boxShadow: '0 4px 12px rgba(249,115,22,0.3)' } : {}"
          @click="activeFilter = f.id"
        >
          {{ f.label }}
        </button>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto px-5 pb-24 space-y-4" style="scrollbar-width: none">
      <div class="flex items-center justify-between mb-1">
        <h2 class="text-sm font-extrabold text-gray-900">Ближайшие поездки</h2>
        <button class="text-orange-500 text-xs font-bold">Все</button>
      </div>
      <div v-if="filteredTrips.length === 0" class="flex flex-col items-center py-12 text-gray-400">
        <MapPin :size="40" class="mb-3 text-orange-200" />
        <p class="text-sm font-medium">Поездок по этому фильтру не найдено</p>
      </div>
      <TripCard
        v-for="trip in filteredTrips"
        :key="trip.id"
        :trip="trip"
        @select="emit('trip-select', trip)"
      />
    </div>
  </div>
</template>
