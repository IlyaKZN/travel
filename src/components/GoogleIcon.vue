<script setup lang="ts">
defineProps<{
  name: string;
  filled?: boolean;
}>();
</script>

<template>
  <span
    :class="['g-icon', { 'g-icon--filled': filled }]"
    aria-hidden="true"
  >{{ name }}</span>
</template>
