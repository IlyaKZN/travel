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
  <div class="screen">
    <div class="home-screen__header">
      <div class="home-screen__greeting-row">
        <div>
          <p class="home-screen__greeting">Доброе утро,</p>
          <h1 class="home-screen__title">Алексей Ч. 👋</h1>
        </div>
        <button class="home-screen__bell">
          <Bell :size="18" class="icon--gray-dark" />
          <div class="home-screen__bell-dot" />
        </button>
      </div>
      <div class="home-screen__location">
        <MapPin :size="13" class="icon--orange" />
        <span class="home-screen__location-text">Москва</span>
        <ChevronRight :size="12" class="icon--gray" />
      </div>
    </div>
    <div class="home-screen__filters">
      <div class="home-screen__filters-scroll">
        <button
          v-for="f in TRANSPORT_FILTERS"
          :key="f.id"
          class="chip"
          :class="activeFilter === f.id ? 'chip--active' : 'chip--outline'"
          @click="activeFilter = f.id"
        >
          {{ f.label }}
        </button>
      </div>
    </div>
    <div class="home-screen__list">
      <div class="home-screen__section-header">
        <h2 class="home-screen__section-title">Ближайшие поездки</h2>
        <button class="btn--ghost">Все</button>
      </div>
      <div v-if="filteredTrips.length === 0" class="empty-state empty-state--md">
        <MapPin :size="40" class="empty-state__icon" />
        <p class="empty-state__text">Поездок по этому фильтру не найдено</p>
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
