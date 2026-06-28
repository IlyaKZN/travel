<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { ArrowLeftRight } from "lucide-vue-next";
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppShell from "@/components/AppShell.vue";
import { api, getToken, transportLabel, type TransportType } from "@/lib/api";

const router = useRouter();
const queryClient = useQueryClient();
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

function swap() {
  const tmp = from.value;
  from.value = to.value;
  to.value = tmp;
}

const createMutation = useMutation({
  mutationFn: api.createTrip,
  onSuccess: async (trip) => {
    await queryClient.invalidateQueries({ queryKey: ["trips"] });
    router.push({ name: "trip", params: { tripId: trip.id } });
  },
});

function submit(e: Event) {
  e.preventDefault();
  if (!getToken()) {
    router.push("/auth");
    return;
  }
  createMutation.mutate({
    from: from.value,
    to: to.value,
    startAt: new Date(`${startDate.value}T${startTime.value || "00:00"}`).toISOString(),
    endAt: new Date(`${endDate.value || startDate.value}T${endTime.value || startTime.value || "00:00"}`).toISOString(),
    transport: transport.value,
    seats: seats.value,
    budget: Number(budget.value) || 0,
    description: description.value.trim() || `${from.value} → ${to.value}`,
    info: description.value.trim(),
  });
}
</script>

<template>
  <AppShell>
    <div class="container container--narrow create">
      <div class="create__card">
        <header class="create__header">
          <h1 class="create__title">Создание поездки</h1>
          <p class="create__subtitle">Заполните детали вашего маршрута</p>
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
              :disabled="createMutation.isPending.value || !from.trim() || !to.trim() || !startDate"
            >
              {{ createMutation.isPending.value ? "Публикуем..." : "Опубликовать поездку" }}
            </button>
            <p v-if="createMutation.isError.value" class="create__error">
              {{ createMutation.error.value?.message }}
            </p>
            <p class="create__legal">
              Нажимая кнопку, вы соглашаетесь с правилами сервиса ЕдемВместе
            </p>
          </div>
        </form>
      </div>
    </div>
  </AppShell>
</template>
