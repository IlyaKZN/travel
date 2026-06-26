<script setup lang="ts">
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { Search } from "lucide-vue-next";
import { ref } from "vue";
import AppShell from "@/components/AppShell.vue";
import TripAvatar from "@/components/TripAvatar.vue";
import { useChatsListSocket } from "@/composables/useChatSocket";
import { api, getToken } from "@/lib/api";
import { formatTime } from "@/lib/format";

const queryClient = useQueryClient();

const chatsQuery = useQuery({
  queryKey: ["chats"],
  queryFn: api.chats,
  enabled: Boolean(getToken()),
  retry: false,
});
const tripsQuery = useQuery({ queryKey: ["trips"], queryFn: api.trips });
const tab = ref<"trips" | "dm">("trips");

useChatsListSocket(queryClient);

const list = () =>
  (chatsQuery.data.value ?? []).filter((c) => (tab.value === "trips" ? c.kind === "group" : c.kind === "dm"));

function tripFor(id?: string) {
  return (tripsQuery.data.value ?? []).find((t) => t.id === id);
}
</script>

<template>
  <AppShell>
    <div v-if="!getToken()" class="container chats__gate">
      <h1 class="title title--md">Войдите, чтобы открыть чаты</h1>
      <p class="text-muted">Чаты доступны участникам поездок и личных диалогов.</p>
      <RouterLink to="/auth" class="btn btn--primary btn--md" style="margin-top: 1.5rem">
        Войти
      </RouterLink>
    </div>

    <div v-else class="container chats chats__wrap">
      <h1 class="chats__title">Чаты</h1>

      <div class="chats__search">
        <Search class="icon icon--sm text-muted" />
        <input class="input input--transparent" placeholder="Поиск" />
      </div>

      <div class="chats__tabs">
        <button
          v-for="k in (['trips', 'dm'] as const)"
          :key="k"
          type="button"
          :class="['chats__tab', { 'chats__tab--active': tab === k }]"
          @click="tab = k"
        >
          {{ k === "trips" ? "Поездки" : "Личные" }}
        </button>
      </div>

      <ul class="chats__list">
        <li v-for="c in list()" :key="c.id" class="chats__item">
          <RouterLink :to="{ name: 'chat', params: { chatId: c.id } }" class="chats__link">
            <TripAvatar
              v-if="c.tripId && tripFor(c.tripId)"
              :from="tripFor(c.tripId)!.from"
              :to="tripFor(c.tripId)!.to"
              :size="48"
            />
            <span
              v-else
              class="avatar chats__dm-avatar"
              :style="{ background: c.otherUser?.avatarColor ?? '#888' }"
            >
              {{ c.otherUser?.firstName[0] ?? "?" }}
            </span>
            <div class="chats__body">
              <h3 class="chats__name">{{ c.title }}</h3>
              <p class="chats__preview">{{ c.preview }}</p>
            </div>
            <div class="chats__meta">
              <span class="chats__time">{{ formatTime(c.lastAt) }}</span>
              <span v-if="c.unread > 0" class="chats__badge">{{ c.unread }}</span>
              <span v-else class="chats__badge-spacer" />
            </div>
          </RouterLink>
        </li>
        <li v-if="chatsQuery.isLoading.value" class="chats__empty">Загружаем чаты...</li>
        <li v-if="!chatsQuery.isLoading.value && list().length === 0" class="chats__empty">
          Нет чатов в этой вкладке.
        </li>
      </ul>
    </div>
  </AppShell>
</template>
