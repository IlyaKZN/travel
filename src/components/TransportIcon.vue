<script setup lang="ts">
import { Car, Train, Bus, Plane } from 'lucide-vue-next'

defineProps<{
  type: string
  size?: number
}>()
</script>

<template>
  <Train v-if="type === 'train'" :size="size ?? 16" :stroke-width="2" />
  <Bus v-else-if="type === 'bus'" :size="size ?? 16" :stroke-width="2" />
  <Plane v-else-if="type === 'plane'" :size="size ?? 16" :stroke-width="2" />
  <Car v-else :size="size ?? 16" :stroke-width="2" />
</template>
