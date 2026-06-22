<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { authApi } from '@/api'
import { ApiError, getPendingContact } from '@/api/client'
import { useStore } from '@/composables/useStore'

const router = useRouter()
const { init } = useStore()

const contact = ref('')
const code = ref('')
const error = ref('')
const loading = ref(false)

onMounted(() => {
  contact.value = getPendingContact() || ''
  if (!contact.value) router.replace('/register')
})

async function submit() {
  error.value = ''
  if (code.value.length < 4) {
    error.value = 'Введите код подтверждения (минимум 4 символа)'
    return
  }

  loading.value = true
  try {
    const res = await authApi.confirm(contact.value, code.value)
    await init()
    router.push(res.needsProfile ? '/create-profile' : '/profile')
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Ошибка подтверждения'
  } finally {
    loading.value = false
  }
}

async function resend() {
  error.value = ''
  try {
    await authApi.resendCode(contact.value)
    error.value = 'Код отправлен повторно (смотрите консоль сервера)'
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Не удалось отправить код'
  }
}
</script>

<template>
  <div class="page-shell">
    <AppHeader show-auth title="Подтверждение" show-back />

    <div class="page-container flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <form class="card w-full max-w-md p-6 sm:p-8" @submit.prevent="submit">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Подтверждение</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Код отправлен на {{ contact }}. Введите его ниже.
        </p>

        <div v-if="error" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{{ error }}</div>

        <div class="mt-6">
          <label class="label-field">Код подтверждения</label>
          <input
            v-model="code"
            type="text"
            class="input-field text-center text-lg tracking-widest"
            placeholder="• • • • • •"
            maxlength="6"
            required
          />
        </div>

        <button type="submit" class="btn-primary mt-6 w-full" :disabled="loading">
          {{ loading ? 'Проверка…' : 'Подтвердить' }}
        </button>

        <button type="button" class="btn-ghost mt-3 w-full text-brand-600" @click="resend">
          Отправить код повторно
        </button>
      </form>
    </div>
  </div>
</template>
