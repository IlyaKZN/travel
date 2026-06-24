<script setup lang="ts">
import { MapPin, Settings, Check, MessageSquare, Users, ArrowRight, Calendar, Clock } from 'lucide-vue-next'
import { TRIPS } from '@/lib/mockData'
import TransportIcon from '@/components/TransportIcon.vue'

const pastTrips = [
  { from: 'МСК', to: 'СПБ', date: '14 июн', transport: 'car' },
  { from: 'Сочи', to: 'Москва', date: '28 мая', transport: 'train' },
  { from: 'МСК', to: 'Тула', date: '10 мая', transport: 'bus' },
  { from: 'СПБ', to: 'Карелия', date: '22 апр', transport: 'train' },
  { from: 'МСК', to: 'Казань', date: '5 апр', transport: 'car' },
]

const reviews = [
  { name: 'Мария К.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', text: 'Алексей очень дружелюбный и пунктуальный! Отличная поездка — и музыка супер.', date: '14 июн' },
  { name: 'Дмитрий С.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', text: 'Отличный попутчик. Уважительный, весёлый — дорога пролетела незаметно.', date: '28 мая' },
  { name: 'Елена В.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop', text: 'Очень организованный, хорошо общался до поездки. Обязательно поеду с Алексеем снова!', date: '10 мая' },
]

const upcomingTrips = TRIPS.slice(0, 2)
const badges = ['Ранняя пташка', 'Автопутешественник']
const stats = [
  { value: '48', label: 'Отзывов', icon: MessageSquare },
  { value: '23', label: 'Друзей', icon: Users },
]
</script>

<template>
  <div class="flex-1 overflow-y-auto" style="scrollbar-width: thin">
    <div class="relative h-52 bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden">
      <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&h=416&fit=crop" alt="Обложка" class="w-full h-full object-cover opacity-50 mix-blend-overlay">
      <div class="absolute inset-0 bg-gradient-to-r from-orange-600/40 to-transparent" />
      <button class="absolute top-6 right-6 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow">
        <Settings :size="18" class="text-gray-700" />
      </button>
    </div>

    <div class="px-10 pb-12">
      <div class="flex items-end gap-6 -mt-12 mb-6">
        <div class="relative flex-shrink-0">
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop" alt="Алексей Ч." class="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-xl">
          <div class="absolute bottom-1 right-1 w-7 h-7 bg-emerald-400 rounded-xl border-2 border-white flex items-center justify-center">
            <Check :size="12" class="text-white" :stroke-width="3" />
          </div>
        </div>
        <div class="flex-1 pb-2">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-3xl font-extrabold text-gray-900">Алексей Ч.</h1>
              <div class="flex items-center gap-2 mt-1">
                <MapPin :size="14" class="text-orange-400" />
                <span class="text-gray-500 text-sm">Москва · В сообществе с 2023</span>
              </div>
              <p class="text-gray-600 text-sm mt-2 max-w-lg">
                Любитель приключений и выходных поездок 🌍 Всегда готов в дорогу или в новый город. Хозяин собаки 🐕
              </p>
              <div class="flex gap-2 mt-3 flex-wrap">
                <span v-for="b in badges" :key="b" class="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold">{{ b }}</span>
              </div>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button class="px-4 py-2.5 border border-orange-200 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors">Поделиться</button>
              <button class="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors" style="box-shadow: 0 4px 12px rgba(249,115,22,0.35)">Редактировать</button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-8">
        <div v-for="(stat, i) in stats" :key="i" class="bg-white rounded-2xl p-4 flex items-center gap-4 border border-orange-50" style="box-shadow: 0 2px 12px rgba(249,115,22,0.07)">
          <div class="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <component :is="stat.icon" :size="18" class="text-orange-500" />
          </div>
          <div>
            <div class="text-2xl font-extrabold text-gray-900">{{ stat.value }}</div>
            <div class="text-xs text-gray-400 font-medium">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <div>
          <h3 class="font-extrabold text-gray-900 mb-4 text-base">История поездок</h3>
          <div class="space-y-2">
            <div
              v-for="(t, i) in pastTrips"
              :key="i"
              class="bg-white rounded-2xl p-3.5 flex items-center gap-3 border border-orange-50 hover:shadow-sm transition-shadow"
              style="box-shadow: 0 1px 8px rgba(249,115,22,0.05)"
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

        <div>
          <h3 class="font-extrabold text-gray-900 mb-4 text-base">Мои поездки</h3>
          <div class="space-y-3">
            <div
              v-for="trip in upcomingTrips"
              :key="trip.id"
              class="bg-white rounded-2xl overflow-hidden border border-orange-50 p-3"
              style="box-shadow: 0 1px 8px rgba(249,115,22,0.06)"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-extrabold text-gray-900">{{ trip.fromShort }}</span>
                <ArrowRight :size="14" class="text-orange-400" />
                <span class="text-sm font-extrabold text-gray-900">{{ trip.toShort }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <Calendar :size="11" class="text-orange-400" />{{ trip.date }}
                <Clock :size="11" class="text-orange-400 ml-1" />{{ trip.time }}
              </div>
            </div>
            <button class="w-full py-2.5 text-sm font-bold text-orange-500 border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors">
              Создать поездку
            </button>
          </div>
        </div>

        <div>
          <h3 class="font-extrabold text-gray-900 mb-4 text-base">Отзывы (48)</h3>
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
  </div>
</template>
