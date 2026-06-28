<script setup lang="ts">
import { useQueryClient } from "@tanstack/vue-query";
import { onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { getToken } from "@/lib/api";
import { applyRealtimeEvent, chatWs, ensureChatSocket } from "@/lib/chat-ws";

const route = useRoute();
const queryClient = useQueryClient();
let unsubscribe: (() => void) | undefined;

watch(
  () => route.meta.title,
  (title) => {
    document.title = (title as string) ?? "ЕдемВместе — Найди попутчиков и поезжай вместе";
  },
  { immediate: true },
);

onMounted(() => {
  ensureChatSocket(getToken());
  unsubscribe = chatWs.subscribe((event) => applyRealtimeEvent(queryClient, event));
});

onUnmounted(() => {
  unsubscribe?.();
});
</script>

<template>
  <RouterView />
</template>
