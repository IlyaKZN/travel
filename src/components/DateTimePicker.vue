<script setup lang="ts">
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-vue-next";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { computed, nextTick, onUnmounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    disabledDate?: (date: Date) => boolean;
  }>(),
  { placeholder: "Выберите дату и время" },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const viewMonth = ref(new Date());
const timeInput = ref("");
const timeDigits = ref("");
const timeInputRef = ref<HTMLInputElement | null>(null);

function parseISO(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

const selected = computed(() => parseISO(props.modelValue));

watch(
  () => props.modelValue,
  (value) => {
    const d = parseISO(value);
    timeDigits.value = d ? `${pad(d.getHours())}${pad(d.getMinutes())}` : "";
    timeInput.value = formatTimeDigits(timeDigits.value);
  },
  { immediate: true },
);

function commit(d: Date) {
  emit("update:modelValue", d.toISOString());
}

function formatTimeDigits(digits: string) {
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits.length === 2 ? `${digits}:` : digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function parsedFromDigits(digits: string): { h: number; m: number } | null {
  if (!digits) return null;

  let h: number;
  let m: number;
  if (digits.length <= 2) {
    h = Number(digits);
    m = 0;
  } else {
    h = Number(digits.slice(0, 2));
    m = Number(digits.slice(2).padEnd(2, "0").slice(0, 2));
  }

  if (Number.isNaN(h) || Number.isNaN(m) || h > 23 || m > 59) return null;
  return { h, m };
}

function placeTimeCursor() {
  void nextTick(() => {
    const el = timeInputRef.value;
    if (!el) return;
    const pos = timeInput.value.length;
    el.setSelectionRange(pos, pos);
  });
}

function updateTimeDisplay(finishOnBlur = false) {
  timeInput.value = formatTimeDigits(timeDigits.value);
  placeTimeCursor();

  if (timeDigits.value.length === 4) {
    const parsed = parsedFromDigits(timeDigits.value);
    if (parsed) commitTime(parsed);
    return;
  }

  if (finishOnBlur && timeDigits.value) {
    const parsed = parsedFromDigits(timeDigits.value);
    if (!parsed) return;
    timeDigits.value = `${pad(parsed.h)}${pad(parsed.m)}`;
    timeInput.value = `${pad(parsed.h)}:${pad(parsed.m)}`;
    commitTime(parsed);
  }
}

function commitTime(parsed: { h: number; m: number }) {
  const base = selected.value ?? new Date();
  const next = new Date(base);
  next.setHours(parsed.h, parsed.m, 0, 0);
  commit(next);
}

function selectDate(day: Date) {
  if (isDayDisabled(day)) return;
  const base = selected.value ?? new Date();
  const parsed =
    parsedFromDigits(timeDigits.value) ?? { h: base.getHours(), m: base.getMinutes() };
  const next = new Date(day);
  next.setHours(parsed.h, parsed.m, 0, 0);
  commit(next);
}

function onTimeKeydown(event: KeyboardEvent) {
  if (event.key === "Backspace") {
    event.preventDefault();
    timeDigits.value = timeDigits.value.slice(0, -1);
    updateTimeDisplay();
    return;
  }

  if (event.key === "Delete") {
    event.preventDefault();
    timeDigits.value = "";
    timeInput.value = "";
    return;
  }

  if (/^\d$/.test(event.key)) {
    event.preventDefault();
    if (timeDigits.value.length >= 4) return;
    timeDigits.value += event.key;
    updateTimeDisplay();
    return;
  }

  const allowed = ["Tab", "ArrowLeft", "ArrowRight", "Home", "End", "Escape"];
  if (allowed.includes(event.key)) return;
  if ((event.ctrlKey || event.metaKey) && ["a", "c", "v", "x"].includes(event.key.toLowerCase())) return;

  event.preventDefault();
}

function onTimePaste(event: ClipboardEvent) {
  event.preventDefault();
  const text = event.clipboardData?.getData("text") ?? "";
  timeDigits.value = text.replace(/\D/g, "").slice(0, 4);
  updateTimeDisplay(true);
}

function onTimeBlur() {
  if (!timeDigits.value) return;
  updateTimeDisplay(true);
}

const label = computed(() => {
  const d = selected.value;
  if (!d) return props.placeholder;
  return `${format(d, "d MMM yyyy", { locale: ru })} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
});

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const calendarDays = computed(() => {
  const monthStart = startOfMonth(viewMonth.value);
  const monthEnd = endOfMonth(viewMonth.value);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
});

const monthLabel = computed(() => format(viewMonth.value, "LLLL yyyy", { locale: ru }));

function prevMonth() {
  viewMonth.value = subMonths(viewMonth.value, 1);
}

function nextMonth() {
  viewMonth.value = addMonths(viewMonth.value, 1);
}

function toggleOpen() {
  open.value = !open.value;
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value || !root.value) return;
  if (!root.value.contains(event.target as Node)) open.value = false;
}

watch(open, (isOpen) => {
  if (isOpen) {
    viewMonth.value = selected.value ?? new Date();
    document.addEventListener("click", onDocumentClick);
  } else {
    document.removeEventListener("click", onDocumentClick);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick);
});

function isDayDisabled(day: Date) {
  return props.disabledDate?.(day) ?? false;
}

function isDaySelected(day: Date) {
  return selected.value ? isSameDay(day, selected.value) : false;
}
</script>

<template>
  <div ref="root" class="dt-picker">
    <button
      type="button"
      class="dt-picker__trigger"
      :class="{ 'dt-picker__trigger--empty': !selected }"
      @click.stop="toggleOpen"
    >
      <CalendarIcon class="icon icon--sm dt-picker__trigger-icon" />
      <span class="dt-picker__trigger-label">{{ label }}</span>
    </button>

    <div v-if="open" class="dt-picker__popover" @click.stop>
      <div class="dt-picker__calendar">
        <div class="dt-picker__nav">
          <button type="button" class="dt-picker__nav-btn" aria-label="Предыдущий месяц" @click="prevMonth">
            <ChevronLeft class="icon icon--sm" />
          </button>
          <span class="dt-picker__month">{{ monthLabel }}</span>
          <button type="button" class="dt-picker__nav-btn" aria-label="Следующий месяц" @click="nextMonth">
            <ChevronRight class="icon icon--sm" />
          </button>
        </div>

        <div class="dt-picker__weekdays">
          <span v-for="day in weekdays" :key="day" class="dt-picker__weekday">{{ day }}</span>
        </div>

        <div class="dt-picker__days">
          <button
            v-for="day in calendarDays"
            :key="day.toISOString()"
            type="button"
            :disabled="isDayDisabled(day)"
            :class="[
              'dt-picker__day',
              {
                'dt-picker__day--outside': !isSameMonth(day, viewMonth),
                'dt-picker__day--today': isToday(day),
                'dt-picker__day--selected': isDaySelected(day),
              },
            ]"
            @click="selectDate(day)"
          >
            {{ day.getDate() }}
          </button>
        </div>
      </div>

      <div class="dt-picker__time-row">
        <Clock class="icon icon--sm dt-picker__time-icon" />
        <label class="dt-picker__time-label">Время</label>
        <input
          ref="timeInputRef"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          :value="timeInput"
          class="dt-picker__time-input"
          placeholder="00:00"
          maxlength="5"
          @keydown="onTimeKeydown"
          @paste="onTimePaste"
          @blur="onTimeBlur"
        />
      </div>
    </div>
  </div>
</template>
