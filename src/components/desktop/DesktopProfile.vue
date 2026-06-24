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
  <div class="desktop-profile">
    <div class="desktop-profile__cover">
      <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&h=416&fit=crop" alt="Обложка" class="desktop-profile__cover-img">
      <div class="desktop-profile__cover-overlay" />
      <button class="desktop-profile__settings">
        <Settings :size="18" class="icon--gray-darker" />
      </button>
    </div>

    <div class="desktop-profile__content">
      <div class="desktop-profile__header">
        <div class="desktop-profile__avatar-wrap">
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop" alt="Алексей Ч." class="desktop-profile__avatar">
          <div class="desktop-profile__verified">
            <Check :size="12" class="icon--white" :stroke-width="3" />
          </div>
        </div>
        <div class="desktop-profile__info">
          <div class="desktop-profile__info-row">
            <div>
              <h1 class="desktop-profile__name">Алексей Ч.</h1>
              <div class="desktop-profile__location">
                <MapPin :size="14" class="icon--orange" />
                <span class="desktop-profile__location-text">Москва · В сообществе с 2023</span>
              </div>
              <p class="desktop-profile__desc">
                Любитель приключений и выходных поездок 🌍 Всегда готов в дорогу или в новый город. Хозяин собаки 🐕
              </p>
              <div class="desktop-profile__badges">
                <span v-for="b in badges" :key="b" class="desktop-profile__badge">{{ b }}</span>
              </div>
            </div>
            <div class="desktop-profile__actions">
              <button class="desktop-profile__btn-outline">Поделиться</button>
              <button class="desktop-profile__btn-primary">Редактировать</button>
            </div>
          </div>
        </div>
      </div>

      <div class="desktop-profile__stats">
        <div v-for="(stat, i) in stats" :key="i" class="card card--shadow-lg desktop-profile__stat">
          <div class="desktop-profile__stat-icon">
            <component :is="stat.icon" :size="18" class="icon--orange-dark" />
          </div>
          <div>
            <div class="desktop-profile__stat-value">{{ stat.value }}</div>
            <div class="desktop-profile__stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <div class="desktop-profile__grid">
        <div>
          <h3 class="desktop-profile__column-title">История поездок</h3>
          <div class="profile__history-list">
            <div
              v-for="(t, i) in pastTrips"
              :key="i"
              class="card card--shadow profile__history-item desktop-profile__history-item"
            >
              <div class="profile__history-icon">
                <TransportIcon :type="t.transport" :size="15" />
              </div>
              <div class="profile__history-info">
                <p class="profile__history-route truncate">{{ t.from }} → {{ t.to }}</p>
                <p class="profile__history-date">{{ t.date }}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 class="desktop-profile__column-title">Мои поездки</h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem">
            <div
              v-for="trip in upcomingTrips"
              :key="trip.id"
              class="card card--shadow desktop-profile__trip-card"
            >
              <div class="desktop-profile__trip-route">
                <span class="desktop-profile__trip-city">{{ trip.fromShort }}</span>
                <ArrowRight :size="14" class="icon--orange" />
                <span class="desktop-profile__trip-city">{{ trip.toShort }}</span>
              </div>
              <div class="desktop-profile__trip-meta">
                <Calendar :size="11" class="icon--orange" />{{ trip.date }}
                <Clock :size="11" class="icon--orange" style="margin-left: 0.25rem" />{{ trip.time }}
              </div>
            </div>
            <button class="desktop-profile__create-btn">Создать поездку</button>
          </div>
        </div>

        <div>
          <h3 class="desktop-profile__column-title">Отзывы (48)</h3>
          <div class="profile__reviews">
            <div
              v-for="(r, i) in reviews"
              :key="i"
              class="card card--shadow profile__review"
            >
              <div class="profile__review-header">
                <img :src="r.avatar" :alt="r.name" class="profile__review-avatar">
                <div>
                  <p class="profile__review-name">{{ r.name }}</p>
                  <p class="profile__review-date">{{ r.date }}</p>
                </div>
              </div>
              <p class="profile__review-text">{{ r.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
