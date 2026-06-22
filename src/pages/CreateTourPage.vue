<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useStore } from '@/composables/useStore'
import { defaultTourImage } from '@/utils/unsplash'
import { ApiError } from '@/api/client'

const router = useRouter()
const { addTour } = useStore()

const location = ref('')
const shortDescription = ref('')
const maxParticipants = ref(10)
const price = ref(0)
const fullPlan = ref('')
const startDate = ref('')
const endDate = ref('')
const isClosed = ref(false)
const images = ref<string[]>([])
const video = ref('')
const error = ref('')
const loading = ref(false)

function onImagesChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  const remaining = 10 - images.value.length
  Array.from(files)
    .slice(0, remaining)
    .forEach((f) => images.value.push(URL.createObjectURL(f)))
}

function onVideoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) video.value = URL.createObjectURL(file)
}

function removeImage(idx: number) {
  images.value.splice(idx, 1)
}

async function createTour(isDraft: boolean) {
  error.value = ''
  loading.value = true
  try {
    await addTour({
      location: location.value,
      shortDescription: shortDescription.value,
      maxParticipants: maxParticipants.value,
      price: price.value,
      fullPlan: fullPlan.value,
      startDate: startDate.value,
      endDate: endDate.value,
      images: images.value.length ? images.value : [defaultTourImage()],
      video: video.value || undefined,
      isClosed: isClosed.value,
      isDraft,
    })
    router.push('/tours')
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Ошибка создания тура'
  } finally {
    loading.value = false
  }
}

function create() {
  createTour(false)
}

function saveDraft() {
  createTour(true)
}
</script>

<template>
  <div class="page-shell">
    <AppHeader title="Создание тура" show-back />

    <div class="page-container py-8">
      <form class="card mx-auto max-w-2xl p-6 sm:p-8" @submit.prevent="create">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Создание тура</h1>
        <div v-if="error" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{{ error }}</div>

        <div class="mt-6 space-y-4">
          <div>
            <label class="label-field">Локация тура</label>
            <input v-model="location" type="text" class="input-field" placeholder="Город, регион или место" required />
          </div>
          <div>
            <label class="label-field">Краткое описание</label>
            <textarea v-model="shortDescription" rows="2" class="input-field resize-none" required />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label-field">Кол-во участников</label>
              <input v-model.number="maxParticipants" type="number" min="1" class="input-field" required />
            </div>
            <div>
              <label class="label-field">Цена (₽)</label>
              <input v-model.number="price" type="number" min="0" class="input-field" required />
            </div>
          </div>
          <div>
            <label class="label-field">Полный план тура</label>
            <textarea v-model="fullPlan" rows="5" class="input-field resize-none" required />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label-field">Дата начала</label>
              <input v-model="startDate" type="datetime-local" class="input-field" required />
            </div>
            <div>
              <label class="label-field">Дата окончания</label>
              <input v-model="endDate" type="datetime-local" class="input-field" required />
            </div>
          </div>

          <div>
            <label class="label-field">Фотографии (до 10)</label>
            <div v-if="images.length" class="mb-3 flex flex-wrap gap-2">
              <div v-for="(img, i) in images" :key="i" class="relative">
                <img :src="img" class="h-20 w-20 rounded-lg object-cover" />
                <button type="button" class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white" @click="removeImage(i)">×</button>
              </div>
            </div>
            <label v-if="images.length < 10" class="btn-secondary inline-flex cursor-pointer">
              Добавить фото
              <input type="file" accept="image/*" multiple class="hidden" @change="onImagesChange" />
            </label>
          </div>

          <div>
            <label class="label-field">Видео (1 файл)</label>
            <label class="btn-secondary inline-flex cursor-pointer">
              {{ video ? 'Видео загружено' : 'Добавить видео' }}
              <input type="file" accept="video/*" class="hidden" @change="onVideoChange" />
            </label>
          </div>

          <label class="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <input v-model="isClosed" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <span class="text-sm font-medium text-slate-900 dark:text-slate-100">Закрытая группа</span>
          </label>
        </div>

        <div class="mt-6 flex flex-col gap-2 sm:flex-row">
          <button type="submit" class="btn-primary flex-1">Создать тур</button>
          <button type="button" class="btn-secondary flex-1" @click="router.push('/tours')">Отмена</button>
          <button type="button" class="btn-ghost flex-1" @click="saveDraft">В черновики</button>
        </div>
      </form>
    </div>
  </div>
</template>
