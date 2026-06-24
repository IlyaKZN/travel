<script setup lang="ts">
import { ref } from 'vue'
import {
  MapPin, ArrowUpDown, Navigation, Calendar, Clock,
  Car, Train, Bus, Plane, User, ChevronLeft,
} from 'lucide-vue-next'
import { TRANSPORT_FORM_OPTIONS } from '@/lib/locale'
import type { TransportType } from '@/types'
import { PARTICIPANTS_LIMIT } from '@/types'

const emit = defineEmits<{
  back: []
}>()

const from = ref('')
const to = ref('')
const transport = ref<TransportType>('car')
const seats = ref(3)
const desc = ref('')

function transportIcon(type: TransportType) {
  if (type === 'train') return Train
  if (type === 'bus') return Bus
  if (type === 'plane') return Plane
  return Car
}
</script>

<template>
  <div class="screen">
    <div class="create-trip__header">
      <button class="btn btn--icon btn--back" @click="emit('back')">
        <ChevronLeft :size="20" class="icon--gray-darker" />
      </button>
      <h1 class="create-trip__title">Спланировать поездку</h1>
    </div>
    <div class="create-trip__scroll">
      <div class="card card--shadow-lg create-trip__card">
        <p class="section-label">Маршрут</p>
        <div class="create-trip__route">
          <div class="input-row">
            <div class="input-row__icon input-row__icon--muted">
              <MapPin :size="15" />
            </div>
            <input
              v-model="from"
              placeholder="Город отправления"
              class="input-row__field"
            >
          </div>
          <div class="create-trip__swap-row">
            <button class="create-trip__swap-btn">
              <ArrowUpDown :size="14" class="icon--orange-dark" />
            </button>
          </div>
          <div class="input-row">
            <div class="input-row__icon input-row__icon--primary">
              <Navigation :size="15" />
            </div>
            <input
              v-model="to"
              placeholder="Город назначения"
              class="input-row__field"
            >
          </div>
        </div>
      </div>
      <div class="card card--shadow-lg create-trip__card">
        <p class="section-label">Дата и время начала</p>
        <div class="create-trip__grid-2">
          <div class="input-row">
            <Calendar :size="15" class="icon--orange" />
            <input type="date" class="input-row__field input-row__field--xs">
          </div>
          <div class="input-row">
            <Clock :size="15" class="icon--orange" />
            <input type="time" class="input-row__field input-row__field--xs">
          </div>
        </div>
      </div>
      <div class="card card--shadow-lg create-trip__card">
        <p class="section-label">Дата и время окончания</p>
        <div class="create-trip__grid-2">
          <div class="input-row">
            <Calendar :size="15" class="icon--orange" />
            <input type="date" class="input-row__field input-row__field--xs">
          </div>
          <div class="input-row">
            <Clock :size="15" class="icon--orange" />
            <input type="time" class="input-row__field input-row__field--xs">
          </div>
        </div>
      </div>
      <div class="card card--shadow-lg create-trip__card">
        <p class="section-label">Тип транспорта</p>
        <div class="create-trip__grid-4">
          <button
            v-for="t in TRANSPORT_FORM_OPTIONS"
            :key="t.type"
            class="transport-option"
            :class="{ 'transport-option--active': transport === t.type }"
            @click="transport = t.type"
          >
            <component :is="transportIcon(t.type)" :size="20" />
            <span>{{ t.label }}</span>
          </button>
        </div>
      </div>
      <div class="card card--shadow-lg create-trip__card">
        <p class="section-label" style="margin-bottom: 1rem">Свободные места</p>
        <div class="create-trip__seats">
          <button
            class="create-trip__seats-btn create-trip__seats-btn--minus"
            @click="seats = Math.max(1, seats - 1)"
          >
            −
          </button>
          <div class="create-trip__seats-value">
            <span class="create-trip__seats-count">{{ seats }}</span>
            <p class="create-trip__seats-label">мест для попутчиков</p>
          </div>
          <button
            class="create-trip__seats-btn create-trip__seats-btn--plus"
            @click="seats = Math.min(PARTICIPANTS_LIMIT, seats + 1)"
          >
            +
          </button>
        </div>
        <div class="create-trip__seats-icons">
          <div v-for="i in seats" :key="i" class="create-trip__seat-icon">
            <User :size="14" class="icon--orange" />
          </div>
        </div>
      </div>
      <div class="card card--shadow-lg create-trip__card">
        <p class="section-label">Описание</p>
        <textarea
          v-model="desc"
          placeholder="Расскажите об атмосфере поездки, ожиданиях и что взять с собой..."
          rows="4"
          class="create-trip__textarea"
        />
        <p class="create-trip__char-count">{{ desc.length }}/280</p>
      </div>
    </div>
    <div class="create-trip__footer">
      <button class="btn btn--primary">
        Создать поездку ✈︎
      </button>
    </div>
  </div>
</template>
