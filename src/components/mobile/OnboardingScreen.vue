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
  <div class="onboarding">
    <div class="onboarding__hero">
      <img
        src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&h=700&fit=crop"
        alt="Друзья в дорожном путешествии"
        class="onboarding__hero-img"
      >
      <div class="onboarding__hero-overlay" />
      <div class="onboarding__logo">
        <div class="onboarding__logo-icon">
          <Navigation :size="19" class="icon--white" />
        </div>
        <span class="onboarding__logo-text">waymate</span>
      </div>
      <div class="onboarding__social">
        <div class="onboarding__avatars">
          <img
            v-for="(id, i) in avatars"
            :key="i"
            :src="`https://images.unsplash.com/${id}?w=48&h=48&fit=crop`"
            class="onboarding__avatar"
            alt=""
          >
        </div>
        <div>
          <p class="onboarding__social-title">2 400+ путешественников</p>
          <p class="onboarding__social-sub">присоединились за неделю</p>
        </div>
      </div>
    </div>
    <div class="onboarding__content">
      <h1 class="onboarding__title">
        Найдите <span class="onboarding__title-accent">компанию</span> для каждого путешествия
      </h1>
      <p class="onboarding__intro">
        Знакомьтесь с попутчиками, делите поездки и превращайте каждую дорогу в яркое воспоминание.
      </p>
      <div class="onboarding__features">
        <div v-for="(item, i) in features" :key="i" class="onboarding__feature">
          <div class="onboarding__feature-icon">
            <Zap v-if="i < 2" :size="15" />
            <MessageSquare v-else :size="15" />
          </div>
          <span class="onboarding__feature-text">{{ item.text }}</span>
        </div>
      </div>
      <button class="btn btn--primary" @click="emit('start')">
        Начать — бесплатно
      </button>
      <p class="onboarding__login">
        Уже есть аккаунт? <span class="onboarding__login-link">Войти</span>
      </p>
    </div>
  </div>
</template>
