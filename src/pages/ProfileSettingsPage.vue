<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useStore } from '@/composables/useStore'
import { ApiError } from '@/api/client'

const router = useRouter()
const { user, updateUser } = useStore()

const nickname = ref(user.nickname)
const about = ref(user.about || '')
const showTours = ref(user.showTours)
const avatarPreview = ref(user.avatar)
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
  loading.value = true
  try {
    await updateUser({
      nickname: nickname.value,
      about: about.value || undefined,
      showTours: showTours.value,
      avatar: avatarPreview.value,
    })
    router.push('/profile')
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Ошибка сохранения'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-shell">
    <AppHeader title="Настройки профиля" show-back />

    <div class="page-container py-8">
      <form class="card mx-auto max-w-lg p-6 sm:p-8" @submit.prevent="submit">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Настройки профиля</h1>

        <div class="mt-6 space-y-5">
          <div class="flex flex-col items-center gap-3 sm:flex-row">
            <div class="relative">
              <img :src="avatarPreview" alt="Аватар" class="h-20 w-20 rounded-full object-cover ring-4 ring-slate-100" />
              <label class="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white shadow">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <input type="file" accept="image/*" class="hidden" @change="onPhotoChange" />
              </label>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Изменить фото</p>
          </div>

          <div>
            <label class="label-field">Никнейм</label>
            <input v-model="nickname" type="text" class="input-field" required />
          </div>

          <div>
            <label class="label-field">О себе</label>
            <textarea v-model="about" rows="3" class="input-field resize-none" placeholder="Расскажите о себе..." />
          </div>

          <label class="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <input v-model="showTours" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <div>
              <div class="text-sm font-medium text-slate-900 dark:text-slate-100">Показывать мои туры</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">Туры будут видны в вашем профиле</div>
            </div>
          </label>
        </div>

        <button type="submit" class="btn-primary mt-6 w-full">Сохранить</button>
      </form>
    </div>
  </div>
</template>
