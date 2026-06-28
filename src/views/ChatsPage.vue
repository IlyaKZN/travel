<script setup lang="ts">
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { useMutation } from "@tanstack/vue-query";
import { ArrowLeft, MessageCircle, Plus, Search, Send, Users } from "lucide-vue-next";
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppShell from "@/components/AppShell.vue";
import TripAvatar from "@/components/TripAvatar.vue";
import { useChatSocket } from "@/composables/useChatSocket";
import { api, getToken } from "@/lib/api";
import {
  appendChatMessage,
  chatWs,
  syncJoinedChat,
  updateChatConversation,
  type ChatWsEvent,
} from "@/lib/chat-ws";
import { formatDay, formatTime } from "@/lib/format";

const queryClient = useQueryClient();
const route = useRoute();
const activeChatId = computed(() => route.params.chatId as string | undefined);

const chatsQuery = useQuery({
  queryKey: ["chats"],
  queryFn: api.chats,
  enabled: Boolean(getToken()),
  retry: false,
});
const chatQuery = useQuery({
  queryKey: computed(() => ["chat", activeChatId.value]),
  queryFn: () => api.chat(activeChatId.value!),
  enabled: computed(() => Boolean(getToken() && activeChatId.value)),
  retry: false,
});
const messagesQuery = useQuery({
  queryKey: computed(() => ["messages", activeChatId.value]),
  queryFn: () => api.messages(activeChatId.value!),
  enabled: computed(() => Boolean(getToken() && activeChatId.value)),
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
const tab = ref<"all" | "trips" | "personal">("all");
const search = ref("");
const messageText = ref("");
const endRef = ref<HTMLDivElement | null>(null);
const sendError = ref("");

function handleWsEvent(event: ChatWsEvent) {
  if (event.type === "joined" && event.conversation.id === activeChatId.value) {
    syncJoinedChat(queryClient, event.conversation, event.messages);
    return;
  }

  if (event.type === "message" && activeChatId.value) {
    appendChatMessage(queryClient, activeChatId.value, event.message);
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

useChatSocket(handleWsEvent);

const tabs = [
  { key: "all", label: "Все" },
  { key: "trips", label: "Поездки" },
  { key: "personal", label: "Личные" },
] as const;

const list = computed(() =>
  (chatsQuery.data.value ?? []).filter((c) => {
    if (tab.value === "trips" && c.kind !== "group") return false;
    if (tab.value === "personal" && c.kind === "group") return false;
    if (search.value) {
      const haystack = `${c.title} ${c.preview}`.toLowerCase();
      if (!haystack.includes(search.value.toLowerCase())) return false;
    }
    return true;
  }),
);

function tripFor(id?: string) {
  return (tripsQuery.data.value ?? []).find((t) => t.id === id);
}

function userFor(id: string) {
  return usersQuery.data.value?.find((u) => u.id === id) ?? meQuery.data.value;
}

const activeChat = computed(() => chatQuery.data.value ?? chatsQuery.data.value?.find((c) => c.id === activeChatId.value));
const activeTrip = computed(() => (activeChat.value?.tripId ? tripFor(activeChat.value.tripId) : undefined));
const activeOther = computed(() => activeChat.value?.otherUser);
const messages = computed(() => messagesQuery.data.value ?? []);
const groups = computed(() => {
  const result: { day: string; items: typeof messages.value }[] = [];
  for (const m of messages.value) {
    const day = formatDay(m.at);
    const last = result[result.length - 1];
    if (last?.day === day) last.items.push(m);
    else result.push({ day, items: [m] });
  }
  return result;
});

watch(
  () => messages.value.length,
  async () => {
    await nextTick();
    endRef.value?.scrollIntoView({ behavior: "smooth" });
  },
);

watch(
  activeChatId,
  (nextId, prevId) => {
    if (prevId && prevId !== nextId) {
      chatWs.leave();
    }
    if (nextId) {
      chatWs.join(nextId);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  chatWs.leave();
});

const sendMutation = useMutation({
  mutationFn: (text: string) => api.sendMessage(activeChatId.value!, text),
  onSuccess: async () => {
    messageText.value = "";
    sendError.value = "";
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["messages", activeChatId.value] }),
      queryClient.invalidateQueries({ queryKey: ["chats"] }),
      queryClient.invalidateQueries({ queryKey: ["chat", activeChatId.value] }),
    ]);
  },
  onError: (error: Error) => {
    sendError.value = error.message;
  },
});

function sendMessage() {
  const value = messageText.value.trim();
  if (!value || !activeChatId.value || sendMutation.isPending.value) return;

  if (chatWs.isConnected) {
    sendError.value = "";
    chatWs.send(value);
    messageText.value = "";
    return;
  }

  sendMutation.mutate(value);
}

function onSubmit(e: Event) {
  e.preventDefault();
  sendMessage();
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

    <div v-else class="container chats">
      <div class="chats__shell">
        <aside :class="['chats__sidebar', { 'chats__sidebar--hidden-mobile': activeChatId }]">
          <div class="chats__sidebar-head">
            <div class="chats__title-row">
              <h1 class="chats__title">Чаты</h1>
              <button type="button" class="chats__new" aria-label="Новый чат">
                <Plus class="icon" :stroke-width="2.5" />
              </button>
            </div>

            <div class="chats__search">
              <Search class="chats__search-icon icon icon--sm" />
              <input
                v-model="search"
                class="chats__search-input"
                placeholder="Поиск сообщений..."
              />
            </div>

            <div class="chats__tabs">
              <button
                v-for="item in tabs"
                :key="item.key"
                type="button"
                :class="['chats__tab', { 'chats__tab--active': tab === item.key }]"
                @click="tab = item.key"
              >
                {{ item.label }}
              </button>
            </div>
          </div>

          <ul class="chats__list">
            <li v-for="c in list" :key="c.id" class="chats__item">
              <RouterLink
                :to="{ name: 'chats-chat', params: { chatId: c.id } }"
                :class="['chats__link', { 'chats__link--active': c.id === activeChatId }]"
              >
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
                  <div class="chats__name-row">
                    <h3 class="chats__name">{{ c.title }}</h3>
                    <span :class="['chats__time', { 'chats__time--unread': c.unread > 0 }]">
                      {{ formatTime(c.lastAt) }}
                    </span>
                  </div>
                  <div class="chats__preview-row">
                    <p :class="['chats__preview', { 'chats__preview--unread': c.unread > 0 }]">
                      {{ c.preview }}
                    </p>
                    <span v-if="c.unread > 0" class="chats__badge">{{ c.unread }}</span>
                  </div>
                </div>
              </RouterLink>
            </li>

            <li v-if="chatsQuery.isLoading.value" class="chats__empty">Загружаем чаты...</li>
            <li v-if="!chatsQuery.isLoading.value && list.length === 0" class="chats__empty">
              Ничего не нашли.
            </li>
          </ul>
        </aside>

        <section v-if="!activeChatId" class="chats__empty-pane">
          <div class="chats__empty-content">
            <div class="chats__empty-icon">
              <MessageCircle class="icon icon--lg" :stroke-width="1.75" />
            </div>
            <h2 class="chats__empty-title">Выберите чат</h2>
            <p class="chats__empty-text">
              Откройте переписку слева, чтобы планировать поездку вместе с попутчиками и делиться
              впечатлениями.
            </p>
          </div>
        </section>

        <section v-else class="chats__room">
          <div v-if="chatQuery.isLoading.value || messagesQuery.isLoading.value" class="chats__room-state">
            Загружаем чат...
          </div>
          <div v-else-if="!activeChat" class="chats__room-state">Чат не найден</div>
          <template v-else>
            <div class="chats__room-header">
              <RouterLink to="/chats" class="chats__room-back" aria-label="К списку чатов">
                <ArrowLeft class="icon" />
              </RouterLink>
              <TripAvatar
                v-if="activeTrip"
                :from="activeTrip.from"
                :to="activeTrip.to"
                :size="48"
              />
              <span
                v-else
                class="avatar chats__room-avatar"
                :style="{ background: activeOther?.avatarColor ?? '#888' }"
              >
                {{ activeOther?.firstName[0] ?? "?" }}
              </span>
              <div class="chats__room-heading">
                <h1 class="chats__room-title">{{ activeChat.title }}</h1>
                <p class="chats__room-subtitle">
                  <template v-if="activeChat.kind === 'group'">
                    <Users class="icon icon--sm" />
                    {{ activeChat.participantIds.length }} участников
                  </template>
                  <template v-else>в сети недавно</template>
                </p>
              </div>
            </div>

            <div class="chats__messages">
              <div v-for="g in groups" :key="g.day" class="chats__day-group">
                <div class="chats__day-label">{{ g.day }}</div>
                <div
                  v-for="m in g.items"
                  :key="m.id"
                  :class="['chats__message', { 'chats__message--mine': m.authorId === meQuery.data.value?.id }]"
                >
                  <span
                    v-if="m.authorId !== meQuery.data.value?.id"
                    class="avatar chats__message-avatar"
                    :style="{ background: userFor(m.authorId)?.avatarColor ?? '#94a3b8' }"
                  >
                    {{ userFor(m.authorId)?.firstName[0] ?? "?" }}
                  </span>
                  <div
                    :class="[
                      'chats__bubble',
                      m.authorId === meQuery.data.value?.id ? 'chats__bubble--mine' : 'chats__bubble--other',
                    ]"
                  >
                    <div v-if="m.authorId !== meQuery.data.value?.id" class="chats__author">
                      {{ userFor(m.authorId)?.firstName }}
                    </div>
                    <p class="chats__message-text">{{ m.text }}</p>
                    <div
                      :class="[
                        'chats__message-time',
                        m.authorId === meQuery.data.value?.id
                          ? 'chats__message-time--mine'
                          : 'chats__message-time--other',
                      ]"
                    >
                      {{ formatTime(m.at) }}
                    </div>
                  </div>
                </div>
              </div>
              <div ref="endRef" />
            </div>

            <div class="chats__composer">
              <p v-if="sendError" class="chats__error">{{ sendError }}</p>
              <form class="chats__form" @submit="onSubmit">
                <input
                  v-model="messageText"
                  class="chats__input"
                  placeholder="Напишите сообщение..."
                />
                <button type="submit" class="chats__send" :disabled="sendMutation.isPending.value">
                  <Send class="icon icon--sm" />
                </button>
              </form>
            </div>
          </template>
        </section>
      </div>
    </div>
  </AppShell>
</template>
