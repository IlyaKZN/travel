<script setup lang="ts">
import { MapPin, Settings, Check } from 'lucide-vue-next'
import TransportIcon from '@/components/TransportIcon.vue'

const pastTrips = [
  { from: 'МСК', to: 'СПБ', date: '14 июн', transport: 'car' },
  { from: 'Сочи', to: 'Москва', date: '28 мая', transport: 'train' },
  { from: 'МСК', to: 'Тула', date: '10 мая', transport: 'bus' },
]

const reviews = [
  { name: 'Мария К.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', text: 'Алексей очень дружелюбный и пунктуальный! Отличная поездка — и музыка супер.', date: '14 июн' },
  { name: 'Дмитрий С.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', text: 'Отличный попутчик. Уважительный, весёлый — дорога пролетела незаметно.', date: '28 мая' },
]

const badges = ['Ранняя пташка', 'Автопутешественник']
const stats = [{ value: '48', label: 'Отзывов' }, { value: '23', label: 'Друзей' }]
</script>

<template>
  <div class="flex flex-col h-full bg-background">
    <div class="relative flex-shrink-0">
      <div class="h-36 bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=288&fit=crop"
          alt="Обложка профиля"
          class="w-full h-full object-cover opacity-50 mix-blend-overlay"
        >
      </div>
      <button class="absolute top-12 right-4 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow">
        <Settings :size="17" class="text-gray-700" />
      </button>
      <div class="absolute bottom-0 left-5 translate-y-1/2">
        <div class="relative">
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop"
            alt="Алексей Ч."
            class="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-lg"
          >
          <div class="absolute bottom-0 right-0 w-6 h-6 bg-emerald-400 rounded-lg border-2 border-white flex items-center justify-center">
            <Check :size="10" class="text-white" :stroke-width="3" />
          </div>
        </div>
      </div>
    </div>
    <div class="pt-14 px-5 pb-4 bg-white flex-shrink-0">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-xl font-extrabold text-gray-900">Алексей Ч.</h2>
          <div class="flex items-center gap-1.5 mt-0.5">
            <MapPin :size="12" class="text-orange-400" />
            <span class="text-xs text-gray-500">Москва · В сообществе с 2023</span>
          </div>
        </div>
        <button class="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-extrabold" style="box-shadow: 0 4px 12px rgba(249,115,22,0.35)">
          Редактировать
        </button>
      </div>
      <div class="grid grid-cols-2 gap-2 mt-4">
        <div v-for="(stat, i) in stats" :key="i" class="flex flex-col items-center py-3 bg-orange-50 rounded-2xl">
          <span class="text-base font-extrabold text-gray-900">{{ stat.value }}</span>
          <span class="text-[10px] text-gray-500 mt-0.5 font-medium">{{ stat.label }}</span>
        </div>
      </div>
      <p class="text-sm text-gray-600 mt-3 leading-relaxed">
        Любитель приключений и выходных поездок 🌍 Всегда готов в дорогу или в новый город. Хозяин собаки 🐕
      </p>
      <div class="flex gap-2 mt-3 flex-wrap">
        <span v-for="b in badges" :key="b" class="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg text-[11px] font-bold">{{ b }}</span>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto px-5 pb-24" style="scrollbar-width: none">
      <div class="pt-4 pb-2">
        <h3 class="font-extrabold text-gray-900 mb-3 text-sm">История поездок</h3>
        <div class="space-y-2">
          <div
            v-for="(t, i) in pastTrips"
            :key="i"
            class="bg-white rounded-2xl p-3.5 flex items-center gap-3 border border-orange-50"
            style="box-shadow: 0 1px 8px rgba(249,115,22,0.06)"
          >
            <div class="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <TransportIcon :type="t.transport" :size="15" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-800 truncate">{{ t.from }} → {{ t.to }}</p>
              <p class="text-xs text-gray-400">{{ t.date }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="pt-4">
        <h3 class="font-extrabold text-gray-900 mb-3 text-sm">Отзывы (48)</h3>
        <div class="space-y-3">
          <div
            v-for="(r, i) in reviews"
            :key="i"
            class="bg-white rounded-2xl p-4 border border-orange-50"
            style="box-shadow: 0 1px 8px rgba(249,115,22,0.06)"
          >
            <div class="flex items-center gap-2.5 mb-2">
              <img :src="r.avatar" :alt="r.name" class="w-9 h-9 rounded-full object-cover">
              <div class="flex-1">
                <p class="text-sm font-bold text-gray-800">{{ r.name }}</p>
                <p class="text-xs text-gray-400">{{ r.date }}</p>
              </div>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed">{{ r.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
