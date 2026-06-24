<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const open = ref(false)
const modal = ref<'about' | 'help' | 'contacts' | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const content = {
  about: {
    title: 'О нас',
    body: 'Travels — платформа для путешественников, где можно создавать авторские туры, находить попутчиков и вести блог о поездках. Мы объединяем людей, которые любят открывать новые места.',
  },
  help: {
    title: 'Помощь',
    body: 'Для регистрации укажите телефон или email и подтвердите аккаунт кодом из письма. После входа заполните профиль и начните создавать туры или присоединяйтесь к поездкам других участников.',
  },
  contacts: {
    title: 'Контакты',
    body: 'По вопросам работы платформы: support@travels.ru\nTelegram: @travels_support',
  },
} as const

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function openModal(key: keyof typeof content) {
  modal.value = key
  close()
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
      class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      aria-label="Информация"
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
        class="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
      >
        <button type="button" class="menu-item w-full text-left" @click="openModal('about')">О нас</button>
        <button type="button" class="menu-item w-full text-left" @click="openModal('help')">Помощь</button>
        <button type="button" class="menu-item w-full text-left" @click="openModal('contacts')">Контакты</button>
      </div>
    </Transition>

    <Teleport to="body">
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
        <div v-if="modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="modal = null">
          <div class="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-slate-900">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ content[modal].title }}</h3>
            <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{{ content[modal].body }}</p>
            <button type="button" class="btn-primary mt-6 w-full" @click="modal = null">Закрыть</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
