<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import CreateTripForm from "@/components/CreateTripForm.vue";
import GoogleIcon from "@/components/GoogleIcon.vue";
import { createDialogStore } from "@/lib/dialog-stores";
import type { Trip } from "@/lib/api";

const router = useRouter();
const open = computed(() => createDialogStore.state.open);
const tripId = computed(() => createDialogStore.state.tripId);

function close() {
  createDialogStore.close();
}

function onSuccess(trip: Trip) {
  createDialogStore.close();
  if (tripId.value) {
    router.push({ name: "trip", params: { tripId: trip.id } });
  } else {
    router.push("/");
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="app-dialog"
      role="dialog"
      aria-modal="true"
      :aria-label="tripId ? 'Редактирование поездки' : 'Создание поездки'"
      @click.self="close"
    >
      <div class="app-dialog__panel app-dialog__panel--create">
        <button type="button" class="app-dialog__close" aria-label="Закрыть" @click="close">
          <GoogleIcon name="close" class="icon" />
        </button>
        <CreateTripForm :key="tripId ?? 'new'" :trip-id="tripId" embedded @success="onSuccess" />
      </div>
    </div>
  </Teleport>
</template>
