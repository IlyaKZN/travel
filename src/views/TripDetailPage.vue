<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Users,
  Wallet,
  Car,
  Train,
  Bus,
  Plane,
  MessageCircle,
  Check,
  X,
  Clock3,
  UserPlus,
  Pencil,
  Trash2,
} from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppShell from "@/components/AppShell.vue";
import TripAvatar from "@/components/TripAvatar.vue";
import { api, getToken, transportLabel, type TransportType } from "@/lib/api";
import { avatarClass, avatarStyle } from "@/lib/avatar";
import { formatDateTime, formatBudget } from "@/lib/format";
import { createDialogStore } from "@/lib/dialog-stores";

const transportMeta: Record<TransportType, { icon: typeof Car; modifier: string }> = {
  car: { icon: Car, modifier: "transport-icon--car" },
  train: { icon: Train, modifier: "transport-icon--train" },
  bus: { icon: Bus, modifier: "transport-icon--bus" },
  plane: { icon: Plane, modifier: "transport-icon--plane" },
};

const route = useRoute();
const router = useRouter();
const tripId = computed(() => route.params.tripId as string);
const queryClient = useQueryClient();

const tripQuery = useQuery({
  queryKey: computed(() => ["trip", tripId.value]),
  queryFn: () => api.trip(tripId.value),
});
const meQuery = useQuery({
  queryKey: ["me"],
  queryFn: api.me,
  enabled: Boolean(getToken()),
  retry: false,
});

const invalidateTripQueries = async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["trips"] }),
    queryClient.invalidateQueries({ queryKey: ["trip", tripId.value] }),
    queryClient.invalidateQueries({ queryKey: ["chats"] }),
  ]);
};

const joinMutation = useMutation({
  mutationFn: () => api.joinTrip(tripId.value),
  onSuccess: invalidateTripQueries,
});

const cancelRequestMutation = useMutation({
  mutationFn: () => api.cancelTripRequest(tripId.value),
  onSuccess: invalidateTripQueries,
});

const approveRequestMutation = useMutation({
  mutationFn: (userId: string) => api.approveTripRequest(tripId.value, userId),
  onSuccess: invalidateTripQueries,
});

const declineRequestMutation = useMutation({
  mutationFn: (userId: string) => api.declineTripRequest(tripId.value, userId),
  onSuccess: invalidateTripQueries,
});

const openTripChatMutation = useMutation({
  mutationFn: () => api.tripChat(tripId.value),
  onSuccess: (chat) => router.push({ name: "chats-chat", params: { chatId: chat.id } }),
});

const deleteMutation = useMutation({
  mutationFn: () => api.deleteTrip(tripId.value),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ["trips"] });
    await router.push("/");
  },
});

const confirmDelete = ref(false);

const trip = computed(() => tripQuery.data.value);
const organizer = computed(
  () => trip.value?.organizer ?? trip.value?.participants?.find((p) => p.id === trip.value?.organizerId),
);
const participants = computed(
  () => trip.value?.participants?.filter((p) => p.id !== trip.value?.organizerId) ?? [],
);
const isOrganizer = computed(() =>
  meQuery.data.value ? trip.value?.organizerId === meQuery.data.value.id : false,
);
const isMember = computed(() =>
  meQuery.data.value ? trip.value?.participantIds.includes(meQuery.data.value.id) : false,
);
const seatsLeft = computed(() => (trip.value ? Math.max(0, trip.value.seats - trip.value.taken) : 0));
const myStatus = computed<"none" | "pending" | "member">(() => {
  const me = meQuery.data.value;
  if (!me) return "none";
  if (isMember.value) return "member";
  return trip.value?.pendingRequestIds?.includes(me.id) ? "pending" : "none";
});
const pendingRequests = computed(() => trip.value?.pendingRequests ?? []);
const isRequestActionPending = computed(
  () =>
    joinMutation.isPending.value ||
    cancelRequestMutation.isPending.value ||
    approveRequestMutation.isPending.value ||
    declineRequestMutation.isPending.value,
);
const ctaDisabled = computed(
  () =>
    isRequestActionPending.value ||
    openTripChatMutation.isPending.value ||
    (!isOrganizer.value && !isMember.value && myStatus.value !== "pending" && seatsLeft.value === 0),
);
const tMeta = computed(() => (trip.value ? transportMeta[trip.value.transport] : transportMeta.car));

function handleCta() {
  if (!getToken()) {
    router.push("/auth");
    return;
  }
  if (isOrganizer.value || isMember.value) openTripChatMutation.mutate();
  else if (myStatus.value === "pending") cancelRequestMutation.mutate();
  else if (seatsLeft.value > 0) joinMutation.mutate();
}
</script>

<template>
  <AppShell>
    <div v-if="tripQuery.isLoading.value" class="state-box">Загружаем поездку...</div>
    <div v-else-if="!trip" class="state-box">Поездка не найдена</div>

    <template v-else>
      <section class="hero">
        <div class="hero__glow hero__glow--white" />
        <div class="hero__glow hero__glow--bottom-amber" />
        <div class="container trip-detail__hero-inner">
          <div class="trip-detail__hero-top">
            <button type="button" class="trip-detail__back" @click="router.back()">
              <ArrowLeft class="icon icon--sm" :stroke-width="2.5" /> Назад
            </button>
            <div v-if="isOrganizer" class="trip-detail__hero-actions">
              <button
                type="button"
                class="trip-detail__hero-action"
                aria-label="Редактировать поездку"
                @click="createDialogStore.open(trip.id)"
              >
                <Pencil class="icon icon--sm" :stroke-width="2.5" />
                <span class="trip-detail__hero-action-label">Редактировать</span>
              </button>
              <button
                type="button"
                class="trip-detail__hero-action trip-detail__hero-action--danger"
                aria-label="Удалить поездку"
                @click="confirmDelete = true"
              >
                <Trash2 class="icon icon--sm" :stroke-width="2.5" />
                <span class="trip-detail__hero-action-label">Удалить</span>
              </button>
            </div>
          </div>

          <div class="trip-detail__hero-row">
            <div class="trip-detail__avatar-wrap">
              <TripAvatar :from="trip.from" :to="trip.to" :size="56" />
            </div>
            <div style="min-width: 0">
              <h1 class="trip-detail__route-title">
                <span class="trip-detail__route-cities">
                  <span>{{ trip.from }}</span>
                  <ArrowRight class="icon" :stroke-width="2.25" />
                  <span class="trip-detail__route-to">{{ trip.to }}</span>
                </span>
              </h1>
              <p class="trip-detail__route-date">{{ formatDateTime(trip.startAt) }}</p>
            </div>
          </div>
        </div>
      </section>

      <div class="container trip-detail__content">
        <div class="trip-detail__stats">
          <div class="trip-detail__stat">
            <div class="trip-detail__stat-row">
              <span class="trip-detail__stat-icon trip-detail__stat-icon--orange">
                <Calendar class="icon icon--sm" :stroke-width="2.25" />
              </span>
              <div style="min-width: 0">
                <div class="trip-detail__stat-label">Начало</div>
                <div class="trip-detail__stat-value">{{ formatDateTime(trip.startAt) }}</div>
              </div>
            </div>
          </div>
          <div class="trip-detail__stat">
            <div class="trip-detail__stat-row">
              <span class="trip-detail__stat-icon trip-detail__stat-icon--rose">
                <Clock class="icon icon--sm" :stroke-width="2.25" />
              </span>
              <div style="min-width: 0">
                <div class="trip-detail__stat-label">Окончание</div>
                <div class="trip-detail__stat-value">{{ formatDateTime(trip.endAt) }}</div>
              </div>
            </div>
          </div>
          <div class="trip-detail__stat">
            <div class="trip-detail__stat-row">
              <span :class="['trip-detail__stat-icon', tMeta.modifier]">
                <component :is="tMeta.icon" class="icon icon--sm" :stroke-width="2.25" />
              </span>
              <div style="min-width: 0">
                <div class="trip-detail__stat-label">Транспорт</div>
                <div class="trip-detail__stat-value">{{ transportLabel[trip.transport] }}</div>
              </div>
            </div>
          </div>
          <div class="trip-detail__stat">
            <div class="trip-detail__stat-row">
              <span class="trip-detail__stat-icon trip-detail__stat-icon--amber">
                <Users class="icon icon--sm" :stroke-width="2.25" />
              </span>
              <div style="min-width: 0">
                <div class="trip-detail__stat-label">Места</div>
                <div class="trip-detail__stat-value">{{ trip.taken }} / {{ trip.seats }}</div>
              </div>
            </div>
          </div>
          <div class="trip-detail__stat">
            <div class="trip-detail__stat-row">
              <span class="trip-detail__stat-icon trip-detail__stat-icon--yellow">
                <Wallet class="icon icon--sm" :stroke-width="2.25" />
              </span>
              <div style="min-width: 0">
                <div class="trip-detail__stat-label">Бюджет</div>
                <div class="trip-detail__stat-value">≈ {{ formatBudget(trip.budget) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card trip-detail__card">
          <div class="trip-detail__participants-head">
            <h3 class="title title--sm">Участники</h3>
            <span class="trip-detail__participants-count">{{ 1 + participants.length }} из {{ trip.seats }}</span>
          </div>

          <div class="trip-detail__participants-grid">
            <RouterLink
              :to="{ name: 'profile-user', params: { userId: organizer?.id ?? trip.organizerId } }"
              class="trip-detail__participant trip-detail__participant--organizer"
            >
              <span
                :class="['avatar trip-detail__participant-avatar', avatarClass(organizer)]"
                :style="avatarStyle(organizer)"
              >
                {{ organizer?.firstName[0] ?? "?" }}
              </span>
              <div style="min-width: 0; flex: 1">
                <span class="trip-detail__organizer-badge">Организатор</span>
                <div class="trip-detail__participant-name">
                  {{ organizer?.firstName ?? "Организатор" }} {{ organizer?.lastName ?? "" }}
                </div>
              </div>
            </RouterLink>

            <RouterLink
              v-for="p in participants"
              :key="p.id"
              :to="{ name: 'profile-user', params: { userId: p.id } }"
              class="trip-detail__participant"
            >
              <span
                :class="['avatar trip-detail__participant-avatar', avatarClass(p)]"
                :style="avatarStyle(p)"
              >
                {{ p.firstName[0] }}
              </span>
              <div style="min-width: 0; flex: 1">
                <div class="trip-detail__participant-name">{{ p.firstName }} {{ p.lastName }}</div>
              </div>
            </RouterLink>

            <div
              v-for="(_, i) in Math.max(0, trip.seats - 1 - participants.length)"
              :key="`empty-${i}`"
              class="trip-detail__empty-seat"
            >
              <span class="trip-detail__empty-icon">+</span>
              <div style="min-width: 0; flex: 1">
                <div class="trip-detail__empty-label">Свободно</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card trip-detail__card">
          <h3 class="title title--sm">О поездке</h3>
          <p class="trip-detail__description">{{ trip.description }}</p>
        </div>

        <div v-if="!isOrganizer && myStatus === 'pending'" class="trip-detail__request-status">
          <div class="trip-detail__request-status-main">
            <span class="trip-detail__request-status-icon">
              <Clock3 class="icon" :stroke-width="2.25" />
            </span>
            <div>
              <div class="trip-detail__request-status-title">Заявка отправлена</div>
              <div class="trip-detail__request-status-text">
                Организатор {{ organizer?.firstName ?? "поездки" }} рассмотрит её в ближайшее время
              </div>
            </div>
          </div>
          <button
            type="button"
            class="trip-detail__request-cancel"
            :disabled="cancelRequestMutation.isPending.value"
            @click="cancelRequestMutation.mutate()"
          >
            Отменить заявку
          </button>
        </div>

        <div v-if="isOrganizer" class="card trip-detail__card">
          <div class="trip-detail__requests-head">
            <h3 class="trip-detail__requests-title">
              <UserPlus class="icon icon--sm" :stroke-width="2.25" />
              Заявки на вступление
            </h3>
            <span class="trip-detail__participants-count">{{ pendingRequests.length }}</span>
          </div>

          <p v-if="pendingRequests.length === 0" class="trip-detail__requests-empty">
            Новых заявок пока нет. Они появятся здесь, когда кто-то захочет присоединиться.
          </p>
          <ul v-else class="trip-detail__requests-list">
            <li v-for="request in pendingRequests" :key="request.user.id" class="trip-detail__request-item">
              <RouterLink
                :to="{ name: 'profile-user', params: { userId: request.user.id } }"
                class="trip-detail__request-user"
              >
                <span
                  :class="['avatar trip-detail__request-avatar', avatarClass(request.user)]"
                  :style="avatarStyle(request.user)"
                >
                  {{ request.user.firstName[0] }}
                </span>
                <div style="min-width: 0">
                  <div class="trip-detail__request-name">
                    {{ request.user.firstName }} {{ request.user.lastName }}
                  </div>
                  <div class="trip-detail__request-meta">
                    {{ request.user.location }} · хочет присоединиться
                  </div>
                </div>
              </RouterLink>
              <div class="trip-detail__request-actions">
                <button
                  type="button"
                  class="trip-detail__request-decline"
                  :disabled="declineRequestMutation.isPending.value || approveRequestMutation.isPending.value"
                  @click="declineRequestMutation.mutate(request.user.id)"
                >
                  <X class="icon icon--sm" :stroke-width="2.5" /> Отклонить
                </button>
                <button
                  type="button"
                  class="trip-detail__request-approve"
                  :disabled="seatsLeft === 0 || declineRequestMutation.isPending.value || approveRequestMutation.isPending.value"
                  @click="approveRequestMutation.mutate(request.user.id)"
                >
                  <Check class="icon icon--sm" :stroke-width="2.5" /> Принять
                </button>
              </div>
            </li>
          </ul>
          <p v-if="seatsLeft === 0 && pendingRequests.length > 0" class="trip-detail__requests-no-seats">
            Свободных мест нет — освободите место, чтобы принять заявку.
          </p>
        </div>

        <div class="trip-detail__spacer" />
      </div>

      <div class="container trip-detail__cta-wrap">
        <div class="trip-detail__cta-panel">
          <button
            type="button"
            class="btn btn--hero trip-detail__cta"
            :disabled="ctaDisabled"
            @click="handleCta"
          >
            <template v-if="isRequestActionPending || openTripChatMutation.isPending.value">
              Подождите...
            </template>
            <template v-else-if="isOrganizer || isMember">
              <MessageCircle class="icon icon--sm" :stroke-width="2.5" />
              Открыть чат поездки
            </template>
            <template v-else-if="myStatus === 'pending'">
              <Clock3 class="icon icon--sm" :stroke-width="2.5" />
              Заявка отправлена · отменить
            </template>
            <template v-else-if="seatsLeft === 0">Мест больше нет</template>
            <template v-else>Хочу поехать!</template>
          </button>
        </div>
      </div>

      <Teleport to="body">
        <div
          v-if="confirmDelete"
          class="trip-delete"
          role="dialog"
          aria-modal="true"
          @click.self="confirmDelete = false"
        >
          <div class="trip-delete__panel">
            <h2 class="trip-delete__title">Удалить поездку?</h2>
            <p class="trip-delete__text">
              Поездка «{{ trip.from }} → {{ trip.to }}» и её чат будут удалены без возможности
              восстановить. Участники получат уведомление.
            </p>
            <div class="trip-delete__actions">
              <button type="button" class="btn btn--secondary btn--md" @click="confirmDelete = false">
                Отмена
              </button>
              <button
                type="button"
                class="btn btn--md trip-delete__confirm"
                :disabled="deleteMutation.isPending.value"
                @click="deleteMutation.mutate()"
              >
                {{ deleteMutation.isPending.value ? "Удаляем..." : "Удалить" }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </template>
  </AppShell>
</template>
