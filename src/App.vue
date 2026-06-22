<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useStore } from '@/composables/useStore'

const { init } = useStore()

onMounted(() => {
  init()
})
</script>
