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
  <div class="flex flex-1 overflow-hidden">
    <aside class="w-60 flex-shrink-0 bg-white border-r border-orange-50 overflow-y-auto p-5" style="scrollbar-width: none">
      <h3 class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
        <Filter :size="11" />Фильтры
      </h3>

      <div class="mb-5">
        <p class="text-sm font-extrabold text-gray-800 mb-3">Транспорт</p>
        <div class="space-y-1.5">
          <button
            v-for="t in DESKTOP_TRANSPORT_FILTERS"
            :key="t.type"
            class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="selectedTransports.includes(t.type) ? 'bg-orange-500 text-white' : 'bg-secondary text-gray-600 hover:bg-orange-50'"
            @click="toggleTransport(t.type)"
          >
            <component :is="transportIcon(t.type)" :size="14" />
            {{ t.label }}
            <Check v-if="selectedTransports.includes(t.type)" :size="13" class="ml-auto" />
          </button>
        </div>
      </div>

      <div class="mb-5">
        <p class="text-sm font-extrabold text-gray-800 mb-1">Мин. мест</p>
        <p class="text-xs text-gray-400 mb-3">{{ openSeatsLabel(minSeats) }}</p>
        <input v-model.number="minSeats" type="range" min="1" max="6" class="w-full accent-orange-500">
        <div class="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>6</span></div>
      </div>

      <button
        v-if="selectedTransports.length > 0 || minSeats > 1"
        class="w-full py-2 text-xs font-bold text-orange-500 border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors mb-5"
        @click="resetFilters"
      >
        Сбросить фильтры
      </button>

      <div class="pt-4 border-t border-orange-50">
        <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <TrendingUp :size="11" />Популярные маршруты
        </p>
        <div class="space-y-1">
          <div
            v-for="(r, i) in popularRoutes"
            :key="i"
            class="flex items-center gap-2 text-sm text-gray-600 py-1.5 px-2 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors"
          >
            <span class="font-bold text-gray-800 text-xs">{{ r.from }}</span>
            <ArrowRight :size="11" class="text-orange-400" />
            <span class="font-bold text-gray-800 text-xs">{{ r.to }}</span>
            <span class="ml-auto text-[10px] text-gray-400 bg-orange-50 px-1.5 py-0.5 rounded-md">{{ r.count }}</span>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto" style="scrollbar-width: thin">
      <div class="relative h-56 bg-orange-200 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&h=448&fit=crop" alt="Путешествие" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-r from-orange-700/75 via-orange-500/50 to-transparent" />
        <div class="absolute inset-0 flex flex-col justify-center px-10">
          <p class="text-orange-200 text-sm font-medium mb-1 uppercase tracking-widest">Найдите следующее приключение</p>
          <h1 class="text-4xl font-extrabold text-white mb-1 leading-tight">Ваша команда<br>уже ждёт вас</h1>
          <p class="text-white/70 text-sm mb-5">Более {{ TRIPS.length * 20 }} предстоящих поездок по России</p>
          <div class="flex items-center bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-xl">
            <div class="flex items-center gap-2.5 px-4 py-3.5 flex-1 min-w-0">
              <MapPin :size="16" class="text-orange-400 flex-shrink-0" />
              <input placeholder="Откуда..." class="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none font-medium min-w-0 w-0">
            </div>
            <div class="w-px h-8 bg-orange-100 flex-shrink-0" />
            <div class="flex items-center gap-2.5 px-4 py-3.5 flex-1 min-w-0">
              <Navigation :size="16" class="text-orange-400 flex-shrink-0" />
              <input placeholder="Куда..." class="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none font-medium min-w-0 w-0">
            </div>
            <div class="w-px h-8 bg-orange-100 flex-shrink-0" />
            <div class="flex items-center gap-2.5 px-4 py-3.5 flex-1 min-w-0">
              <Calendar :size="16" class="text-orange-400 flex-shrink-0" />
              <input type="date" class="flex-1 text-sm text-gray-600 outline-none font-medium min-w-0 w-0 bg-transparent">
            </div>
            <button class="flex-shrink-0 px-5 py-3.5 bg-orange-500 text-white text-sm font-extrabold hover:bg-orange-600 transition-colors whitespace-nowrap">
              Найти
            </button>
          </div>
        </div>
      </div>

      <div class="px-6 py-5">
        <div class="flex items-center gap-2 mb-5 flex-wrap">
          <button
            v-for="f in TRANSPORT_FILTERS"
            :key="f.id"
            class="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            :class="activeChip === f.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-100 hover:border-orange-200'"
            :style="activeChip === f.id ? { boxShadow: '0 4px 12px rgba(249,115,22,0.3)' } : {}"
            @click="activeChip = f.id"
          >
            {{ f.label }}
          </button>
          <div v-if="hasActiveFilters" class="ml-auto text-sm text-gray-400 font-medium">
            <span class="font-extrabold text-gray-800">{{ filteredTrips.length }}</span> поездок найдено
          </div>
        </div>

        <div v-if="filteredTrips.length === 0" class="flex flex-col items-center py-20">
          <MapPin :size="48" class="mb-4 text-orange-200" />
          <p class="text-base text-gray-400 font-medium">Нет поездок по вашим фильтрам</p>
          <button class="mt-3 text-orange-500 text-sm font-bold hover:underline" @click="resetFilters">
            Сбросить все фильтры
          </button>
        </div>
        <div v-else class="grid grid-cols-2 xl:grid-cols-3 gap-5">
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
