<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { Home, Plus, MessageCircle, User } from "lucide-vue-next";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { api, getToken } from "@/lib/api";
import { avatarClass, avatarStyle } from "@/lib/avatar";

const route = useRoute();
const hideChrome = computed(
  () =>
    route.path === "/onboarding" ||
    route.path === "/auth" ||
    route.path === "/register",
);

const meQuery = useQuery({
  queryKey: ["me"],
  queryFn: api.me,
  enabled: Boolean(getToken()),
  retry: false,
});

const isAuthenticated = computed(() => Boolean(getToken() && meQuery.data.value));
const initial = computed(() => meQuery.data.value?.firstName?.[0] ?? meQuery.data.value?.nickname?.[0] ?? "?");

const topLinks = [
  { to: "/", label: "Поездки", exact: true },
  { to: "/chats", label: "Чаты", exact: false },
  { to: "/profile", label: "Профиль", exact: false },
] as const;

const bottomItems = [
  { to: "/", label: "Главная", icon: Home, exact: true },
  { to: "/create", label: "Создать", icon: Plus, exact: false },
  { to: "/chats", label: "Чаты", icon: MessageCircle, exact: false },
  { to: "/profile", label: "Профиль", icon: User, exact: false },
] as const;
</script>

<template>
  <div class="app-shell">
    <header v-if="!hideChrome" class="app-shell__header">
      <div class="app-shell__header-inner">
        <RouterLink to="/" class="app-shell__logo">
          <span class="app-shell__logo-icon">
            <img src="/favicon.png" alt="" class="app-shell__logo-image" />
          </span>
          <span class="app-shell__logo-text">ЕдемВместе</span>
        </RouterLink>
        <nav class="app-shell__nav">
          <RouterLink
            v-for="l in topLinks"
            :key="l.to"
            :to="l.to"
            class="app-shell__nav-link"
            active-class="app-shell__nav-link--active"
            :exact-active-class="l.exact ? 'app-shell__nav-link--active' : undefined"
          >
            {{ l.label }}
          </RouterLink>
        </nav>
        <div class="app-shell__actions">
          <RouterLink to="/create" class="app-shell__create-btn">
            <Plus class="icon icon--sm" /> Создать поездку
          </RouterLink>
          <RouterLink
            :to="getToken() ? '/profile' : '/auth'"
            :class="['app-shell__avatar-link', avatarClass(meQuery.data.value)]"
            :style="avatarStyle(meQuery.data.value, 'var(--secondary)')"
          >
            <span v-if="isAuthenticated">{{ initial }}</span>
            <User v-else class="icon icon--sm" />
          </RouterLink>
        </div>
      </div>
    </header>

    <main :class="['app-shell__main', { 'app-shell__main--with-nav': !hideChrome }]">
      <slot />
    </main>

    <nav v-if="!hideChrome" class="app-shell__bottom-nav">
      <ul class="app-shell__bottom-list">
        <li v-for="item in bottomItems" :key="item.to">
          <RouterLink
            :to="item.to"
            class="app-shell__bottom-link"
            active-class="app-shell__bottom-link--active"
            :exact-active-class="item.exact ? 'app-shell__bottom-link--active' : undefined"
          >
            <component :is="item.icon" class="icon" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
