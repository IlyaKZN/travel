<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppShell from "@/components/AppShell.vue";
import CreateTripForm from "@/components/CreateTripForm.vue";
import { createDialogStore } from "@/lib/dialog-stores";
import type { Trip } from "@/lib/api";

const route = useRoute();
const router = useRouter();
const tripId = route.query.tripId as string | undefined;

onMounted(() => {
  if (route.name === "create") {
    createDialogStore.open(tripId);
    router.replace("/");
  }
});

function onSuccess(trip: Trip) {
  router.push({ name: "trip", params: { tripId: trip.id } });
}
</script>

<template>
  <AppShell>
    <div class="container container--narrow create">
      <CreateTripForm :trip-id="tripId" @success="onSuccess" />
    </div>
  </AppShell>
</template>
