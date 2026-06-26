<script setup lang="ts">
import { tripAvatarColors, tripInitials } from "@/lib/format";

const props = defineProps<{
  from: string;
  to: string;
  size?: number;
}>();
</script>

<template>
  <div
    class="trip-avatar"
    :style="{
      width: `${props.size ?? 56}px`,
      height: `${props.size ?? 56}px`,
      background: `linear-gradient(135deg, ${tripAvatarColors(props.from, props.to).bg}, ${tripAvatarColors(props.from, props.to).fg})`,
      fontSize: `${(props.size ?? 56) * 0.36}px`,
    }"
  >
    {{ tripInitials(props.from, props.to) }}
  </div>
</template>
