<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import { useRoute } from "vue-router";
import ProfileView from "@/components/ProfileView.vue";
import { api, getToken } from "@/lib/api";

const route = useRoute();
const userId = computed(() => route.params.userId as string);

const meQuery = useQuery({
  queryKey: ["me"],
  queryFn: api.me,
  enabled: Boolean(getToken()),
  retry: false,
});

const isOwner = computed(() => userId.value === meQuery.data.value?.id);
</script>

<template>
  <ProfileView :user-id="userId" :owner="isOwner" />
</template>
