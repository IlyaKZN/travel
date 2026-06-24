<script setup lang="ts">
import type { Trip } from '@/lib/mockData'
import { getTripAvatarColors, getTripAvatarLetters } from '@/lib/tripAvatar'

const props = defineProps<{
  trip: Trip
  class?: string
}>()

const { bg, text } = getTripAvatarColors(props.trip.from, props.trip.to)
const letters = getTripAvatarLetters(props.trip.fromShort, props.trip.toShort)
</script>

<template>
  <div
    class="flex items-center justify-center font-extrabold tracking-tight"
    :class="props.class"
    :style="{ backgroundColor: bg, color: text }"
  >
    {{ letters }}
  </div>
</template>
