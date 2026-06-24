<script setup lang="ts">
import { Navigation, Zap, MessageSquare } from 'lucide-vue-next'

const emit = defineEmits<{
  start: []
}>()

const avatars = [
  'photo-1494790108377-be9c29b29330',
  'photo-1507003211169-0a1dd7228f2d',
  'photo-1534528741775-53994a69daeb',
]

const features = [
  { text: 'Проверенные профили участников' },
  { text: 'Присоединяйтесь к поездке в 2 нажатия' },
  { text: 'Групповой чат для каждой поездки' },
]
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="relative flex-[1.2] overflow-hidden rounded-b-[2.5rem] bg-orange-200">
      <img
        src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&h=700&fit=crop"
        alt="Друзья в дорожном путешествии"
        class="w-full h-full object-cover"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
      <div class="absolute top-6 left-6 flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
          <Navigation :size="19" class="text-white" />
        </div>
        <span class="text-white font-extrabold text-xl tracking-tight">waymate</span>
      </div>
      <div class="absolute bottom-5 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-3.5 flex items-center gap-3 shadow-xl">
        <div class="flex -space-x-2">
          <img
            v-for="(id, i) in avatars"
            :key="i"
            :src="`https://images.unsplash.com/${id}?w=48&h=48&fit=crop`"
            class="w-8 h-8 rounded-full border-2 border-white"
            alt=""
          >
        </div>
        <div>
          <p class="text-xs font-bold text-gray-800">2 400+ путешественников</p>
          <p class="text-xs text-gray-500">присоединились за неделю</p>
        </div>
      </div>
    </div>
    <div class="px-6 pt-7 pb-8 bg-background">
      <h1 class="text-[1.65rem] font-extrabold text-gray-900 leading-tight mb-2.5">
        Найдите <span class="text-orange-500">компанию</span> для каждого путешествия
      </h1>
      <p class="text-gray-500 text-sm mb-6 leading-relaxed">
        Знакомьтесь с попутчиками, делите поездки и превращайте каждую дорогу в яркое воспоминание.
      </p>
      <div class="space-y-2.5 mb-7">
        <div v-for="(item, i) in features" :key="i" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center flex-shrink-0">
            <Zap v-if="i < 2" :size="15" />
            <MessageSquare v-else :size="15" />
          </div>
          <span class="text-sm text-gray-700 font-medium">{{ item.text }}</span>
        </div>
      </div>
      <button
        class="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-base active:scale-95 transition-transform"
        style="box-shadow: 0 8px 24px rgba(249,115,22,0.35)"
        @click="emit('start')"
      >
        Начать — бесплатно
      </button>
      <p class="text-center text-xs text-gray-400 mt-4">
        Уже есть аккаунт? <span class="text-orange-500 font-medium cursor-pointer">Войти</span>
      </p>
    </div>
  </div>
</template>
