<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useStore } from '@/composables/useStore'
import { defaultAvatar } from '@/utils/unsplash'
import { ApiError } from '@/api/client'

const router = useRouter()
const { createProfile } = useStore()

const nickname = ref('')
const lastName = ref('')
const firstName = ref('')
const patronymic = ref('')
const birthDate = ref('')
const about = ref('')
const avatarPreview = ref('')
const error = ref('')
const loading = ref(false)

function onPhotoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    avatarPreview.value = URL.createObjectURL(file)
  }
}

async function submit() {
  error.value = ''
  if (!nickname.value || !lastName.value || !firstName.value || !birthDate.value) {
    error.value = 'Заполните обязательные поля'
    return
  }
  loading.value = true
  try {
    await createProfile({
      nickname: nickname.value,
      lastName: lastName.value,
      firstName: firstName.value,
      patronymic: patronymic.value || undefined,
      birthDate: birthDate.value,
      about: about.value || undefined,
      avatar: avatarPreview.value || defaultAvatar(),
    })
    router.push('/profile')
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Ошибка сохранения профиля'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-shell">
    <AppHeader show-auth title="Создание профиля" show-back />

    <div class="page-container py-8">
      <form class="card mx-auto max-w-lg p-6 sm:p-8" @submit.prevent="submit">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Создание профиля</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Расскажите немного о себе</p>

        <div v-if="error" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{{ error }}</div>

        <div class="mt-6 space-y-4">
          <div class="flex flex-col items-center gap-3 sm:flex-row">
            <div class="relative">
              <img
                :src="avatarPreview || defaultAvatar()"
                alt="Аватар"
                class="h-24 w-24 rounded-full object-cover ring-4 ring-slate-100"
              />
              <label class="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white shadow">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" accept="image/*" class="hidden" @change="onPhotoChange" />
              </label>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Загрузите фото профиля</p>
          </div>

          <div>
            <label class="label-field">Никнейм *</label>
            <input v-model="nickname" type="text" class="input-field" placeholder="@username" required />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label-field">Фамилия *</label>
              <input v-model="lastName" type="text" class="input-field" required />
            </div>
            <div>
              <label class="label-field">Имя *</label>
              <input v-model="firstName" type="text" class="input-field" required />
            </div>
          </div>
          <div>
            <label class="label-field">Отчество</label>
            <input v-model="patronymic" type="text" class="input-field" />
          </div>
          <div>
            <label class="label-field">Дата рождения *</label>
            <input v-model="birthDate" type="date" class="input-field" required />
          </div>
          <div>
            <label class="label-field">О себе</label>
            <textarea v-model="about" rows="3" class="input-field resize-none" placeholder="Расскажите о себе..." />
          </div>
        </div>

        <button type="submit" class="btn-primary mt-6 w-full" :disabled="loading">
          {{ loading ? 'Сохранение…' : 'Сохранить профиль' }}
        </button>
      </form>
    </div>
  </div>
</template>
