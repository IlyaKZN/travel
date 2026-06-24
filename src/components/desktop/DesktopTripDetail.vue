<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowRight, Calendar, Clock, Users, ChevronLeft, Plus, MapPin, Navigation, MessageSquare,
} from 'lucide-vue-next'
import type { Trip } from '@/lib/mockData'
import { transportLabel, participantsLabel } from '@/lib/locale'
import { tripTotalParticipants, tripMaxParticipants } from '@/utils/trip'
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

const dateItems = computed(() => [
  { icon: 'calendar', label: props.trip.date, sub: 'Начало' },
  { icon: 'clock', label: props.trip.time, sub: 'Отправление' },
  { icon: 'calendar', label: props.trip.endDate, sub: 'Окончание' },
  { icon: 'clock', label: props.trip.endTime, sub: 'Прибытие' },
])

const sidebarRows = computed(() => [
  { icon: 'mappin', label: 'Откуда', value: props.trip.from },
  { icon: 'nav', label: 'Куда', value: props.trip.to },
  { icon: 'calendar', label: 'Начало', value: `${props.trip.date}, ${props.trip.time}` },
  { icon: 'calendar', label: 'Окончание', value: `${props.trip.endDate}, ${props.trip.endTime}` },
  { icon: 'users', label: 'Участники', value: participantsLabel(totalParticipants.value, tripMaxParticipants(props.trip)) },
  { icon: 'users', label: 'Свободно', value: `${seatsLeft.value} из ${props.trip.seats}` },
])
</script>

<template>
  <div class="flex-1 overflow-y-auto" style="scrollbar-width: thin">
    <div class="px-8 pt-5 pb-1">
      <button class="flex items-center gap-1.5 text-sm text-gray-500 font-medium hover:text-orange-500 transition-colors" @click="emit('back')">
        <ChevronLeft :size="16" />Назад к поездкам
      </button>
    </div>
    <div class="px-8 pb-12">
      <div class="grid grid-cols-3 gap-8 items-start">
        <div class="col-span-2 space-y-5">
          <div class="relative h-72 rounded-3xl overflow-hidden">
            <TripAvatar :trip="trip" class="w-full h-full text-6xl" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div class="absolute bottom-6 left-6 right-6">
              <div class="flex items-center gap-3 mb-1">
                <span class="text-white text-3xl font-extrabold">{{ trip.fromShort }}</span>
                <div class="flex-1 flex items-center gap-2">
                  <div class="flex-1 border-t-2 border-white/30 border-dashed" />
                  <div class="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                    <ArrowRight :size="16" class="text-white" />
                  </div>
                  <div class="flex-1 border-t-2 border-white/30 border-dashed" />
                </div>
                <span class="text-white text-3xl font-extrabold">{{ trip.toShort }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-white/70 text-sm">{{ trip.from }}</span>
                <span class="text-white/70 text-sm">{{ trip.to }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-3">
            <div v-for="(item, i) in dateItems" :key="i" class="flex flex-col items-center gap-2 bg-orange-50 rounded-2xl py-4 px-3">
              <Calendar v-if="item.icon === 'calendar'" :size="18" class="text-orange-500" />
              <Clock v-else :size="18" class="text-orange-500" />
              <span class="text-sm font-extrabold text-gray-800 text-center">{{ item.label }}</span>
              <span class="text-xs text-gray-400 text-center">{{ item.sub }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col items-center gap-2 bg-orange-50 rounded-2xl py-4 px-3">
              <TransportIcon :type="trip.transport" :size="18" />
              <span class="text-sm font-extrabold text-gray-800 text-center">{{ transportLabel(trip.transport) }}</span>
              <span class="text-xs text-gray-400 text-center">Транспорт</span>
            </div>
            <div class="flex flex-col items-center gap-2 bg-orange-50 rounded-2xl py-4 px-3">
              <Users :size="18" class="text-orange-500" />
              <span class="text-sm font-extrabold text-gray-800 text-center">{{ participantsLabel(totalParticipants, tripMaxParticipants(trip)) }}</span>
              <span class="text-xs text-gray-400 text-center">Участники</span>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-5 border border-orange-50" style="box-shadow: 0 2px 12px rgba(249,115,22,0.07)">
            <h3 class="font-extrabold text-gray-900 text-base mb-4">Организатор</h3>
            <div class="flex items-center gap-4">
              <img :src="trip.host.avatar" :alt="trip.host.name" class="w-16 h-16 rounded-2xl object-cover">
              <div>
                <p class="font-extrabold text-gray-900 text-lg">{{ trip.host.name }}</p>
                <p class="text-sm text-gray-400 mt-1">Организатор поездки</p>
              </div>
              <div class="ml-auto flex gap-2">
                <button class="px-4 py-2 border border-orange-200 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors">Профиль</button>
                <button class="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-sm font-bold hover:bg-orange-100 transition-colors flex items-center gap-1.5">
                  <MessageSquare :size="14" />Написать
                </button>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-5 border border-orange-50" style="box-shadow: 0 2px 12px rgba(249,115,22,0.07)">
            <h3 class="font-extrabold text-gray-900 text-base mb-3">О поездке</h3>
            <p class="text-gray-600 leading-relaxed text-sm">{{ trip.description }}</p>
          </div>

          <div class="bg-white rounded-3xl p-5 border border-orange-50" style="box-shadow: 0 2px 12px rgba(249,115,22,0.07)">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-extrabold text-gray-900 text-base">Участники ({{ totalParticipants }})</h3>
              <span class="text-sm text-orange-500 font-bold">{{ seatsLeft }} свободных мест</span>
            </div>
            <div class="flex items-start gap-4 flex-wrap">
              <div class="flex flex-col items-center gap-1.5">
                <img :src="trip.host.avatar" :alt="trip.host.name" class="w-14 h-14 rounded-2xl object-cover ring-2 ring-orange-400 ring-offset-1">
                <span class="text-xs text-orange-500 font-bold">Организатор</span>
              </div>
              <div v-for="(p, i) in trip.participants" :key="i" class="flex flex-col items-center gap-1.5">
                <img :src="p.avatar" :alt="p.name" class="w-14 h-14 rounded-2xl object-cover">
                <span class="text-xs text-gray-500 font-medium">{{ p.name }}</span>
              </div>
              <div v-for="i in Math.min(seatsLeft, 3)" :key="'empty-' + i" class="flex flex-col items-center gap-1.5">
                <div class="w-14 h-14 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 flex items-center justify-center">
                  <Plus :size="20" class="text-orange-300" />
                </div>
                <span class="text-xs text-gray-400">Свободно</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-1">
          <div class="sticky top-4 bg-white rounded-3xl p-5 border border-orange-50 space-y-4" style="box-shadow: 0 4px 24px rgba(249,115,22,0.12)">
            <div>
              <div class="text-lg font-extrabold text-gray-900">Информация</div>
              <p class="text-sm text-gray-400 mt-0.5">Детали поездки и участие</p>
            </div>
            <div class="bg-orange-50 rounded-2xl p-4 space-y-2.5">
              <div v-for="(row, i) in sidebarRows" :key="i" class="flex items-center gap-2">
                <MapPin v-if="row.icon === 'mappin'" :size="13" class="text-orange-500" />
                <Navigation v-else-if="row.icon === 'nav'" :size="13" class="text-orange-500" />
                <Calendar v-else-if="row.icon === 'calendar'" :size="13" class="text-orange-500" />
                <Users v-else :size="13" class="text-orange-500" />
                <span class="text-xs text-gray-400 w-20 flex-shrink-0">{{ row.label }}</span>
                <span class="text-sm font-bold text-gray-800 ml-auto text-right">{{ row.value }}</span>
              </div>
            </div>
            <button
              class="w-full py-3.5 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform"
              style="box-shadow: 0 8px 24px rgba(249,115,22,0.35)"
              @click="emit('join')"
            >
              Запросить участие
            </button>
            <p class="text-center text-xs text-gray-400">Организатор рассмотрит запрос в течение 24 ч</p>
            <div class="border-t border-orange-50 pt-4 flex items-center gap-3">
              <img :src="trip.host.avatar" alt="" class="w-10 h-10 rounded-xl object-cover">
              <div>
                <p class="text-sm font-bold text-gray-900">{{ trip.host.name }}</p>
                <p class="text-xs text-gray-400">Организатор</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
