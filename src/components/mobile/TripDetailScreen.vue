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
  <div class="screen">
    <div class="trip-detail__hero">
      <TripAvatar :trip="trip" size="lg" />
      <div class="trip-detail__hero-overlay" />
      <button class="btn btn--icon trip-detail__back" @click="emit('back')">
        <ChevronLeft :size="20" class="icon--gray-darker" />
      </button>
      <div class="trip-detail__route">
        <div class="trip-detail__route-cities">
          <span class="trip-detail__city-short">{{ trip.fromShort }}</span>
          <div class="route-connector">
            <div class="route-connector__line route-connector__line--white" />
            <div class="route-connector__arrow route-connector__arrow--primary route-connector__arrow--lg">
              <ArrowRight :size="14" class="icon--white" />
            </div>
            <div class="route-connector__line route-connector__line--white" />
          </div>
          <span class="trip-detail__city-short">{{ trip.toShort }}</span>
        </div>
        <div class="trip-detail__city-row">
          <span class="trip-detail__city-full">{{ trip.from }}</span>
          <span class="trip-detail__city-full">{{ trip.to }}</span>
        </div>
      </div>
    </div>
    <div class="trip-detail__scroll">
      <div class="trip-detail__sheet">
        <div class="trip-detail__grid-4">
          <div v-for="(item, i) in infoItems" :key="i" class="info-tile">
            <Calendar v-if="item.icon === 'calendar'" :size="14" class="info-tile__icon" />
            <Clock v-else :size="14" class="info-tile__icon" />
            <span class="info-tile__label">{{ item.label }}</span>
            <span class="info-tile__sub">{{ item.sub }}</span>
          </div>
        </div>
        <div class="trip-detail__grid-2">
          <div class="info-tile">
            <TransportIcon :type="trip.transport" :size="14" />
            <span class="info-tile__label">{{ transportLabel(trip.transport) }}</span>
            <span class="info-tile__sub">Транспорт</span>
          </div>
          <div class="info-tile">
            <Users :size="14" class="info-tile__icon" />
            <span class="info-tile__label">{{ totalParticipants }}</span>
            <span class="info-tile__sub">Участников</span>
          </div>
        </div>
        <div class="trip-detail__host">
          <img :src="trip.host.avatar" :alt="trip.host.name" class="trip-detail__host-avatar">
          <div>
            <p class="trip-detail__host-name">{{ trip.host.name }}</p>
            <p class="trip-detail__host-role">Организатор поездки</p>
          </div>
          <button class="btn btn--outline" style="margin-left: auto">Профиль</button>
        </div>
        <div class="trip-detail__section">
          <h3 class="trip-detail__section-title" style="margin-bottom: 0.375rem">О поездке</h3>
          <p class="trip-detail__description">{{ trip.description }}</p>
        </div>
        <div class="trip-detail__section">
          <div class="trip-detail__section-header">
            <h3 class="trip-detail__section-title">Участники ({{ totalParticipants }})</h3>
            <span class="trip-detail__seats-left">{{ seatsLeft }} свободных мест</span>
          </div>
          <div class="trip-detail__participants">
            <div class="trip-detail__participant">
              <img :src="trip.host.avatar" :alt="trip.host.name" class="trip-detail__participant-avatar trip-detail__participant-avatar--host">
              <span class="trip-detail__participant-label">Организатор</span>
            </div>
            <div v-for="(p, i) in trip.participants" :key="i" class="trip-detail__participant">
              <img :src="p.avatar" :alt="p.name" class="trip-detail__participant-avatar">
              <span class="trip-detail__participant-name">{{ p.name }}</span>
            </div>
            <div v-for="i in Math.min(seatsLeft, 2)" :key="'empty-' + i" class="trip-detail__participant">
              <div class="trip-detail__empty-slot">
                <Plus :size="18" />
              </div>
              <span class="trip-detail__empty-label">Свободно</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bar">
      <button class="btn btn--primary" @click="emit('join')">
        Запросить участие
      </button>
      <p class="footer-bar__hint">
        Организатор рассмотрит запрос в течение 24 часов
      </p>
    </div>
  </div>
</template>
