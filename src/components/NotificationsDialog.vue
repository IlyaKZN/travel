<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import {
  Bell,
  Check,
  X,
  UserPlus,
  PencilLine,
  CheckCircle2,
  XCircle,
  Inbox,
} from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { api, getToken, type Notification, type NotificationKind, type User } from "@/lib/api";
import { notificationsDialogStore } from "@/lib/dialog-stores";

const router = useRouter();
const queryClient = useQueryClient();
const open = computed(() => notificationsDialogStore.state.open);
const tab = ref<"all" | "unread">("all");

const notificationsQuery = useQuery({
  queryKey: ["notifications"],
  queryFn: api.notifications,
  enabled: computed(() => Boolean(getToken()) && open.value),
});

const usersQuery = useQuery({
  queryKey: ["users"],
  queryFn: api.users,
  enabled: computed(() => open.value),
});

const tripsQuery = useQuery({
  queryKey: ["trips"],
  queryFn: api.trips,
  enabled: computed(() => open.value),
});

const items = computed(() => notificationsQuery.data.value ?? []);
const shown = computed(() =>
  tab.value === "unread" ? items.value.filter((n) => !n.read) : items.value,
);
const unreadCount = computed(() => items.value.filter((n) => !n.read).length);

function close() {
  notificationsDialogStore.close();
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} дн назад`;
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function userFor(id?: string): User | undefined {
  if (!id) return undefined;
  return (usersQuery.data.value ?? []).find((u) => u.id === id);
}

function tripRoute(tripId: string) {
  const trip = (tripsQuery.data.value ?? []).find((t) => t.id === tripId);
  return trip ? `${trip.from} → ${trip.to}` : "Поездка";
}

function kindMeta(kind: NotificationKind) {
  switch (kind) {
    case "request_incoming":
      return { icon: UserPlus, modifier: "notifications__icon--primary" };
    case "request_accepted":
      return { icon: CheckCircle2, modifier: "notifications__icon--success" };
    case "request_declined":
      return { icon: XCircle, modifier: "notifications__icon--danger" };
    case "trip_updated":
      return { icon: PencilLine, modifier: "notifications__icon--warning" };
    default:
      return { icon: Bell, modifier: "notifications__icon--muted" };
  }
}

function notificationBody(n: Notification, actorName?: string) {
  const who = actorName ?? "Кто-то";
  switch (n.kind) {
    case "request_incoming":
      return { who, rest: "хочет присоединиться к вашей поездке" };
    case "request_accepted":
      return { who, rest: "принял(а) вашу заявку в поездку" };
    case "request_declined":
      return { who, rest: "отклонил(а) вашу заявку в поездку" };
    case "trip_updated":
      return { who, rest: "обновил(а) детали поездки, в которой вы участвуете" };
    default:
      return { who: "", rest: "Уведомление" };
  }
}

const invalidate = () => {
  void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  void queryClient.invalidateQueries({ queryKey: ["trips"] });
};

const markAllReadMutation = useMutation({
  mutationFn: api.markAllNotificationsRead,
  onSuccess: invalidate,
});

const markReadMutation = useMutation({
  mutationFn: api.markNotificationRead,
  onSuccess: invalidate,
});

const dismissMutation = useMutation({
  mutationFn: api.dismissNotification,
  onSuccess: invalidate,
});

const acceptMutation = useMutation({
  mutationFn: api.acceptNotificationRequest,
  onSuccess: invalidate,
});

const declineMutation = useMutation({
  mutationFn: api.declineNotificationRequest,
  onSuccess: invalidate,
});

function goToTrip(tripId: string, notificationId: string) {
  markReadMutation.mutate(notificationId);
  close();
  router.push({ name: "trip", params: { tripId } });
}

function goToProfile(userId: string, notificationId: string) {
  markReadMutation.mutate(notificationId);
  close();
  router.push({ name: "profile-user", params: { userId } });
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="app-dialog"
      role="dialog"
      aria-modal="true"
      aria-label="Центр уведомлений"
      @click.self="close"
    >
      <div class="app-dialog__panel app-dialog__panel--notifications">
        <header class="notifications__header">
          <div>
            <p class="notifications__eyebrow">Центр уведомлений</p>
            <h1 class="notifications__title">Уведомления</h1>
          </div>
          <button
            v-if="unreadCount > 0"
            type="button"
            class="btn btn--ghost btn--sm notifications__read-all"
            :disabled="markAllReadMutation.isPending.value"
            @click="markAllReadMutation.mutate()"
          >
            <Check class="icon icon--sm" /> Прочитать все
          </button>
        </header>

        <div class="notifications__tabs-wrap">
          <div class="notifications__tabs">
            <button
              type="button"
              :class="['notifications__tab', { 'notifications__tab--active': tab === 'all' }]"
              @click="tab = 'all'"
            >
              Все
            </button>
            <button
              type="button"
              :class="['notifications__tab', { 'notifications__tab--active': tab === 'unread' }]"
              @click="tab = 'unread'"
            >
              Непрочитанные{{ unreadCount ? ` · ${unreadCount}` : "" }}
            </button>
          </div>
        </div>

        <div class="notifications__body">
          <div v-if="notificationsQuery.isLoading.value" class="state-box">Загружаем...</div>
          <div v-else-if="shown.length === 0" class="notifications__empty">
            <div class="notifications__empty-icon">
              <Inbox class="icon" />
            </div>
            <p class="notifications__empty-title">Нет уведомлений</p>
            <p class="notifications__empty-text">
              Здесь появятся заявки в поездки и обновления по вашим маршрутам.
            </p>
          </div>
          <ul v-else class="notifications__list">
            <li
              v-for="n in shown"
              :key="n.id"
              :class="['notifications__item', { 'notifications__item--unread': !n.read }]"
            >
              <div
                :class="['notifications__icon', kindMeta(n.kind).modifier]"
                aria-hidden="true"
              >
                <component :is="kindMeta(n.kind).icon" class="icon icon--sm" />
              </div>

              <div class="notifications__content">
                <div class="notifications__row">
                  <div class="notifications__main">
                    <p class="notifications__text">
                      <template v-if="notificationBody(n, userFor(n.actorId)?.firstName).who">
                        <strong>{{ notificationBody(n, userFor(n.actorId)?.firstName).who }}</strong>
                        {{ " " + notificationBody(n, userFor(n.actorId)?.firstName).rest }}
                      </template>
                      <template v-else>{{ notificationBody(n).rest }}</template>
                    </p>
                    <button
                      type="button"
                      class="notifications__trip-link"
                      @click="goToTrip(n.tripId, n.id)"
                    >
                      {{ tripRoute(n.tripId) }}
                    </button>
                    <p v-if="n.changeSummary" class="notifications__summary">{{ n.changeSummary }}</p>
                  </div>
                  <div class="notifications__aside">
                    <span v-if="!n.read" class="notifications__dot" aria-label="Непрочитано" />
                    <button
                      type="button"
                      class="notifications__dismiss"
                      aria-label="Убрать уведомление"
                      @click="dismissMutation.mutate(n.id)"
                    >
                      <X class="icon icon--sm" />
                    </button>
                  </div>
                </div>

                <div class="notifications__meta">
                  <span>{{ timeAgo(n.at) }}</span>
                  <template v-if="n.actorId && userFor(n.actorId)">
                    <span>·</span>
                    <button
                      type="button"
                      class="notifications__profile-link"
                      @click="goToProfile(n.actorId!, n.id)"
                    >
                      @{{ userFor(n.actorId)?.nickname }}
                    </button>
                  </template>
                </div>

                <div v-if="n.kind === 'request_incoming'" class="notifications__actions">
                  <button
                    type="button"
                    class="btn btn--primary btn--sm"
                    :disabled="acceptMutation.isPending.value || declineMutation.isPending.value"
                    @click="acceptMutation.mutate(n.id)"
                  >
                    <Check class="icon icon--sm" /> Принять
                  </button>
                  <button
                    type="button"
                    class="btn btn--secondary btn--sm"
                    :disabled="acceptMutation.isPending.value || declineMutation.isPending.value"
                    @click="declineMutation.mutate(n.id)"
                  >
                    <X class="icon icon--sm" /> Отклонить
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Teleport>
</template>
