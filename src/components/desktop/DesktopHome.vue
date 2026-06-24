<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  MapPin, Navigation, Calendar, ArrowRight, Car, Train, Bus, Plane,
  Check, Filter, TrendingUp,
} from 'lucide-vue-next'
import { TRIPS } from '@/lib/mockData'
import type { Trip } from '@/lib/mockData'
import { TRANSPORT_FILTERS, DESKTOP_TRANSPORT_FILTERS, openSeatsLabel } from '@/lib/locale'
import TripCard from '@/components/TripCard.vue'

const emit = defineEmits<{
  'trip-select': [trip: Trip]
  'create-click': []
}>()

const selectedTransports = ref<string[]>([])
const minSeats = ref(1)
const activeChip = ref('all')

const filteredTrips = computed(() =>
  TRIPS.filter((t) => {
    if (selectedTransports.value.length > 0 && !selectedTransports.value.includes(t.transport)) return false
    if (t.seats - t.takenSeats < minSeats.value) return false
    if (activeChip.value !== 'all') {
      if (activeChip.value === 'flight') return t.transport === 'plane'
      return t.transport === activeChip.value
    }
    return true
  }),
)

const hasActiveFilters = computed(() =>
  selectedTransports.value.length > 0 || minSeats.value > 1 || activeChip.value !== 'all',
)

const popularRoutes = [
  { from: 'МСК', to: 'СОЧ', count: 12 },
  { from: 'СПБ', to: 'КРЛ', count: 8 },
  { from: 'КЗН', to: 'НН', count: 6 },
  { from: 'ЕКБ', to: 'АЛТ', count: 4 },
]

function toggleTransport(type: string) {
  selectedTransports.value = selectedTransports.value.includes(type)
    ? selectedTransports.value.filter((t) => t !== type)
    : [...selectedTransports.value, type]
}

function resetFilters() {
  selectedTransports.value = []
  minSeats.value = 1
  activeChip.value = 'all'
}

function transportIcon(type: string) {
  if (type === 'train') return Train
  if (type === 'bus') return Bus
  if (type === 'plane') return Plane
  return Car
}
</script>

<template>
  <div class="desktop-home">
    <aside class="desktop-home__sidebar">
      <h3 class="desktop-home__filter-title">
        <Filter :size="11" />Фильтры
      </h3>

      <div class="desktop-home__section">
        <p class="desktop-home__section-title">Транспорт</p>
        <div class="desktop-home__transport-list">
          <button
            v-for="t in DESKTOP_TRANSPORT_FILTERS"
            :key="t.type"
            class="desktop-home__transport-btn"
            :class="{ 'desktop-home__transport-btn--active': selectedTransports.includes(t.type) }"
            @click="toggleTransport(t.type)"
          >
            <component :is="transportIcon(t.type)" :size="14" />
            {{ t.label }}
            <Check v-if="selectedTransports.includes(t.type)" :size="13" style="margin-left: auto" />
          </button>
        </div>
      </div>

      <div class="desktop-home__section">
        <p class="desktop-home__section-title">Мин. мест</p>
        <p class="desktop-home__section-hint">{{ openSeatsLabel(minSeats) }}</p>
        <input v-model.number="minSeats" type="range" min="1" max="6" class="desktop-home__range">
        <div class="desktop-home__range-labels"><span>1</span><span>6</span></div>
      </div>

      <button
        v-if="selectedTransports.length > 0 || minSeats > 1"
        class="desktop-home__reset"
        @click="resetFilters"
      >
        Сбросить фильтры
      </button>

      <div class="desktop-home__popular">
        <p class="desktop-home__filter-title">
          <TrendingUp :size="11" />Популярные маршруты
        </p>
        <div class="desktop-home__popular-list">
          <div v-for="(r, i) in popularRoutes" :key="i" class="desktop-home__popular-item">
            <span class="desktop-home__popular-city">{{ r.from }}</span>
            <ArrowRight :size="11" class="icon--orange" />
            <span class="desktop-home__popular-city">{{ r.to }}</span>
            <span class="desktop-home__popular-count">{{ r.count }}</span>
          </div>
        </div>
      </div>
    </aside>

    <main class="desktop-home__main">
      <div class="desktop-home__hero">
        <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&h=448&fit=crop" alt="Путешествие" class="desktop-home__hero-img">
        <div class="desktop-home__hero-overlay" />
        <div class="desktop-home__hero-content">
          <p class="desktop-home__hero-sub">Найдите следующее приключение</p>
          <h1 class="desktop-home__hero-title">Ваша команда<br>уже ждёт вас</h1>
          <p class="desktop-home__hero-desc">Более {{ TRIPS.length * 20 }} предстоящих поездок по России</p>
          <div class="desktop-home__search">
            <div class="desktop-home__search-field">
              <MapPin :size="16" class="icon--orange" />
              <input placeholder="Откуда..." class="desktop-home__search-input">
            </div>
            <div class="desktop-home__search-divider" />
            <div class="desktop-home__search-field">
              <Navigation :size="16" class="icon--orange" />
              <input placeholder="Куда..." class="desktop-home__search-input">
            </div>
            <div class="desktop-home__search-divider" />
            <div class="desktop-home__search-field">
              <Calendar :size="16" class="icon--orange" />
              <input type="date" class="desktop-home__search-input">
            </div>
            <button class="desktop-home__search-btn">Найти</button>
          </div>
        </div>
      </div>

      <div class="desktop-home__content">
        <div class="desktop-home__chips">
          <button
            v-for="f in TRANSPORT_FILTERS"
            :key="f.id"
            class="chip chip--md"
            :class="activeChip === f.id ? 'chip--active' : 'chip--outline'"
            @click="activeChip = f.id"
          >
            {{ f.label }}
          </button>
          <div v-if="hasActiveFilters" class="desktop-home__results">
            <span class="desktop-home__results-count">{{ filteredTrips.length }}</span> поездок найдено
          </div>
        </div>

        <div v-if="filteredTrips.length === 0" class="empty-state empty-state--lg">
          <MapPin :size="48" class="empty-state__icon empty-state__icon--lg" />
          <p class="empty-state__text empty-state__text--base">Нет поездок по вашим фильтрам</p>
          <button class="desktop-home__reset-link" @click="resetFilters">
            Сбросить все фильтры
          </button>
        </div>
        <div v-else class="desktop-home__grid">
          <TripCard
            v-for="trip in filteredTrips"
            :key="trip.id"
            :trip="trip"
            @select="emit('trip-select', trip)"
          />
        </div>
      </div>
    </main>
  </div>
</template>
