<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ArrowLeftRight } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { api, getToken, transportLabel, type TransportType, type Trip } from "@/lib/api";

const props = defineProps<{
  tripId?: string;
  embedded?: boolean;
}>();

const emit = defineEmits<{
  success: [trip: Trip];
}>();

const router = useRouter();
const queryClient = useQueryClient();
const isEdit = computed(() => Boolean(props.tripId));

const tripQuery = useQuery({
  queryKey: computed(() => ["trip", props.tripId]),
  queryFn: () => api.trip(props.tripId!),
  enabled: computed(() => Boolean(props.tripId)),
});

const from = ref("");
const to = ref("");
const transport = ref<TransportType>("car");
const seats = ref(4);
const startDate = ref("");
const startTime = ref("");
const endDate = ref("");
const endTime = ref("");
const description = ref("");
const budget = ref("");

function toDateInput(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function toTimeInput(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(11, 16);
}

function fillFromTrip() {
  const trip = tripQuery.data.value;
  if (!trip) return;
  from.value = trip.from;
  to.value = trip.to;
  transport.value = trip.transport;
  seats.value = trip.seats;
  startDate.value = toDateInput(trip.startAt);
  startTime.value = toTimeInput(trip.startAt);
  endDate.value = toDateInput(trip.endAt);
  endTime.value = toTimeInput(trip.endAt);
  description.value = trip.description;
  budget.value = String(trip.budget ?? "");
}

watch(() => tripQuery.data.value, fillFromTrip, { immediate: true });

function swap() {
  const tmp = from.value;
  from.value = to.value;
  to.value = tmp;
}

function buildPayload() {
  return {
    from: from.value,
    to: to.value,
    startAt: new Date(`${startDate.value}T${startTime.value || "00:00"}`).toISOString(),
    endAt: new Date(`${endDate.value || startDate.value}T${endTime.value || startTime.value || "00:00"}`).toISOString(),
    transport: transport.value,
    seats: seats.value,
    budget: Number(budget.value) || 0,
    description: description.value.trim() || `${from.value} → ${to.value}`,
    info: description.value.trim(),
  };
}

const createMutation = useMutation({
  mutationFn: api.createTrip,
  onSuccess: async (trip) => {
    await queryClient.invalidateQueries({ queryKey: ["trips"] });
    emit("success", trip);
  },
});

const updateMutation = useMutation({
  mutationFn: () => api.updateTrip(props.tripId!, buildPayload()),
  onSuccess: async (trip) => {
    await queryClient.invalidateQueries({ queryKey: ["trips"] });
    await queryClient.invalidateQueries({ queryKey: ["trip", trip.id] });
    emit("success", trip);
  },
});

const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value);
const errorMessage = computed(
  () => createMutation.error.value?.message ?? updateMutation.error.value?.message ?? "",
);

function submit(e: Event) {
  e.preventDefault();
  if (!getToken()) {
    router.push("/auth");
    return;
  }
  if (isEdit.value) {
    updateMutation.mutate();
    return;
  }
  createMutation.mutate(buildPayload());
}
</script>

<template>
  <div :class="embedded ? 'create__dialog-body' : 'create__card'">
    <header class="create__header">
      <h1 class="create__title">{{ isEdit ? "Редактирование поездки" : "Создание поездки" }}</h1>
      <p class="create__subtitle">
        {{ isEdit ? "Обновите детали маршрута" : "Заполните детали вашего маршрута" }}
      </p>
    </header>

    <form class="create__form" @submit="submit">
      <section class="create__route">
        <div class="create__route-line">
          <div class="create__route-dot create__route-dot--start" />
          <div class="create__route-bar" />
          <div class="create__route-dot create__route-dot--end" />
        </div>
        <div class="create__route-fields">
          <div class="field">
            <label class="field__label field__label--inline">Откуда</label>
            <input v-model="from" class="input input--underline" placeholder="Город выезда" />
          </div>
          <div class="field">
            <label class="field__label field__label--inline">Куда</label>
            <input v-model="to" class="input input--underline" placeholder="Город прибытия" />
          </div>
        </div>
        <button type="button" class="create__swap-btn" aria-label="Поменять местами" @click="swap">
          <ArrowLeftRight class="icon icon--sm" />
        </button>
      </section>

      <section class="create__grid-2">
        <div class="field">
          <label class="field__label field__label--inline">Начало</label>
          <div class="create__date-row">
            <input v-model="startDate" type="date" class="create__soft-input" />
            <input v-model="startTime" type="time" class="create__soft-input" />
          </div>
        </div>
        <div class="field">
          <label class="field__label field__label--inline">Окончание</label>
          <div class="create__date-row">
            <input v-model="endDate" type="date" class="create__soft-input" />
            <input v-model="endTime" type="time" class="create__soft-input" />
          </div>
        </div>
      </section>

      <section class="create__grid-2">
        <div class="field">
          <label class="field__label field__label--inline">Транспорт</label>
          <div class="create__transport-grid">
            <button
              v-for="t in (['car', 'train', 'bus', 'plane'] as TransportType[])"
              :key="t"
              type="button"
              :class="['create__transport-btn', { 'create__transport-btn--active': transport === t }]"
              @click="transport = t"
            >
              {{ transportLabel[t] }}
            </button>
          </div>
        </div>
        <div class="field">
          <div class="create__seats-head">
            <label class="field__label field__label--inline">Свободных мест</label>
            <span class="create__seats-value">{{ seats }}</span>
          </div>
          <input v-model.number="seats" type="range" min="1" max="10" class="create__range" />
          <div class="create__range-labels"><span>1</span><span>10</span></div>
        </div>
      </section>

      <section class="field">
        <label class="field__label field__label--inline">Бюджет с человека</label>
        <div class="create__budget-wrap">
          <span class="create__budget-symbol">₽</span>
          <input
            v-model="budget"
            type="number"
            inputmode="numeric"
            min="0"
            step="100"
            class="create__budget-input"
            placeholder="800"
          />
          <button type="button" class="create__free-btn" @click="budget = '0'">Бесплатно</button>
        </div>
      </section>

      <section class="field">
        <label class="field__label field__label--inline">Комментарий к поездке</label>
        <textarea
          v-model="description"
          rows="2"
          class="textarea create__textarea"
          placeholder="Где встречаемся, багаж, музыка…"
        />
      </section>

      <div class="create__submit-wrap">
        <button
          type="submit"
          class="btn btn--hero create__submit"
          :disabled="isPending || !from.trim() || !to.trim() || !startDate"
        >
          {{
            isPending
              ? isEdit
                ? "Сохраняем..."
                : "Публикуем..."
              : isEdit
                ? "Сохранить изменения"
                : "Опубликовать поездку"
          }}
        </button>
        <p v-if="errorMessage" class="create__error">{{ errorMessage }}</p>
        <p class="create__legal">Нажимая кнопку, вы соглашаетесь с правилами сервиса ЕдемВместе</p>
      </div>
    </form>
  </div>
</template>
