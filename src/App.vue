<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '@/composables/useStore'
import { isTelegram } from '@/composables/useTelegram'

const router = useRouter()
const route = useRoute()
const { init, loginTelegram, isAuthenticated } = useStore()

async function bootstrapTelegramAuth() {
  if (!isTelegram.value || isAuthenticated.value) return

  try {
    const { needsProfile } = await loginTelegram()
    if (needsProfile) {
      if (route.path !== '/profile/create') await router.replace('/profile/create')
      return
    }
    if (['/', '/auth/login', '/auth/register'].includes(route.path)) {
      await router.replace('/tours')
    }
  } catch {
    if (route.path === '/') await router.replace('/tours')
  }
}

function bootstrapTelegramNavigation() {
  if (isTelegram.value && route.path === '/') {
    router.replace('/tours')
  }
}

onMounted(async () => {
  await init()
  await bootstrapTelegramAuth()
  bootstrapTelegramNavigation()
})
</script>
