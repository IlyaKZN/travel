<script setup lang="ts">
import type { Trip } from '@/lib/mockData'
import { getTripAvatarColors, getTripAvatarLetters } from '@/lib/tripAvatar'

const props = defineProps<{
  trip: Trip
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'banner' | 'full'
}>()

const { bg, text } = getTripAvatarColors(props.trip.from, props.trip.to)
const letters = getTripAvatarLetters(props.trip.fromShort, props.trip.toShort)
</script>

<template>
  <div
    class="trip-avatar"
    :class="size ? `trip-avatar--${size}` : ''"
    :style="{ backgroundColor: bg, color: text }"
  >
    {{ letters }}
  </div>
</template>
