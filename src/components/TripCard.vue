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
  <div class="trip-card" @click="emit('select')">
    <div class="trip-card__body">
      <div class="trip-card__header">
        <div class="trip-card__transport">
          <span class="icon--orange-dark">
            <TransportIcon :type="trip.transport" :size="13" />
          </span>
          <span class="trip-card__transport-label">{{ transportLabel(trip.transport) }}</span>
        </div>
        <div
          class="trip-card__seats"
          :class="trip.seats - trip.takenSeats <= 1 ? 'trip-card__seats--warning' : 'trip-card__seats--ok'"
        >
          {{ seatsLeftLabel(trip.seats - trip.takenSeats) }}
        </div>
      </div>
      <div class="trip-card__route">
        <div class="trip-card__city">
          <span class="trip-card__city-short">{{ trip.fromShort }}</span>
          <span class="trip-card__city-full">{{ trip.from }}</span>
        </div>
        <div class="route-connector">
          <div class="route-connector__line" />
          <div class="route-connector__arrow">
            <ArrowRight :size="11" />
          </div>
          <div class="route-connector__line" />
        </div>
        <div class="trip-card__city">
          <span class="trip-card__city-short">{{ trip.toShort }}</span>
          <span class="trip-card__city-full">{{ trip.to }}</span>
        </div>
      </div>
      <div class="trip-card__meta">
        <div class="trip-card__meta-item">
          <Calendar :size="12" class="icon--orange" />
          <span class="trip-card__meta-text">{{ trip.date }}</span>
        </div>
        <div class="trip-card__meta-item">
          <Clock :size="12" class="icon--orange" />
          <span class="trip-card__meta-text">{{ trip.time }}</span>
        </div>
      </div>
      <div class="trip-card__footer">
        <p class="trip-card__host">{{ trip.host.name }}</p>
        <div class="trip-card__participants">
          <Users :size="12" class="icon--orange" />
          <span>{{ participantsLabel(tripTotalParticipants(trip), tripMaxParticipants(trip)) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
