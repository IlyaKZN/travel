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
  <div class="screen">
    <div class="profile__cover-wrap">
      <div class="profile__cover">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=288&fit=crop"
          alt="Обложка профиля"
          class="profile__cover-img"
        >
      </div>
      <button class="profile__settings">
        <Settings :size="17" class="icon--gray-darker" />
      </button>
      <div class="profile__avatar-wrap">
        <div class="profile__avatar-inner">
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop"
            alt="Алексей Ч."
            class="profile__avatar"
          >
          <div class="profile__verified">
            <Check :size="10" class="icon--white" :stroke-width="3" />
          </div>
        </div>
      </div>
    </div>
    <div class="profile__info">
      <div class="profile__info-row">
        <div>
          <h2 class="profile__name">Алексей Ч.</h2>
          <div class="profile__location">
            <MapPin :size="12" class="icon--orange" />
            <span class="profile__location-text">Москва · В сообществе с 2023</span>
          </div>
        </div>
        <button class="btn btn--secondary">Редактировать</button>
      </div>
      <div class="profile__stats">
        <div v-for="(stat, i) in stats" :key="i" class="profile__stat">
          <span class="profile__stat-value">{{ stat.value }}</span>
          <span class="profile__stat-label">{{ stat.label }}</span>
        </div>
      </div>
      <p class="profile__bio">
        Любитель приключений и выходных поездок 🌍 Всегда готов в дорогу или в новый город. Хозяин собаки 🐕
      </p>
      <div class="profile__badges">
        <span v-for="b in badges" :key="b" class="profile__badge">{{ b }}</span>
      </div>
    </div>
    <div class="profile__scroll">
      <div class="profile__section">
        <h3 class="profile__section-title">История поездок</h3>
        <div class="profile__history-list">
          <div
            v-for="(t, i) in pastTrips"
            :key="i"
            class="card card--shadow profile__history-item"
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
      <div class="profile__section">
        <h3 class="profile__section-title">Отзывы (48)</h3>
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
</template>
