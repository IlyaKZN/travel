<script setup lang="ts">
import { ArrowRight, Car, Train, Bus, Plane } from "lucide-vue-next";
import { computed } from "vue";
import type { Trip, TransportType } from "@/lib/api";
import { formatDate, formatTime, formatBudget } from "@/lib/format";

const props = defineProps<{ trip: Trip }>();

const transportMeta: Record<TransportType, { icon: typeof Car; modifier: string }> = {
  car: { icon: Car, modifier: "transport-icon--car" },
  train: { icon: Train, modifier: "transport-icon--train" },
  bus: { icon: Bus, modifier: "transport-icon--bus" },
  plane: { icon: Plane, modifier: "transport-icon--plane" },
};

const meta = computed(() => transportMeta[props.trip.transport]);
const organizer = computed(
  () =>
    props.trip.organizer ??
    props.trip.participants?.find((user) => user.id === props.trip.organizerId),
);
const seatsLeft = computed(() => Math.max(0, props.trip.seats - props.trip.taken));
const seatsFresh = computed(() => seatsLeft.value >= 2);
const seatsLabel = computed(() => (seatsLeft.value === 1 ? "место" : "места"));
</script>

<template>
  <RouterLink :to="{ name: 'trip', params: { tripId: trip.id } }" class="trip-card">
    <div class="trip-card__head">
      <div class="trip-card__route-wrap">
        <div class="trip-card__route">
          <span class="trip-card__city">{{ trip.from }}</span>
          <ArrowRight class="trip-card__arrow icon icon--sm" :stroke-width="2.5" />
          <span class="trip-card__city">{{ trip.to }}</span>
        </div>
        <p class="trip-card__date">{{ formatDate(trip.startAt) }} · {{ formatTime(trip.startAt) }}</p>
      </div>
      <div :class="['trip-card__icon-wrap', meta.modifier]">
        <component :is="meta.icon" class="icon" :stroke-width="1.75" />
      </div>
    </div>

    <div class="trip-card__footer">
      <div class="trip-card__organizer">
        <div
          class="avatar trip-card__organizer-avatar"
          :style="{ backgroundColor: organizer?.avatarColor ?? '#94a3b8' }"
        >
          {{ organizer?.firstName?.[0] }}
        </div>
        <div class="trip-card__organizer-info">
          <p class="trip-card__organizer-name">
            {{ organizer?.firstName }} {{ organizer?.lastName }}
          </p>
          <p class="trip-card__organizer-role">Организатор</p>
        </div>
      </div>
      <div class="trip-card__badges">
        <div class="trip-card__budget-badge">
          <span>≈ {{ formatBudget(trip.budget) }}</span>
        </div>
        <div :class="['trip-card__seats-badge', { 'trip-card__seats-badge--fresh': seatsFresh }]">
          <span :class="['trip-card__seats-dot', { 'trip-card__seats-dot--pulse': seatsFresh }]" />
          <span class="trip-card__seats-text">{{ seatsLeft }} {{ seatsLabel }}</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
