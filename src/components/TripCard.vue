<script setup lang="ts">
import { ArrowRight, Calendar, Clock, Users } from 'lucide-vue-next'
import type { Trip } from '@/lib/mockData'
import { transportLabel, seatsLeftLabel, participantsLabel } from '@/lib/locale'
import { tripTotalParticipants, tripMaxParticipants } from '@/utils/trip'
import TransportIcon from './TransportIcon.vue'

defineProps<{
  trip: Trip
}>()

const emit = defineEmits<{
  select: []
}>()
</script>

<template>
  <div
    class="bg-white rounded-3xl overflow-hidden border border-orange-50 active:scale-[0.98] transition-transform cursor-pointer hover:shadow-md"
    style="box-shadow: 0 2px 16px rgba(249,115,22,0.08)"
    @click="emit('select')"
  >
    <div class="p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-1.5 bg-orange-50 rounded-xl px-2.5 py-1.5">
          <span class="text-orange-500">
            <TransportIcon :type="trip.transport" :size="13" />
          </span>
          <span class="text-xs font-bold text-gray-700">{{ transportLabel(trip.transport) }}</span>
        </div>
        <div
          class="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
          :class="trip.seats - trip.takenSeats <= 1 ? 'bg-red-500' : 'bg-orange-500'"
        >
          {{ seatsLeftLabel(trip.seats - trip.takenSeats) }}
        </div>
      </div>
      <div class="flex items-center gap-2 mb-3">
        <div class="flex flex-col items-center">
          <span class="text-base font-extrabold text-gray-900">{{ trip.fromShort }}</span>
          <span class="text-[10px] text-gray-400">{{ trip.from }}</span>
        </div>
        <div class="flex-1 flex items-center gap-1">
          <div class="flex-1 border-t-2 border-dashed border-orange-200" />
          <div class="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center">
            <ArrowRight :size="11" class="text-orange-400" />
          </div>
          <div class="flex-1 border-t-2 border-dashed border-orange-200" />
        </div>
        <div class="flex flex-col items-center">
          <span class="text-base font-extrabold text-gray-900">{{ trip.toShort }}</span>
          <span class="text-[10px] text-gray-400">{{ trip.to }}</span>
        </div>
      </div>
      <div class="flex items-center gap-4 mb-3">
        <div class="flex items-center gap-1.5">
          <Calendar :size="12" class="text-orange-400" />
          <span class="text-xs font-medium text-gray-600">{{ trip.date }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <Clock :size="12" class="text-orange-400" />
          <span class="text-xs font-medium text-gray-600">{{ trip.time }}</span>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <p class="text-xs font-bold text-gray-800">{{ trip.host.name }}</p>
        <div class="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
          <Users :size="12" class="text-orange-400" />
          <span>{{ participantsLabel(tripTotalParticipants(trip), tripMaxParticipants(trip)) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
