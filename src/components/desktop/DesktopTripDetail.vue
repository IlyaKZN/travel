<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowRight, Calendar, Clock, Users, ChevronLeft, Plus, MapPin, Navigation, MessageSquare,
} from 'lucide-vue-next'
import type { Trip } from '@/lib/mockData'
import { transportLabel, participantsLabel } from '@/lib/locale'
import { tripTotalParticipants, tripMaxParticipants } from '@/utils/trip'
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
  <div class="desktop-trip-detail">
    <div class="desktop-trip-detail__back-row">
      <button class="desktop-trip-detail__back" @click="emit('back')">
        <ChevronLeft :size="16" />Назад к поездкам
      </button>
    </div>
    <div class="desktop-trip-detail__content">
      <div class="desktop-trip-detail__grid">
        <div class="desktop-trip-detail__main">
          <div class="card card--shadow-lg desktop-trip-detail__route-card">
            <div class="desktop-trip-detail__hero-cities">
              <span class="desktop-trip-detail__city-short">{{ trip.fromShort }}</span>
              <div class="route-connector" style="gap: 0.5rem">
                <div class="route-connector__line" />
                <div class="route-connector__arrow route-connector__arrow--primary route-connector__arrow--xl">
                  <ArrowRight :size="16" class="icon--white" />
                </div>
                <div class="route-connector__line" />
              </div>
              <span class="desktop-trip-detail__city-short">{{ trip.toShort }}</span>
            </div>
            <div class="desktop-trip-detail__city-row">
              <span class="desktop-trip-detail__city-full">{{ trip.from }}</span>
              <span class="desktop-trip-detail__city-full">{{ trip.to }}</span>
            </div>
          </div>

          <div class="desktop-trip-detail__grid-4">
            <div v-for="(item, i) in dateItems" :key="i" class="info-tile info-tile--md">
              <Calendar v-if="item.icon === 'calendar'" :size="18" class="info-tile__icon" />
              <Clock v-else :size="18" class="info-tile__icon" />
              <span class="info-tile__label" style="font-size: var(--text-sm)">{{ item.label }}</span>
              <span class="info-tile__sub" style="font-size: var(--text-xs)">{{ item.sub }}</span>
            </div>
          </div>

          <div class="desktop-trip-detail__grid-2">
            <div class="info-tile info-tile--md">
              <TransportIcon :type="trip.transport" :size="18" />
              <span class="info-tile__label" style="font-size: var(--text-sm)">{{ transportLabel(trip.transport) }}</span>
              <span class="info-tile__sub" style="font-size: var(--text-xs)">Транспорт</span>
            </div>
            <div class="info-tile info-tile--md">
              <Users :size="18" class="info-tile__icon" />
              <span class="info-tile__label" style="font-size: var(--text-sm)">{{ participantsLabel(totalParticipants, tripMaxParticipants(trip)) }}</span>
              <span class="info-tile__sub" style="font-size: var(--text-xs)">Участники</span>
            </div>
          </div>

          <div class="card card--shadow-lg desktop-trip-detail__card">
            <h3 class="desktop-trip-detail__card-title">Организатор</h3>
            <div class="desktop-trip-detail__host">
              <img :src="trip.host.avatar" :alt="trip.host.name" class="desktop-trip-detail__host-avatar">
              <div>
                <p class="desktop-trip-detail__host-name">{{ trip.host.name }}</p>
                <p class="desktop-trip-detail__host-role">Организатор поездки</p>
              </div>
              <div class="desktop-trip-detail__host-actions">
                <button class="desktop-trip-detail__btn-outline">Профиль</button>
                <button class="desktop-trip-detail__btn-muted">
                  <MessageSquare :size="14" />Написать
                </button>
              </div>
            </div>
          </div>

          <div class="card card--shadow-lg desktop-trip-detail__card">
            <h3 class="desktop-trip-detail__card-title desktop-trip-detail__card-title--sm">О поездке</h3>
            <p class="desktop-trip-detail__description">{{ trip.description }}</p>
          </div>

          <div class="card card--shadow-lg desktop-trip-detail__card">
            <div class="desktop-trip-detail__participants-header">
              <h3 class="desktop-trip-detail__card-title desktop-trip-detail__card-title--sm">Участники ({{ totalParticipants }})</h3>
              <span class="desktop-trip-detail__seats-left">{{ seatsLeft }} свободных мест</span>
            </div>
            <div class="desktop-trip-detail__participants">
              <div class="desktop-trip-detail__participant">
                <img :src="trip.host.avatar" :alt="trip.host.name" class="desktop-trip-detail__participant-avatar desktop-trip-detail__participant-avatar--host">
                <span class="desktop-trip-detail__participant-label">Организатор</span>
              </div>
              <div v-for="(p, i) in trip.participants" :key="i" class="desktop-trip-detail__participant">
                <img :src="p.avatar" :alt="p.name" class="desktop-trip-detail__participant-avatar">
                <span class="desktop-trip-detail__participant-name">{{ p.name }}</span>
              </div>
              <div v-for="i in Math.min(seatsLeft, 3)" :key="'empty-' + i" class="desktop-trip-detail__participant">
                <div class="desktop-trip-detail__empty-slot">
                  <Plus :size="20" />
                </div>
                <span class="desktop-trip-detail__participant-name" style="color: var(--color-gray-400)">Свободно</span>
              </div>
            </div>
          </div>
        </div>

        <div class="desktop-trip-detail__sidebar">
          <div class="card desktop-trip-detail__sticky">
            <div>
              <div class="desktop-trip-detail__sidebar-title">Информация</div>
              <p class="desktop-trip-detail__sidebar-sub">Детали поездки и участие</p>
            </div>
            <div class="desktop-trip-detail__info-rows">
              <div v-for="(row, i) in sidebarRows" :key="i" class="desktop-trip-detail__info-row">
                <MapPin v-if="row.icon === 'mappin'" :size="13" class="icon--orange-dark" />
                <Navigation v-else-if="row.icon === 'nav'" :size="13" class="icon--orange-dark" />
                <Calendar v-else-if="row.icon === 'calendar'" :size="13" class="icon--orange-dark" />
                <Users v-else :size="13" class="icon--orange-dark" />
                <span class="desktop-trip-detail__info-label">{{ row.label }}</span>
                <span class="desktop-trip-detail__info-value">{{ row.value }}</span>
              </div>
            </div>
            <button class="btn btn--primary btn--primary-sm" @click="emit('join')">
              Запросить участие
            </button>
            <p class="footer-bar__hint">Организатор рассмотрит запрос в течение 24 ч</p>
            <div class="desktop-trip-detail__host-mini">
              <img :src="trip.host.avatar" alt="" class="desktop-trip-detail__host-mini-avatar">
              <div>
                <p class="desktop-trip-detail__host-mini-name">{{ trip.host.name }}</p>
                <p class="desktop-trip-detail__host-mini-role">Организатор</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
