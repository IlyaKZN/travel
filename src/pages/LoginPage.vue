<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useStore } from '@/composables/useStore'
import { ApiError } from '@/api/client'

const router = useRouter()
const { login } = useStore()

const contact = ref('')
const password = ref('')
const remember = ref(false)
const error = ref('')
const loading = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('travels_remember')
  if (saved) {
    const data = JSON.parse(saved)
    contact.value = data.contact || ''
    password.value = data.password || ''
    remember.value = true
  }
})

async function submit() {
  error.value = ''
  loading.value = true
  try {
    if (remember.value) {
      localStorage.setItem('travels_remember', JSON.stringify({ contact: contact.value, password: password.value }))
    } else {
      localStorage.removeItem('travels_remember')
    }
    await login(contact.value, password.value)
    router.push('/profile')
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Ошибка входа'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-shell">
    <AppHeader show-auth title="Авторизация" show-back />

    <div class="page-container flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <form class="card w-full max-w-md p-6 sm:p-8" @submit.prevent="submit">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Вход</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Войдите в свой аккаунт</p>

        <div v-if="error" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{{ error }}</div>

        <div class="mt-6 space-y-4">
          <div>
            <label class="label-field">Телефон или почта</label>
            <input v-model="contact" type="text" class="input-field" placeholder="alex@travels.ru" required />
          </div>
          <div>
            <label class="label-field">Пароль</label>
            <input v-model="password" type="password" class="input-field" required />
          </div>
          <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input v-model="remember" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            Запомнить почту и пароль
          </label>
        </div>

        <button type="submit" class="btn-primary mt-6 w-full" :disabled="loading">
          {{ loading ? 'Вход…' : 'Войти' }}
        </button>

        <p class="mt-3 text-center text-xs text-stone-400">Демо: alex@travels.ru / demo1234</p>

        <div class="mt-4 flex flex-col items-center gap-2 text-sm">
          <RouterLink to="/reset-password" class="text-brand-600 hover:underline">Забыли пароль?</RouterLink>
          <p class="text-slate-500 dark:text-slate-400">
            Нет аккаунта?
            <RouterLink to="/register" class="font-medium text-brand-600 hover:underline">Зарегистрироваться</RouterLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>
