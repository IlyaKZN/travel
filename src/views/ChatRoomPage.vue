<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ArrowLeft, Send, Users } from "lucide-vue-next";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppShell from "@/components/AppShell.vue";
import TripAvatar from "@/components/TripAvatar.vue";
import { api, getToken } from "@/lib/api";
import {
  appendChatMessage,
  chatWs,
  ensureChatSocket,
  syncJoinedChat,
  updateChatConversation,
  type ChatWsEvent,
} from "@/lib/chat-ws";
import { formatTime, formatDay } from "@/lib/format";

const route = useRoute();
const chatId = computed(() => route.params.chatId as string);
const queryClient = useQueryClient();

const chatQuery = useQuery({
  queryKey: computed(() => ["chat", chatId.value]),
  queryFn: () => api.chat(chatId.value),
  enabled: Boolean(getToken()),
  retry: false,
});
const messagesQuery = useQuery({
  queryKey: computed(() => ["messages", chatId.value]),
  queryFn: () => api.messages(chatId.value),
  enabled: Boolean(getToken()),
  retry: false,
});
const tripsQuery = useQuery({ queryKey: ["trips"], queryFn: api.trips });
const usersQuery = useQuery({ queryKey: ["users"], queryFn: api.users });
const meQuery = useQuery({
  queryKey: ["me"],
  queryFn: api.me,
  enabled: Boolean(getToken()),
  retry: false,
});

const chat = computed(() => chatQuery.data.value);
const trip = computed(() =>
  chat.value?.tripId ? tripsQuery.data.value?.find((t) => t.id === chat.value?.tripId) : null,
);
const other = computed(() => chat.value?.otherUser);
const list = computed(() => messagesQuery.data.value ?? []);
const text = ref("");
const sendError = ref("");
const endRef = ref<HTMLDivElement | null>(null);
const isSending = ref(false);

const sendMutation = useMutation({
  mutationFn: (message: string) => api.sendMessage(chatId.value, message),
  onSuccess: async () => {
    text.value = "";
    sendError.value = "";
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["messages", chatId.value] }),
      queryClient.invalidateQueries({ queryKey: ["chats"] }),
      queryClient.invalidateQueries({ queryKey: ["chat", chatId.value] }),
    ]);
  },
  onError: (error: Error) => {
    sendError.value = error.message;
  },
  onSettled: () => {
    isSending.value = false;
  },
});

function handleWsEvent(event: ChatWsEvent) {
  if (event.type === "joined" && event.conversation.id === chatId.value) {
    syncJoinedChat(queryClient, event.conversation, event.messages);
    return;
  }

  if (event.type === "message") {
    appendChatMessage(queryClient, chatId.value, event.message);
    return;
  }

  if (event.type === "conversation_updated") {
    updateChatConversation(queryClient, event.conversation);
    return;
  }

  if (event.type === "error") {
    sendError.value = event.message;
  }
}

let unsubscribe: (() => void) | undefined;

onMounted(() => {
  ensureChatSocket(getToken());
  unsubscribe = chatWs.subscribe(handleWsEvent);
  chatWs.join(chatId.value);
});

watch(chatId, (nextId, prevId) => {
  if (prevId && prevId !== nextId) {
    chatWs.leave();
  }
  chatWs.join(nextId);
});

onUnmounted(() => {
  unsubscribe?.();
  chatWs.leave();
});

const groups = computed(() => {
  const result: { day: string; items: typeof list.value }[] = [];
  for (const m of list.value) {
    const day = formatDay(m.at);
    const g = result[result.length - 1];
    if (g && g.day === day) g.items.push(m);
    else result.push({ day, items: [m] });
  }
  return result;
});

watch(
  () => list.value.length,
  async () => {
    await nextTick();
    endRef.value?.scrollIntoView({ behavior: "smooth" });
  },
);

function authorFor(id: string) {
  return usersQuery.data.value?.find((u) => u.id === id) ?? meQuery.data.value;
}

function send() {
  const t = text.value.trim();
  if (!t || isSending.value) return;

  sendError.value = "";
  isSending.value = true;

  if (chatWs.isConnected) {
    chatWs.send(t);
    text.value = "";
    isSending.value = false;
    return;
  }

  sendMutation.mutate(t);
}

function onSubmit(e: Event) {
  e.preventDefault();
  send();
}
</script>

<template>
  <AppShell>
    <div v-if="!getToken()" class="state-box">Войдите, чтобы открыть чат.</div>

    <template v-else-if="chatQuery.isLoading.value || messagesQuery.isLoading.value">
      <div class="state-box">Загружаем чат...</div>
    </template>

    <div v-else-if="!chat" class="state-box">Чат не найден</div>

    <template v-else>
      <section class="hero">
        <div class="hero__fade" />
        <div class="container chat-room__hero-inner">
          <div class="chat-room__header-row">
            <RouterLink to="/chats" class="chat-room__back">
              <ArrowLeft class="icon" />
            </RouterLink>
            <TripAvatar v-if="trip" :from="trip.from" :to="trip.to" :size="56" />
            <span
              v-else
              class="avatar chat-room__dm-avatar"
              :style="{ background: other?.avatarColor }"
            >
              {{ other?.firstName[0] }}
            </span>
            <div style="min-width: 0; flex: 1">
              <h1 class="chat-room__title">{{ chat.title }}</h1>
              <p class="chat-room__subtitle">
                <template v-if="chat.kind === 'group'">
                  <Users class="icon icon--sm" /> {{ chat.participantIds.length }} участников
                </template>
                <template v-else>в сети недавно</template>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div class="container chat-room__body">
        <div class="chat-room__panel">
          <div class="chat-room__messages">
            <div v-for="g in groups" :key="g.day" class="chat-room__day-group">
              <div class="chat-room__day-label">{{ g.day }}</div>
              <div
                v-for="m in g.items"
                :key="m.id"
                :class="['chat-room__message', { 'chat-room__message--mine': m.authorId === meQuery.data.value?.id }]"
              >
                <span
                  v-if="m.authorId !== meQuery.data.value?.id"
                  class="avatar chat-room__message-avatar"
                  :style="{ background: authorFor(m.authorId)?.avatarColor ?? '#94a3b8' }"
                >
                  {{ authorFor(m.authorId)?.firstName[0] ?? "?" }}
                </span>
                <div
                  :class="[
                    'chat-room__bubble',
                    m.authorId === meQuery.data.value?.id
                      ? 'chat-room__bubble--mine'
                      : 'chat-room__bubble--other',
                  ]"
                >
                  <div v-if="m.authorId !== meQuery.data.value?.id" class="chat-room__author">
                    {{ authorFor(m.authorId)?.firstName }}
                  </div>
                  <p class="chat-room__text">{{ m.text }}</p>
                  <div
                    :class="[
                      'chat-room__time',
                      m.authorId === meQuery.data.value?.id
                        ? 'chat-room__time--mine'
                        : 'chat-room__time--other',
                    ]"
                  >
                    {{ formatTime(m.at) }}
                  </div>
                </div>
              </div>
            </div>
            <div ref="endRef" />
          </div>

          <div class="chat-room__composer">
            <p v-if="sendError" class="chat-room__error">{{ sendError }}</p>
            <form class="chat-room__form" @submit="onSubmit">
              <input
                v-model="text"
                class="chat-room__input"
                placeholder="Напишите сообщение..."
              />
              <button type="submit" class="chat-room__send" :disabled="isSending">
                <Send class="icon icon--sm" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </template>
  </AppShell>
</template>
