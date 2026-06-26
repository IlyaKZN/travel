<script setup lang="ts">
import { watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

watch(
  () => route.meta.title,
  (title) => {
    document.title = (title as string) ?? "Waymate — Найди попутчиков и поезжай вместе";
  },
  { immediate: true },
);
</script>

<template>
  <RouterView />
</template>
