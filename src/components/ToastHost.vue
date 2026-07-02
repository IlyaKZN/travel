<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-vue-next";
import { computed } from "vue";
import { dismiss, toastState, type ToastVariant } from "@/lib/notify";

const variantMeta: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; accent: string; iconModifier: string }
> = {
  success: {
    icon: CheckCircle2,
    accent: "toast__accent--success",
    iconModifier: "toast__icon--success",
  },
  info: {
    icon: Info,
    accent: "toast__accent--info",
    iconModifier: "toast__icon--info",
  },
  error: {
    icon: AlertTriangle,
    accent: "toast__accent--error",
    iconModifier: "toast__icon--error",
  },
};

const items = computed(() => toastState.items);
</script>

<template>
  <Teleport to="body">
    <div class="toast-host" aria-live="polite" aria-relevant="additions">
      <TransitionGroup name="toast" tag="div" class="toast-host__stack">
        <article
          v-for="item in items"
          :key="item.id"
          class="toast"
          role="status"
        >
          <div :class="['toast__accent', variantMeta[item.variant].accent]" aria-hidden="true" />
          <div class="toast__body">
            <div :class="['toast__icon', variantMeta[item.variant].iconModifier]" aria-hidden="true">
              <component :is="variantMeta[item.variant].icon" class="icon" :stroke-width="2.25" />
            </div>
            <div class="toast__copy">
              <p class="toast__title">{{ item.title }}</p>
              <p v-if="item.description" class="toast__description">{{ item.description }}</p>
            </div>
            <button
              type="button"
              class="toast__close"
              aria-label="Закрыть уведомление"
              @click="dismiss(item.id)"
            >
              <X class="icon icon--sm" />
            </button>
          </div>
        </article>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
