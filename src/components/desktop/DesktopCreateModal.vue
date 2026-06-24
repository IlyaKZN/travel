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
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-8 cursor-pointer" @click="emit('close')">
    <div
      class="bg-background rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl cursor-default"
      @click.stop
    >
      <div class="flex items-center gap-3 px-6 py-4 bg-white border-b border-orange-50">
        <h2 class="text-xl font-extrabold text-gray-900 flex-1">Новая поездка</h2>
        <button class="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors" @click="emit('close')">
          <X :size="16" class="text-gray-600" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-5" style="scrollbar-width: thin">
        <div class="grid grid-cols-2 gap-5">
          <div class="space-y-4">
            <div class="bg-white rounded-2xl p-4 border border-orange-50" style="box-shadow: 0 1px 8px rgba(249,115,22,0.06)">
              <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Маршрут</p>
              <div class="space-y-2">
                <div class="flex items-center gap-3 bg-input-background rounded-xl px-3 py-2.5">
                  <div class="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <MapPin :size="13" class="text-orange-500" />
                  </div>
                  <input v-model="from" placeholder="Город отправления" class="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none">
                </div>
                <div class="flex justify-center">
                  <button class="w-7 h-7 rounded-lg bg-white border border-orange-100 flex items-center justify-center shadow-sm">
                    <ArrowUpDown :size="12" class="text-orange-500" />
                  </button>
                </div>
                <div class="flex items-center gap-3 bg-input-background rounded-xl px-3 py-2.5">
                  <div class="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <Navigation :size="13" class="text-white" />
                  </div>
                  <input v-model="to" placeholder="Город назначения" class="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none">
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-orange-50" style="box-shadow: 0 1px 8px rgba(249,115,22,0.06)">
              <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Дата и время начала</p>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center gap-2 bg-input-background rounded-xl px-3 py-2.5">
                  <Calendar :size="13" class="text-orange-400 flex-shrink-0" />
                  <input type="date" class="flex-1 bg-transparent text-xs text-gray-700 outline-none min-w-0">
                </div>
                <div class="flex items-center gap-2 bg-input-background rounded-xl px-3 py-2.5">
                  <Clock :size="13" class="text-orange-400 flex-shrink-0" />
                  <input type="time" class="flex-1 bg-transparent text-xs text-gray-700 outline-none min-w-0">
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-orange-50" style="box-shadow: 0 1px 8px rgba(249,115,22,0.06)">
              <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Дата и время окончания</p>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center gap-2 bg-input-background rounded-xl px-3 py-2.5">
                  <Calendar :size="13" class="text-orange-400 flex-shrink-0" />
                  <input type="date" class="flex-1 bg-transparent text-xs text-gray-700 outline-none min-w-0">
                </div>
                <div class="flex items-center gap-2 bg-input-background rounded-xl px-3 py-2.5">
                  <Clock :size="13" class="text-orange-400 flex-shrink-0" />
                  <input type="time" class="flex-1 bg-transparent text-xs text-gray-700 outline-none min-w-0">
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-orange-50" style="box-shadow: 0 1px 8px rgba(249,115,22,0.06)">
              <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Транспорт</p>
              <div class="grid grid-cols-4 gap-1.5">
                <button
                  v-for="t in TRANSPORT_FORM_OPTIONS"
                  :key="t.type"
                  class="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                  :class="transport === t.type ? 'bg-orange-500 text-white' : 'bg-secondary text-gray-600 hover:bg-orange-50'"
                  @click="transport = t.type"
                >
                  <component :is="transportIcon(t.type)" :size="16" />
                  <span>{{ t.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="bg-white rounded-2xl p-4 border border-orange-50" style="box-shadow: 0 1px 8px rgba(249,115,22,0.06)">
              <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Свободные места</p>
              <div class="flex items-center gap-3">
                <button class="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-extrabold text-xl" @click="seats = Math.max(1, seats - 1)">−</button>
                <div class="flex-1 text-center">
                  <span class="text-3xl font-extrabold text-gray-900">{{ seats }}</span>
                  <p class="text-xs text-gray-400">мест</p>
                </div>
                <button
                  class="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-extrabold text-xl"
                  style="box-shadow: 0 4px 8px rgba(249,115,22,0.35)"
                  @click="seats = Math.min(PARTICIPANTS_LIMIT, seats + 1)"
                >
                  +
                </button>
              </div>
              <div class="flex gap-1 mt-3 justify-center">
                <div v-for="i in seats" :key="i" class="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                  <User :size="12" class="text-orange-400" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-orange-50 flex-1" style="box-shadow: 0 1px 8px rgba(249,115,22,0.06)">
              <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Описание</p>
              <textarea
                v-model="desc"
                placeholder="Расскажите об атмосфере, ожиданиях и месте встречи..."
                rows="5"
                class="w-full bg-input-background rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none"
              />
              <p class="text-right text-xs text-gray-400 mt-1">{{ desc.length }}/280</p>
            </div>

            <div v-if="from || to" class="bg-orange-500 rounded-2xl p-4 text-white">
              <p class="text-[10px] font-extrabold uppercase tracking-widest opacity-70 mb-2">Превью</p>
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-lg">{{ from.slice(0, 3).toUpperCase() || '???' }}</span>
                <ArrowRight :size="16" class="opacity-70" />
                <span class="font-extrabold text-lg">{{ to.slice(0, 3).toUpperCase() || '???' }}</span>
              </div>
              <div class="flex items-center gap-3 mt-2 text-xs opacity-80">
                <span class="flex items-center gap-1">
                  <TransportIcon :type="transport" :size="11" />{{ transportLabel(transport) }}
                </span>
                <span class="flex items-center gap-1"><Users :size="11" />{{ seats }} мест</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 pb-6 pt-3 bg-white border-t border-orange-50">
        <button
          class="w-full py-3.5 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform"
          style="box-shadow: 0 8px 24px rgba(249,115,22,0.35)"
        >
          Опубликовать поездку ✈︎
        </button>
      </div>
    </div>
  </div>
</template>
