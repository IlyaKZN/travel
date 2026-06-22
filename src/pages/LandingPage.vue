<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const features = [
  { icon: '🗺️', title: 'Авторские туры', desc: 'Создавайте и находите уникальные маршруты с опытными гидами' },
  { icon: '🚗', title: 'Поездки', desc: 'Присоединяйтесь к поездкам или организуйте свою компанию' },
  { icon: '📝', title: 'Блог путешественника', desc: 'Делитесь впечатлениями, фото и историями из поездок' },
  { icon: '👥', title: 'Сообщество', desc: 'Подписывайтесь на путешественников и следите за их приключениями' },
]
</script>

<template>
  <div class="min-h-screen bg-warm-50 dark:bg-stone-950">
    <AppHeader show-auth />

    <section class="hero-sunny">
      <div class="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-300/40 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-20 left-1/4 h-72 w-72 rounded-full bg-white/20 blur-3xl" />

      <div class="page-container relative py-16 sm:py-24 lg:py-32">
        <div class="mx-auto max-w-3xl text-center">
          <h1 class="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Путешествуйте вместе с&nbsp;Travels
          </h1>
          <p class="mt-4 text-base text-sky-50 sm:mt-6 sm:text-lg">
            Платформа для авторских туров, совместных поездок и блога путешественника.
            Находите единомышленников и открывайте новые места.
          </p>
          <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <RouterLink to="/register" class="btn-primary w-full sm:w-auto !bg-white !text-brand-800 !shadow-md hover:!bg-warm-50">
              Регистрация
            </RouterLink>
            <RouterLink to="/login" class="btn-secondary w-full sm:w-auto !border-white/40 !bg-white/10 !text-white hover:!bg-white/20">
              Войти
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <section class="page-container py-12 sm:py-20">
      <h2 class="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">Возможности платформы</h2>
      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="f in features" :key="f.title" class="card p-6 text-center">
          <div class="text-4xl">{{ f.icon }}</div>
          <h3 class="mt-4 font-semibold text-stone-900 dark:text-stone-100">{{ f.title }}</h3>
          <p class="mt-2 text-sm text-stone-500 dark:text-stone-400">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <section class="border-t border-stone-200 bg-white py-12 dark:border-stone-700 dark:bg-stone-900 sm:py-16">
      <div class="page-container text-center">
        <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">Готовы к приключениям?</h2>
        <p class="mt-2 text-stone-500 dark:text-stone-400">Присоединяйтесь к сообществу путешественников уже сегодня</p>
        <RouterLink to="/register" class="btn-primary mt-6 inline-flex">Создать аккаунт</RouterLink>
      </div>
    </section>
  </div>
</template>
