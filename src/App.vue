<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQueryClient } from "@tanstack/vue-query";
import ToastHost from "@/components/ToastHost.vue";
import { getToken } from "@/lib/api";
import { applyRealtimeEvent, chatWs, ensureChatSocket } from "@/lib/chat-ws";
import { createDialogStore } from "@/lib/dialog-stores";
import { syncPushSubscription } from "@/lib/push-notifications";

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
let unsubscribe: (() => void) | undefined;

function handleOpenCreateQuery() {
  const value = route.query.openCreate;
  if (!value) return;
  const tripId = value === "1" ? undefined : String(value);
  createDialogStore.open(tripId);
  void router.replace({ query: { ...route.query, openCreate: undefined } });
}

watch(
  () => route.query.openCreate,
  () => handleOpenCreateQuery(),
  { immediate: true },
);

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
  void syncPushSubscription();
});

onUnmounted(() => {
  unsubscribe?.();
});
</script>

<template>
  <RouterView />
  <ToastHost />
</template>
