<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { Edit3, MapPin, MessageCircle, Send, Car, Train, Bus, Plane, LogOut } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import AppShell from "@/components/AppShell.vue";
import TripAvatar from "@/components/TripAvatar.vue";
import { api, getToken, transportLabel, type Review, type TransportType } from "@/lib/api";
import { formatDate } from "@/lib/format";

const props = defineProps<{ userId?: string; owner?: boolean }>();

const router = useRouter();

const transportMeta: Record<TransportType, { icon: typeof Car; modifier: string }> = {
  car: { icon: Car, modifier: "transport-icon--car" },
  train: { icon: Train, modifier: "transport-icon--train" },
  bus: { icon: Bus, modifier: "transport-icon--bus" },
  plane: { icon: Plane, modifier: "transport-icon--plane" },
};

const queryClient = useQueryClient();
const meQuery = useQuery({
  queryKey: ["me"],
  queryFn: api.me,
  enabled: Boolean(getToken()),
  retry: false,
});
const userQuery = useQuery({
  queryKey: computed(() => ["user", props.userId]),
  queryFn: () => api.user(props.userId!),
  enabled: Boolean(props.userId) && !props.owner,
});
const usersQuery = useQuery({ queryKey: ["users"], queryFn: api.users });
const tripsQuery = useQuery({ queryKey: ["trips"], queryFn: api.trips });

const u = computed(() => (props.owner ? meQuery.data.value : userQuery.data.value));
const profileUserId = computed(() => u.value?.id);

const reviewsQuery = useQuery({
  queryKey: computed(() => ["reviews", profileUserId.value]),
  queryFn: () => api.reviews(profileUserId.value!),
  enabled: computed(() => Boolean(profileUserId.value)),
});
const reviews = computed(() => reviewsQuery.data.value ?? []);

const reviewText = ref("");
const reviewError = ref("");
const showAllTrips = ref(false);
const isLoggedIn = computed(() => Boolean(getToken()));

const reviewMutation = useMutation({
  mutationFn: () => api.createReview(profileUserId.value!, reviewText.value.trim()),
  onSuccess: (newReview) => {
    reviewText.value = "";
    reviewError.value = "";
    queryClient.setQueryData<Review[]>(["reviews", profileUserId.value], (old) => [
      newReview,
      ...(old ?? []),
    ]);
  },
  onError: (error: Error) => {
    reviewError.value = error.message;
  },
});

const logoutMutation = useMutation({
  mutationFn: api.logout,
  onSuccess: async () => {
    queryClient.clear();
    await router.push("/auth");
  },
});

const isSubmittingReview = computed(() => reviewMutation.isPending.value);
const isLoggingOut = computed(() => logoutMutation.isPending.value);

const pastTrips = computed(() =>
  (tripsQuery.data.value ?? []).filter(
    (trip) => u.value && trip.participantIds.includes(u.value.id) && new Date(trip.startAt) < new Date(),
  ),
);

function reviewAuthor(id: string) {
  return (usersQuery.data.value ?? []).find((user) => user.id === id) ?? meQuery.data.value ?? u.value;
}

function submitReview(e: Event) {
  e.preventDefault();
  if (!getToken()) {
    router.push("/auth");
    return;
  }
  if (!reviewText.value.trim() || !u.value) return;
  reviewError.value = "";
  reviewMutation.mutate();
}

function logout() {
  logoutMutation.mutate();
}
</script>

<template>
  <AppShell>
    <div v-if="owner && !getToken()" class="container profile__gate">
      <h1 class="title title--md">Войдите в профиль</h1>
      <p class="text-muted">Профиль, настройки и чаты доступны после входа.</p>
      <RouterLink to="/auth" class="btn btn--primary btn--md" style="margin-top: 1.5rem">Войти</RouterLink>
    </div>

    <div v-else-if="!u" class="state-box">Загружаем профиль...</div>

    <template v-else>
      <div class="profile__cover">
        <div class="profile__cover-glow" />
      </div>

      <div class="container profile__content">
        <div class="profile__card">
          <div class="profile__head">
            <span class="avatar profile__avatar" :style="{ background: u.avatarColor }">
              {{ u.firstName[0] }}
            </span>
            <div style="min-width: 0">
              <h1 class="profile__name">{{ u.firstName }} {{ u.lastName }}</h1>
              <div class="profile__location">
                <span class="profile__location-item">
                  <MapPin class="icon icon--sm" /> {{ u.location }}
                </span>
              </div>
            </div>
            <div v-if="owner" class="profile__actions">
              <RouterLink to="/settings" class="profile__action-btn profile__action-btn--secondary">
                <Edit3 class="icon icon--sm" /> Редактировать
              </RouterLink>
              <button
                type="button"
                class="profile__action-btn profile__action-btn--secondary profile__action-btn--muted"
                :disabled="isLoggingOut"
                @click="logout"
              >
                <LogOut class="icon icon--sm" /> Выйти
              </button>
            </div>
            <div v-else class="profile__actions">
              <RouterLink
                :to="getToken() ? '/chats' : '/auth'"
                class="profile__action-btn profile__action-btn--hero"
              >
                <MessageCircle class="icon icon--sm" /> Написать
              </RouterLink>
            </div>
          </div>
          <p class="profile__bio">{{ u.bio }}</p>
        </div>

        <section class="profile__section">
          <h2 class="profile__section-title">Прошлые поездки</h2>
          <div class="profile__trips">
            <div
              v-for="t in (showAllTrips ? pastTrips : pastTrips.slice(0, 4))"
              :key="t.id"
              class="profile__trip-item"
            >
              <TripAvatar :from="t.from" :to="t.to" :size="48" />
              <div style="min-width: 0; flex: 1">
                <div class="profile__trip-meta">
                  <span :class="['profile__trip-icon', transportMeta[t.transport].modifier]">
                    <component :is="transportMeta[t.transport].icon" class="icon icon--sm" />
                  </span>
                  <span>{{ transportLabel[t.transport] }}</span>
                </div>
                <h3 class="profile__trip-route">{{ t.from }} → {{ t.to }}</h3>
                <p class="profile__trip-date">{{ formatDate(t.startAt) }}</p>
              </div>
            </div>
          </div>
          <div class="profile__more-wrap">
            <button
              type="button"
              class="btn btn--secondary btn--md"
              @click="showAllTrips = !showAllTrips"
            >
              {{ showAllTrips ? "Свернуть" : `Показать все (${pastTrips.length})` }}
            </button>
          </div>
        </section>

        <section class="profile__section">
          <h2 class="profile__section-title">Отзывы попутчиков</h2>

          <form v-if="!owner && isLoggedIn" class="profile__review-form" @submit="submitReview">
            <h3 class="profile__review-title">Оставить отзыв</h3>
            <p class="profile__review-hint">Поделись впечатлением о поездке с {{ u.firstName }}</p>
            <textarea
              v-model="reviewText"
              rows="3"
              class="textarea profile__review-textarea"
              placeholder="Как прошла поездка? Что понравилось?"
            />
            <p v-if="reviewError" class="profile__review-error">{{ reviewError }}</p>
            <div class="profile__review-actions">
              <button
                type="submit"
                class="btn btn--hero btn--md"
                :disabled="!reviewText.trim() || isSubmittingReview"
              >
                <Send class="icon icon--sm" /> Отправить
              </button>
            </div>
          </form>

          <div v-else-if="!owner && !isLoggedIn" class="card card--dashed state-box">
            <RouterLink to="/auth" class="btn btn--primary btn--md">Войти, чтобы оставить отзыв</RouterLink>
          </div>

          <div class="profile__reviews">
            <div v-for="r in reviews" :key="r.id" class="profile__review-item">
              <div class="profile__review-head">
                <span
                  class="avatar profile__review-avatar"
                  :style="{ background: reviewAuthor(r.authorId)?.avatarColor }"
                >
                  {{ reviewAuthor(r.authorId)?.firstName[0] }}
                </span>
                <div class="profile__review-author">
                  {{ reviewAuthor(r.authorId)?.firstName }} {{ reviewAuthor(r.authorId)?.lastName }}
                </div>
              </div>
              <p class="profile__review-text">{{ r.text }}</p>
            </div>
            <div v-if="reviews.length === 0" class="card card--dashed state-box">
              Отзывов пока нет.
            </div>
          </div>
        </section>
      </div>
    </template>
  </AppShell>
</template>
