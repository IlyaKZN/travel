<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import PostCard from '@/components/PostCard.vue'
import TourCard from '@/components/TourCard.vue'
import { useStore } from '@/composables/useStore'
import { ApiError } from '@/api/client'

const { user, posts, tours, fetchPosts, fetchTours, addPost, deletePost } = useStore()

const activeTab = ref<'blog' | 'tours'>('blog')
const showCreatePost = ref(false)
const newPostText = ref('')
const newPostImage = ref('')
const error = ref('')

const userPosts = computed(() => posts.value.filter((p) => p.userId === user.id))
const userTours = computed(() => tours.value.filter((t) => t.creatorId === user.id))

onMounted(async () => {
  if (!user.id) return
  try {
    await Promise.all([fetchPosts(user.id), fetchTours({ creatorId: user.id })])
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Ошибка загрузки'
  }
})

async function createPost() {
  if (!newPostText.value.trim()) return
  try {
    await addPost({
      text: newPostText.value,
      image: newPostImage.value || undefined,
    })
    newPostText.value = ''
    newPostImage.value = ''
    showCreatePost.value = false
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Не удалось создать пост'
  }
}

async function handleDelete(id: string) {
  try {
    await deletePost(id)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Не удалось удалить пост'
  }
}

function handleEdit(id: string) {
  const post = posts.value.find((p) => p.id === id)
  if (post) {
    newPostText.value = post.text
    newPostImage.value = post.image || ''
    showCreatePost.value = true
    handleDelete(id)
  }
}

function onImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    newPostImage.value = URL.createObjectURL(file)
  }
}
</script>

<template>
  <div class="page-shell">
    <AppHeader title="Профиль" />

    <div class="page-container">
      <div v-if="error" class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{{ error }}</div>

      <div class="card p-6 sm:p-8">
        <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <img :src="user.avatar" :alt="user.nickname" class="h-24 w-24 rounded-full object-cover ring-4 ring-brand-200 dark:ring-brand-800 sm:h-28 sm:w-28" />
          <div class="flex-1 text-center sm:text-left">
            <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">@{{ user.nickname }}</h1>
            <p class="mt-1 text-slate-600 dark:text-slate-300">{{ user.firstName }} {{ user.lastName }}</p>
            <p v-if="user.about" class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ user.about }}</p>
            <div class="mt-3 flex justify-center gap-6 sm:justify-start">
              <div class="text-center">
                <div class="font-bold text-slate-900 dark:text-slate-100">{{ user.following }}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">подписок</div>
              </div>
              <div class="text-center">
                <div class="font-bold text-slate-900 dark:text-slate-100">{{ user.followers }}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">подписчиков</div>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <RouterLink to="/profile/settings" class="btn-secondary !px-3">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </RouterLink>
            <button type="button" class="btn-primary" @click="showCreatePost = true">Создать пост</button>
          </div>
        </div>
      </div>

      <div class="mt-6 flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1">
        <button
          type="button"
          class="flex-1 rounded-lg py-2.5 text-sm font-medium transition"
          :class="activeTab === 'blog' ? 'bg-gradient-to-r from-sky-500 to-brand-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'"
          @click="activeTab = 'blog'"
        >
          Блог
        </button>
        <button
          type="button"
          class="flex-1 rounded-lg py-2.5 text-sm font-medium transition"
          :class="activeTab === 'tours' ? 'bg-gradient-to-r from-sky-500 to-brand-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'"
          @click="activeTab = 'tours'"
        >
          Мои туры
        </button>
      </div>

      <div class="mt-6">
        <div v-if="activeTab === 'blog'" class="space-y-4">
          <PostCard
            v-for="post in userPosts"
            :key="post.id"
            :post="post"
            is-owner
            @edit="handleEdit"
            @delete="handleDelete"
          />
          <p v-if="!userPosts.length" class="py-12 text-center text-slate-400 dark:text-slate-500">Пока нет постов. Создайте первый!</p>
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TourCard v-for="tour in userTours" :key="tour.id" :tour="tour" />
          <p v-if="!userTours.length" class="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">У вас пока нет авторских туров</p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
        <div v-if="showCreatePost" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" @click.self="showCreatePost = false">
          <div class="w-full max-w-lg rounded-t-2xl bg-white dark:bg-slate-900 p-6 sm:rounded-2xl">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Новый пост</h3>
            <textarea v-model="newPostText" rows="4" class="input-field mt-4 resize-none" placeholder="Что нового?" />
            <div v-if="newPostImage" class="mt-3">
              <img :src="newPostImage" alt="Preview" class="h-32 rounded-xl object-cover" />
            </div>
            <label class="btn-secondary mt-3 inline-flex cursor-pointer">
              Прикрепить фото
              <input type="file" accept="image/*" class="hidden" @change="onImageChange" />
            </label>
            <div class="mt-4 flex gap-3">
              <button type="button" class="btn-secondary flex-1" @click="showCreatePost = false">Отмена</button>
              <button type="button" class="btn-primary flex-1" @click="createPost">Опубликовать</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
