<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowRight, Calendar, Clock, Users, ChevronLeft, Plus,
} from 'lucide-vue-next'
import type { Trip } from '@/lib/mockData'
import { transportLabel } from '@/lib/locale'
import { tripTotalParticipants } from '@/utils/trip'
import TripAvatar from '@/components/TripAvatar.vue'
import TransportIcon from '@/components/TransportIcon.vue'

const props = defineProps<{
  trip: Trip
}>()

const emit = defineEmits<{
  back: []
  join: []
}>()

const seatsLeft = computed(() => props.trip.seats - props.trip.takenSeats)
const totalParticipants = computed(() => tripTotalParticipants(props.trip))

const infoItems = computed(() => [
  { icon: 'calendar', label: props.trip.date.split(',')[0]?.trim() ?? props.trip.date, sub: 'Начало' },
  { icon: 'clock', label: props.trip.time, sub: 'Отправление' },
  { icon: 'calendar', label: props.trip.endDate.split(',')[0]?.trim() ?? props.trip.endDate, sub: 'Окончание' },
  { icon: 'clock', label: props.trip.endTime, sub: 'Прибытие' },
])
</script>

<template>
  <div class="flex flex-col h-full bg-background">
    <div class="relative h-60 flex-shrink-0">
      <TripAvatar :trip="trip" class="w-full h-full text-5xl" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <button
        class="absolute top-4 left-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow"
        @click="emit('back')"
      >
        <ChevronLeft :size="20" class="text-gray-800" />
      </button>
      <div class="absolute bottom-5 left-5 right-5">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-white text-2xl font-extrabold">{{ trip.fromShort }}</span>
          <div class="flex-1 flex items-center gap-1">
            <div class="flex-1 border-t-2 border-white/30 border-dashed" />
            <div class="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
              <ArrowRight :size="14" class="text-white" />
            </div>
            <div class="flex-1 border-t-2 border-white/30 border-dashed" />
          </div>
          <span class="text-white text-2xl font-extrabold">{{ trip.toShort }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-white/70 text-xs">{{ trip.from }}</span>
          <span class="text-white/70 text-xs">{{ trip.to }}</span>
        </div>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto" style="scrollbar-width: none">
      <div class="bg-white rounded-t-[2rem] -mt-4 px-5 pt-5 pb-6">
        <div class="grid grid-cols-4 gap-2 mb-5">
          <div
            v-for="(item, i) in infoItems"
            :key="i"
            class="flex flex-col items-center gap-1 bg-orange-50 rounded-2xl py-3 px-1"
          >
            <Calendar v-if="item.icon === 'calendar'" :size="14" class="text-orange-500" />
            <Clock v-else :size="14" class="text-orange-500" />
            <span class="text-xs font-extrabold text-gray-800 text-center leading-tight">{{ item.label }}</span>
            <span class="text-[9px] text-gray-400 text-center">{{ item.sub }}</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 mb-5">
          <div class="flex flex-col items-center gap-1 bg-orange-50 rounded-2xl py-3 px-1">
            <TransportIcon :type="trip.transport" :size="14" />
            <span class="text-xs font-extrabold text-gray-800 text-center leading-tight">{{ transportLabel(trip.transport) }}</span>
            <span class="text-[9px] text-gray-400 text-center">Транспорт</span>
          </div>
          <div class="flex flex-col items-center gap-1 bg-orange-50 rounded-2xl py-3 px-1">
            <Users :size="14" class="text-orange-500" />
            <span class="text-xs font-extrabold text-gray-800 text-center leading-tight">{{ totalParticipants }}</span>
            <span class="text-[9px] text-gray-400 text-center">Участников</span>
          </div>
        </div>
        <div class="flex items-center gap-3 mb-5 p-3.5 bg-orange-50 rounded-2xl">
          <img :src="trip.host.avatar" :alt="trip.host.name" class="w-12 h-12 rounded-2xl object-cover">
          <div>
            <p class="font-extrabold text-gray-900 text-sm">{{ trip.host.name }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Организатор поездки</p>
          </div>
          <button class="ml-auto px-3 py-1.5 border border-orange-200 text-orange-500 rounded-xl text-xs font-bold">
            Профиль
          </button>
        </div>
        <div class="mb-5">
          <h3 class="font-extrabold text-gray-900 mb-1.5 text-sm">О поездке</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ trip.description }}</p>
        </div>
        <div class="mb-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-extrabold text-gray-900 text-sm">Участники ({{ totalParticipants }})</h3>
            <span class="text-xs text-orange-500 font-bold">{{ seatsLeft }} свободных мест</span>
          </div>
          <div class="flex items-start gap-3 flex-wrap">
            <div class="flex flex-col items-center gap-1">
              <img :src="trip.host.avatar" :alt="trip.host.name" class="w-12 h-12 rounded-2xl object-cover ring-2 ring-orange-400 ring-offset-1">
              <span class="text-[10px] text-orange-500 font-bold">Организатор</span>
            </div>
            <div v-for="(p, i) in trip.participants" :key="i" class="flex flex-col items-center gap-1">
              <img :src="p.avatar" :alt="p.name" class="w-12 h-12 rounded-2xl object-cover">
              <span class="text-[10px] text-gray-500 font-medium">{{ p.name }}</span>
            </div>
            <div v-for="i in Math.min(seatsLeft, 2)" :key="'empty-' + i" class="flex flex-col items-center gap-1">
              <div class="w-12 h-12 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 flex items-center justify-center">
                <Plus :size="18" class="text-orange-300" />
              </div>
              <span class="text-[10px] text-gray-400">Свободно</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="px-5 pb-8 pt-3 bg-white border-t border-orange-50">
      <button
        class="w-full py-4 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform"
        style="box-shadow: 0 8px 24px rgba(249,115,22,0.35)"
        @click="emit('join')"
      >
        Запросить участие
      </button>
      <p class="text-center text-xs text-gray-400 mt-2">
        Организатор рассмотрит запрос в течение 24 часов
      </p>
    </div>
  </div>
</template>
