<script setup lang="ts">
import { ref } from 'vue'
import {
  MapPin, ArrowUpDown, Navigation, Calendar, Clock,
  Car, Train, Bus, Plane, User, X, ArrowRight, Users,
} from 'lucide-vue-next'
import { TRANSPORT_FORM_OPTIONS, transportLabel } from '@/lib/locale'
import type { TransportType } from '@/types'
import { PARTICIPANTS_LIMIT } from '@/types'
import TransportIcon from '@/components/TransportIcon.vue'

const emit = defineEmits<{
  close: []
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
  <div class="desktop-modal" @click="emit('close')">
    <div class="desktop-modal__dialog" @click.stop>
      <div class="desktop-modal__header">
        <h2 class="desktop-modal__title">Новая поездка</h2>
        <button class="desktop-modal__close" @click="emit('close')">
          <X :size="16" class="icon--gray-dark" />
        </button>
      </div>

      <div class="desktop-modal__body">
        <div class="desktop-modal__grid">
          <div class="desktop-modal__column">
            <div class="card card--shadow desktop-modal__card">
              <p class="section-label">Маршрут</p>
              <div class="desktop-modal__route">
                <div class="input-row desktop-modal__input-row--sm">
                  <div class="input-row__icon input-row__icon--muted">
                    <MapPin :size="13" />
                  </div>
                  <input v-model="from" placeholder="Город отправления" class="input-row__field">
                </div>
                <div style="display: flex; justify-content: center">
                  <button class="create-trip__swap-btn" style="width: 1.75rem; height: 1.75rem; border-radius: 0.5rem">
                    <ArrowUpDown :size="12" class="icon--orange-dark" />
                  </button>
                </div>
                <div class="input-row desktop-modal__input-row--sm">
                  <div class="input-row__icon input-row__icon--primary">
                    <Navigation :size="13" />
                  </div>
                  <input v-model="to" placeholder="Город назначения" class="input-row__field">
                </div>
              </div>
            </div>

            <div class="card card--shadow desktop-modal__card">
              <p class="section-label">Дата и время начала</p>
              <div class="create-trip__grid-2" style="gap: 0.5rem">
                <div class="input-row desktop-modal__input-row--sm">
                  <Calendar :size="13" class="icon--orange" />
                  <input type="date" class="input-row__field input-row__field--xs">
                </div>
                <div class="input-row desktop-modal__input-row--sm">
                  <Clock :size="13" class="icon--orange" />
                  <input type="time" class="input-row__field input-row__field--xs">
                </div>
              </div>
            </div>

            <div class="card card--shadow desktop-modal__card">
              <p class="section-label">Дата и время окончания</p>
              <div class="create-trip__grid-2" style="gap: 0.5rem">
                <div class="input-row desktop-modal__input-row--sm">
                  <Calendar :size="13" class="icon--orange" />
                  <input type="date" class="input-row__field input-row__field--xs">
                </div>
                <div class="input-row desktop-modal__input-row--sm">
                  <Clock :size="13" class="icon--orange" />
                  <input type="time" class="input-row__field input-row__field--xs">
                </div>
              </div>
            </div>

            <div class="card card--shadow desktop-modal__card">
              <p class="section-label">Транспорт</p>
              <div class="desktop-modal__transport-grid">
                <button
                  v-for="t in TRANSPORT_FORM_OPTIONS"
                  :key="t.type"
                  class="transport-option transport-option--hover desktop-modal__transport-btn"
                  :class="{ 'transport-option--active': transport === t.type }"
                  @click="transport = t.type"
                >
                  <component :is="transportIcon(t.type)" :size="16" />
                  <span>{{ t.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="desktop-modal__column">
            <div class="card card--shadow desktop-modal__card">
              <p class="section-label">Свободные места</p>
              <div class="create-trip__seats" style="gap: 0.75rem">
                <button class="create-trip__seats-btn desktop-modal__seats-btn create-trip__seats-btn--minus" @click="seats = Math.max(1, seats - 1)">−</button>
                <div class="create-trip__seats-value">
                  <span class="create-trip__seats-count desktop-modal__seats-count">{{ seats }}</span>
                  <p class="create-trip__seats-label">мест</p>
                </div>
                <button class="create-trip__seats-btn desktop-modal__seats-btn create-trip__seats-btn--plus" @click="seats = Math.min(PARTICIPANTS_LIMIT, seats + 1)">+</button>
              </div>
              <div class="create-trip__seats-icons" style="margin-top: 0.75rem">
                <div v-for="i in seats" :key="i" class="create-trip__seat-icon desktop-modal__seat-icon">
                  <User :size="12" class="icon--orange" />
                </div>
              </div>
            </div>

            <div class="card card--shadow desktop-modal__card" style="flex: 1">
              <p class="section-label">Описание</p>
              <textarea
                v-model="desc"
                placeholder="Расскажите об атмосфере, ожиданиях и месте встречи..."
                rows="5"
                class="create-trip__textarea"
                style="border-radius: 0.75rem; padding: 0.625rem 0.75rem"
              />
              <p class="create-trip__char-count">{{ desc.length }}/280</p>
            </div>

            <div v-if="from || to" class="desktop-modal__preview">
              <p class="desktop-modal__preview-label">Превью</p>
              <div class="desktop-modal__preview-route">
                <span class="desktop-modal__preview-city">{{ from.slice(0, 3).toUpperCase() || '???' }}</span>
                <ArrowRight :size="16" style="opacity: 0.7" />
                <span class="desktop-modal__preview-city">{{ to.slice(0, 3).toUpperCase() || '???' }}</span>
              </div>
              <div class="desktop-modal__preview-meta">
                <span class="desktop-modal__preview-meta-item">
                  <TransportIcon :type="transport" :size="11" />{{ transportLabel(transport) }}
                </span>
                <span class="desktop-modal__preview-meta-item"><Users :size="11" />{{ seats }} мест</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="desktop-modal__footer">
        <button class="btn btn--primary btn--primary-sm">
          Опубликовать поездку ✈︎
        </button>
      </div>
    </div>
  </div>
</template>
