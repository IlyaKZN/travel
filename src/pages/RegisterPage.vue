<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { authApi } from '@/api'
import { ApiError } from '@/api/client'

const router = useRouter()
const contact = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  if (!contact.value || !password.value) {
    error.value = 'Заполните все обязательные поля'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Пароли не совпадают'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Пароль должен быть не менее 6 символов'
    return
  }

  loading.value = true
  try {
    await authApi.register(contact.value, password.value)
    router.push('/auth/verify')
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Ошибка регистрации'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-shell">
    <AppHeader show-auth title="Регистрация" show-back />

    <div class="page-container flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <form class="card w-full max-w-md p-6 sm:p-8" @submit.prevent="submit">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Регистрация</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Создайте аккаунт для начала путешествий</p>

        <div v-if="error" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{{ error }}</div>

        <div class="mt-6 space-y-4">
          <div>
            <label class="label-field">Телефон или почта</label>
            <input v-model="contact" type="text" class="input-field" placeholder="+7 (999) 123-45-67 или email@mail.ru" required />
          </div>
          <div>
            <label class="label-field">Пароль</label>
            <input v-model="password" type="password" class="input-field" placeholder="Минимум 6 символов" required />
          </div>
          <div>
            <label class="label-field">Повторите пароль</label>
            <input v-model="confirmPassword" type="password" class="input-field" placeholder="Повторите пароль" required />
          </div>
        </div>

        <button type="submit" class="btn-primary mt-6 w-full" :disabled="loading">
          {{ loading ? 'Отправка…' : 'Зарегистрироваться' }}
        </button>

        <p class="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Уже есть аккаунт?
          <RouterLink to="/auth/login" class="font-medium text-brand-600 hover:underline">Войти</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>
