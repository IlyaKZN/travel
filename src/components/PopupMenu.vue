<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useStore } from '@/composables/useStore'

defineProps<{ showAuth?: boolean }>()

const router = useRouter()
const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const { logout } = useStore()

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function handleLogout() {
  logout()
  close()
  router.push('/')
}

function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="menuRef" class="relative">
    <button
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      aria-label="Меню"
      @click.stop="toggle"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 dark:border-slate-700 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
      >
        <RouterLink to="/chats" class="menu-item" @click="close">Сообщения</RouterLink>
        <RouterLink to="/profile" class="menu-item" @click="close">Профиль</RouterLink>
        <RouterLink to="/tours" class="menu-item" @click="close">Авторские туры</RouterLink>
        <RouterLink to="/trips" class="menu-item" @click="close">Поездки</RouterLink>
        <RouterLink to="/profile/settings" class="menu-item" @click="close">Настройки</RouterLink>
        <hr class="my-1 border-slate-100 dark:border-slate-800 dark:border-slate-800" />
        <RouterLink v-if="showAuth" to="/login" class="menu-item" @click="close">Войти</RouterLink>
        <button v-else type="button" class="menu-item w-full text-left text-red-600 dark:text-red-400" @click="handleLogout">
          Выйти
        </button>
      </div>
    </Transition>
  </div>
</template>
