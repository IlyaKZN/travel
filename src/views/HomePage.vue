<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { Search, Car, Train, Bus, Plane } from "lucide-vue-next";
import { computed, ref } from "vue";
import AppShell from "@/components/AppShell.vue";
import TripCard from "@/components/TripCard.vue";
import { api, type TransportType } from "@/lib/api";

const transports: { key: TransportType | "all"; label: string; icon?: typeof Car; modifier?: string }[] = [
  { key: "all", label: "Все" },
  { key: "car", label: "Авто", icon: Car, modifier: "transport-icon--car" },
  { key: "train", label: "Поезд", icon: Train, modifier: "transport-icon--train" },
  { key: "bus", label: "Автобус", icon: Bus, modifier: "transport-icon--bus" },
  { key: "plane", label: "Самолёт", icon: Plane, modifier: "transport-icon--plane" },
];

const seatOptions = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4+" },
] as const;

const tripsQuery = useQuery({ queryKey: ["trips"], queryFn: api.trips });
const filter = ref<TransportType | "all">("all");
const minSeats = ref(1);
const query = ref("");

const filtered = computed(() => {
  const trips = tripsQuery.data.value ?? [];
  return trips.filter((t) => {
    if (filter.value !== "all" && t.transport !== filter.value) return false;
    if (t.seats - t.taken < minSeats.value) return false;
    if (query.value && !`${t.from} ${t.to}`.toLowerCase().includes(query.value.toLowerCase())) return false;
    return true;
  });
});

const hasActiveFilters = computed(
  () => filter.value !== "all" || minSeats.value > 1 || query.value,
);

function resetFilters() {
  minSeats.value = 1;
  filter.value = "all";
  query.value = "";
}
</script>

<template>
  <AppShell>
    <section class="hero">
      <div class="hero__glow hero__glow--amber" />
      <div class="hero__glow hero__glow--rose" />
      <div class="hero__fade" />
      <div class="container hero__inner">
        <div class="home__hero-mobile hide-desktop">
          <div>
            <p class="home__hero-brand">waymate</p>
            <h1 class="home__hero-title">Путешествуй вместе</h1>
          </div>
          <RouterLink to="/profile" class="home__profile-link">A</RouterLink>
        </div>
        <div class="home__hero-desktop show-desktop">
          <p class="home__hero-subtitle">Поездки с компанией</p>
          <h1 class="home__hero-heading">
            Новые места,
            <span class="home__hero-gradient">новые друзья.</span>
          </h1>
          <p class="home__hero-desc">
            Собирай компанию для поездки, делись впечатлениями и заводи знакомства, которые
            остаются с тобой после возвращения домой.
          </p>
        </div>

        <div class="home__search">
          <div class="home__search-glow" />
          <div class="home__search-bar">
            <span class="home__search-icon-wrap">
              <Search class="icon" :stroke-width="2.5" />
            </span>
            <input
              v-model="query"
              class="input input--transparent home__search-input"
              placeholder="Откуда — куда (напр. Москва)"
            />
            <button type="button" class="btn--pill-search">Искать</button>
          </div>
        </div>
      </div>
    </section>

    <div class="container home__content">
      <div class="home__section-head">
        <h2 class="title home__section-title">Ближайшие поездки</h2>
        <span class="home__section-count">{{ filtered.length }} найдено</span>
      </div>

        <div class="home__filters">
          <button
            v-for="t in transports"
            :key="t.key"
            type="button"
            :class="['home__filter-btn', { 'home__filter-btn--active': filter === t.key }]"
            @click="filter = t.key"
          >
            <span
              v-if="t.icon"
              :class="[
                'home__filter-icon',
                filter === t.key ? 'home__filter-icon--active' : t.modifier,
              ]"
            >
              <component :is="t.icon" class="icon icon--sm" :stroke-width="2" />
            </span>
            {{ t.label }}
          </button>

          <div class="home__filters-divider" />

          <div class="home__seats-filter">
          <span class="home__seats-label">Свободных мест:</span>
          <div class="home__seats-options">
            <button
              v-for="opt in seatOptions"
              :key="opt.value"
              type="button"
              :class="['home__seats-btn', { 'home__seats-btn--active': minSeats === opt.value }]"
              @click="minSeats = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <button v-if="hasActiveFilters" type="button" class="home__reset-btn" @click="resetFilters">
          Сбросить
        </button>
      </div>

      <div class="grid-trips">
        <div v-if="tripsQuery.isLoading.value" class="home__state">Загружаем поездки...</div>
        <div v-if="tripsQuery.isError.value" class="home__state home__state--error">
          Не удалось загрузить поездки.
        </div>
        <TripCard v-for="t in filtered" :key="t.id" :trip="t" />
        <div v-if="!tripsQuery.isLoading.value && filtered.length === 0" class="card card--dashed home__empty">
          <p class="text-muted">Ничего не нашли по фильтрам.</p>
        </div>
      </div>
    </div>
  </AppShell>
</template>
