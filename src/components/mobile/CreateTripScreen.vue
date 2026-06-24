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
  <div class="flex flex-col h-full bg-background">
    <div class="flex items-center gap-3 px-5 pt-5 pb-5 bg-background">
      <button
        class="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-orange-50 shadow-sm"
        @click="emit('back')"
      >
        <ChevronLeft :size="20" class="text-gray-700" />
      </button>
      <h1 class="text-xl font-extrabold text-gray-900">Спланировать поездку</h1>
    </div>
    <div class="flex-1 overflow-y-auto px-5 pb-28 space-y-4" style="scrollbar-width: none">
      <div class="bg-white rounded-3xl p-4 border border-orange-50" style="box-shadow: 0 2px 12px rgba(249,115,22,0.07)">
        <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Маршрут</p>
        <div class="space-y-2">
          <div class="flex items-center gap-3 bg-input-background rounded-2xl px-4 py-3">
            <div class="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <MapPin :size="15" class="text-orange-500" />
            </div>
            <input
              v-model="from"
              placeholder="Город отправления"
              class="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none font-medium"
            >
          </div>
          <div class="flex justify-center -my-0.5 relative z-10">
            <button class="w-8 h-8 rounded-xl bg-white border border-orange-100 flex items-center justify-center shadow-sm">
              <ArrowUpDown :size="14" class="text-orange-500" />
            </button>
          </div>
          <div class="flex items-center gap-3 bg-input-background rounded-2xl px-4 py-3">
            <div class="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Navigation :size="15" class="text-white" />
            </div>
            <input
              v-model="to"
              placeholder="Город назначения"
              class="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none font-medium"
            >
          </div>
        </div>
      </div>
      <div class="bg-white rounded-3xl p-4 border border-orange-50" style="box-shadow: 0 2px 12px rgba(249,115,22,0.07)">
        <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Дата и время начала</p>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex items-center gap-2 bg-input-background rounded-2xl px-4 py-3">
            <Calendar :size="15" class="text-orange-400 flex-shrink-0" />
            <input type="date" class="flex-1 bg-transparent text-xs text-gray-700 outline-none font-medium min-w-0">
          </div>
          <div class="flex items-center gap-2 bg-input-background rounded-2xl px-4 py-3">
            <Clock :size="15" class="text-orange-400 flex-shrink-0" />
            <input type="time" class="flex-1 bg-transparent text-xs text-gray-700 outline-none font-medium min-w-0">
          </div>
        </div>
      </div>
      <div class="bg-white rounded-3xl p-4 border border-orange-50" style="box-shadow: 0 2px 12px rgba(249,115,22,0.07)">
        <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Дата и время окончания</p>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex items-center gap-2 bg-input-background rounded-2xl px-4 py-3">
            <Calendar :size="15" class="text-orange-400 flex-shrink-0" />
            <input type="date" class="flex-1 bg-transparent text-xs text-gray-700 outline-none font-medium min-w-0">
          </div>
          <div class="flex items-center gap-2 bg-input-background rounded-2xl px-4 py-3">
            <Clock :size="15" class="text-orange-400 flex-shrink-0" />
            <input type="time" class="flex-1 bg-transparent text-xs text-gray-700 outline-none font-medium min-w-0">
          </div>
        </div>
      </div>
      <div class="bg-white rounded-3xl p-4 border border-orange-50" style="box-shadow: 0 2px 12px rgba(249,115,22,0.07)">
        <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Тип транспорта</p>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="t in TRANSPORT_FORM_OPTIONS"
            :key="t.type"
            class="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl transition-all font-bold text-xs"
            :class="transport === t.type ? 'bg-orange-500 text-white' : 'bg-secondary text-gray-600'"
            :style="transport === t.type ? { boxShadow: '0 4px 12px rgba(249,115,22,0.35)' } : {}"
            @click="transport = t.type"
          >
            <component :is="transportIcon(t.type)" :size="20" />
            <span>{{ t.label }}</span>
          </button>
        </div>
      </div>
      <div class="bg-white rounded-3xl p-4 border border-orange-50" style="box-shadow: 0 2px 12px rgba(249,115,22,0.07)">
        <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4">Свободные места</p>
        <div class="flex items-center gap-4">
          <button
            class="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-extrabold text-2xl"
            @click="seats = Math.max(1, seats - 1)"
          >
            −
          </button>
          <div class="flex-1 text-center">
            <span class="text-4xl font-extrabold text-gray-900">{{ seats }}</span>
            <p class="text-xs text-gray-400 mt-0.5">мест для попутчиков</p>
          </div>
          <button
            class="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-extrabold text-2xl"
            style="box-shadow: 0 4px 12px rgba(249,115,22,0.35)"
            @click="seats = Math.min(PARTICIPANTS_LIMIT, seats + 1)"
          >
            +
          </button>
        </div>
        <div class="flex gap-1.5 mt-4 justify-center">
          <div v-for="i in seats" :key="i" class="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
            <User :size="14" class="text-orange-400" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-3xl p-4 border border-orange-50" style="box-shadow: 0 2px 12px rgba(249,115,22,0.07)">
        <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Описание</p>
        <textarea
          v-model="desc"
          placeholder="Расскажите об атмосфере поездки, ожиданиях и что взять с собой..."
          rows="4"
          class="w-full bg-input-background rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none"
        />
        <p class="text-right text-xs text-gray-400 mt-1">{{ desc.length }}/280</p>
      </div>
    </div>
    <div class="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-white border-t border-orange-50">
      <button
        class="w-full py-4 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform"
        style="box-shadow: 0 8px 24px rgba(249,115,22,0.35)"
      >
        Создать поездку ✈︎
      </button>
    </div>
  </div>
</template>
