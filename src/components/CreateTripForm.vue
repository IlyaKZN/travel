<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ArrowLeftRight, Plus, X } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import DateTimePicker from "@/components/DateTimePicker.vue";
import { api, getToken, suggestedTripTags, transportLabel, type TransportType, type Trip } from "@/lib/api";
import { notify } from "@/lib/notify";

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
const startAt = ref("");
const endAt = ref("");
const description = ref("");
const budget = ref("");
const tags = ref<string[]>([]);
const tagDraft = ref("");

const TAGS_MAX = 8;

function fillFromTrip() {
  const trip = tripQuery.data.value;
  if (!trip) return;
  from.value = trip.from;
  to.value = trip.to;
  transport.value = trip.transport;
  seats.value = trip.seats;
  startAt.value = trip.startAt;
  endAt.value = trip.endAt;
  description.value = trip.description;
  budget.value = String(trip.budget ?? "");
  tags.value = [...(trip.tags ?? [])];
}

function isEndDateDisabled(day: Date) {
  if (!startAt.value) return false;
  const startDay = new Date(new Date(startAt.value).setHours(0, 0, 0, 0));
  return day < startDay;
}

function toggleTag(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return;
  if (tags.value.includes(trimmed)) {
    tags.value = tags.value.filter((tag) => tag !== trimmed);
    return;
  }
  if (tags.value.length >= TAGS_MAX) return;
  tags.value = [...tags.value, trimmed];
}

function addTagFromDraft() {
  const trimmed = tagDraft.value.trim();
  if (!trimmed || tags.value.includes(trimmed) || tags.value.length >= TAGS_MAX) return;
  tags.value = [...tags.value, trimmed];
  tagDraft.value = "";
}

function onTagDraftKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === ",") {
    event.preventDefault();
    addTagFromDraft();
  }
}

const availableSuggestedTags = computed(() => suggestedTripTags.filter((tag) => !tags.value.includes(tag)));

watch(() => tripQuery.data.value, fillFromTrip, { immediate: true });

function swap() {
  const tmp = from.value;
  from.value = to.value;
  to.value = tmp;
}

function buildPayload() {
  const now = new Date().toISOString();
  return {
    from: from.value,
    to: to.value,
    startAt: startAt.value || now,
    endAt: endAt.value || startAt.value || now,
    transport: transport.value,
    seats: seats.value,
    budget: Number(budget.value) || 0,
    description: description.value.trim() || `${from.value} → ${to.value}`,
    info: description.value.trim(),
    tags: tags.value,
  };
}

const createMutation = useMutation({
  mutationFn: api.createTrip,
  onSuccess: async (trip) => {
    await queryClient.invalidateQueries({ queryKey: ["trips"] });
    notify.success("Поездка создана", { description: `${trip.from} → ${trip.to} опубликовано` });
    emit("success", trip);
  },
  onError: (error: Error) => {
    notify.error("Не удалось создать поездку", { description: error.message });
  },
});

const updateMutation = useMutation({
  mutationFn: () => api.updateTrip(props.tripId!, buildPayload()),
  onSuccess: async (trip) => {
    await queryClient.invalidateQueries({ queryKey: ["trips"] });
    await queryClient.invalidateQueries({ queryKey: ["trip", trip.id] });
    notify.success("Поездка обновлена", { description: `${trip.from} → ${trip.to}` });
    emit("success", trip);
  },
  onError: (error: Error) => {
    notify.error("Не удалось сохранить изменения", { description: error.message });
  },
});

const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value);

function submit(e: Event) {
  e.preventDefault();
  if (!getToken()) {
    router.push("/auth");
    return;
  }
  if (!from.value.trim() || !to.value.trim()) {
    notify.error("Заполните маршрут", { description: "Укажите города отправления и назначения." });
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
            <label class="field__label field__label--inline">
              Откуда<span class="field__required" aria-hidden="true">*</span>
            </label>
            <input v-model="from" class="input input--underline" placeholder="Город выезда" />
          </div>
          <div class="field">
            <label class="field__label field__label--inline">
              Куда<span class="field__required" aria-hidden="true">*</span>
            </label>
            <input v-model="to" class="input input--underline" placeholder="Город прибытия" />
          </div>
        </div>
        <button type="button" class="create__swap-btn" aria-label="Поменять местами" @click="swap">
          <ArrowLeftRight class="icon icon--sm" />
        </button>
      </section>

      <section class="create__grid-2">
        <div class="field">
          <label class="field__label field__label--inline">
            Начало<span class="field__required" aria-hidden="true">*</span>
          </label>
          <div class="create__datetime-wrap">
            <DateTimePicker v-model="startAt" placeholder="Когда выезжаете" />
          </div>
        </div>
        <div class="field">
          <label class="field__label field__label--inline">Окончание</label>
          <div class="create__datetime-wrap">
            <DateTimePicker
              v-model="endAt"
              placeholder="Когда прибываете"
              :disabled-date="isEndDateDisabled"
            />
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
        <div class="create__tags-head">
          <label class="field__label field__label--inline">Теги</label>
          <span class="create__tags-count">{{ tags.length }}/{{ TAGS_MAX }}</span>
        </div>
        <p class="create__tags-hint">Помогают попутчикам понять настроение поездки</p>

        <div v-if="tags.length > 0" class="create__tags-list">
          <span v-for="tag in tags" :key="tag" class="create__tag-chip">
            {{ tag }}
            <button
              type="button"
              class="create__tag-remove"
              :aria-label="`Удалить тег ${tag}`"
              @click="toggleTag(tag)"
            >
              <X class="icon icon--xs" :stroke-width="2.5" />
            </button>
          </span>
        </div>

        <div class="create__tag-input-wrap">
          <input
            v-model="tagDraft"
            maxlength="24"
            class="create__tag-input"
            placeholder="Свой тег и Enter"
            @keydown="onTagDraftKeydown"
          />
          <button
            type="button"
            class="create__tag-add-btn"
            :disabled="!tagDraft.trim() || tags.length >= TAGS_MAX"
            @click="addTagFromDraft"
          >
            <Plus class="icon icon--xs" :stroke-width="2.5" /> Добавить
          </button>
        </div>

        <div v-if="availableSuggestedTags.length > 0" class="create__tag-suggestions">
          <button
            v-for="tag in availableSuggestedTags"
            :key="tag"
            type="button"
            class="create__tag-suggestion"
            :disabled="tags.length >= TAGS_MAX"
            @click="toggleTag(tag)"
          >
            + {{ tag }}
          </button>
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
          :disabled="isPending || !from.trim() || !to.trim() || !startAt"
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
        <p class="create__legal">Нажимая кнопку, вы соглашаетесь с правилами сервиса ЕдемВместе</p>
      </div>
    </form>
  </div>
</template>
