<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { Home, Plus, MessageCircle, User, Bell } from "lucide-vue-next";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import CreateTripDialog from "@/components/CreateTripDialog.vue";
import NotificationsDialog from "@/components/NotificationsDialog.vue";
import { api, getToken } from "@/lib/api";
import { avatarClass, avatarStyle } from "@/lib/avatar";
import { createDialogStore, notificationsDialogStore } from "@/lib/dialog-stores";

const route = useRoute();
const router = useRouter();
const hideChrome = computed(
  () =>
    route.path === "/onboarding" ||
    route.path === "/auth" ||
    route.path === "/register",
);

const showMobileBell = computed(() => {
  if (hideChrome.value) return false;
  if (route.path.startsWith("/chats/") && route.path !== "/chats/") return false;
  return true;
});

const meQuery = useQuery({
  queryKey: ["me"],
  queryFn: api.me,
  enabled: Boolean(getToken()),
  retry: false,
});

const notificationsQuery = useQuery({
  queryKey: ["notifications"],
  queryFn: api.notifications,
  enabled: Boolean(getToken()),
  retry: false,
});

const isAuthenticated = computed(() => Boolean(getToken() && meQuery.data.value));
const initial = computed(() => meQuery.data.value?.firstName?.[0] ?? meQuery.data.value?.nickname?.[0] ?? "?");
const unread = computed(() => (notificationsQuery.data.value ?? []).filter((n) => !n.read).length);

const topLinks = [
  { to: "/", label: "Поездки", exact: true },
  { to: "/chats", label: "Чаты", exact: false },
  { to: "/profile", label: "Профиль", exact: false },
] as const;

const bottomItems = [
  { to: "/", label: "Главная", icon: Home, exact: true },
  { to: "/chats", label: "Чаты", icon: MessageCircle, exact: false },
  { to: "/profile", label: "Профиль", icon: User, exact: false },
] as const;

function openCreate(tripId?: string) {
  if (!getToken()) {
    void router.push("/auth");
    return;
  }
  createDialogStore.open(tripId);
}

function openNotifications() {
  if (!getToken()) {
    void router.push("/auth");
    return;
  }
  notificationsDialogStore.open();
}
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
          <button
            type="button"
            class="app-shell__bell-btn"
            aria-label="Уведомления"
            @click="openNotifications"
          >
            <Bell class="icon icon--sm" />
            <span v-if="unread > 0" class="app-shell__bell-badge">{{ unread }}</span>
          </button>
          <button type="button" class="app-shell__create-btn" @click="openCreate()">
            <Plus class="icon icon--sm" /> Создать поездку
          </button>
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

    <button
      v-if="showMobileBell"
      type="button"
      class="app-shell__mobile-bell"
      aria-label="Уведомления"
      @click="openNotifications"
    >
      <Bell class="icon" />
      <span v-if="unread > 0" class="app-shell__mobile-bell-badge">{{ unread }}</span>
    </button>

    <main :class="['app-shell__main', { 'app-shell__main--with-nav': !hideChrome }]">
      <slot />
    </main>

    <nav v-if="!hideChrome" class="app-shell__bottom-nav">
      <ul class="app-shell__bottom-list">
        <li>
          <RouterLink
            to="/"
            class="app-shell__bottom-link"
            active-class="app-shell__bottom-link--active"
            exact-active-class="app-shell__bottom-link--active"
          >
            <Home class="icon" />
            <span>Главная</span>
          </RouterLink>
        </li>
        <li>
          <button type="button" class="app-shell__bottom-link app-shell__bottom-link--button" @click="openCreate()">
            <Plus class="icon" />
            <span>Создать</span>
          </button>
        </li>
        <li v-for="item in bottomItems.slice(1)" :key="item.to">
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

    <CreateTripDialog />
    <NotificationsDialog />
  </div>
</template>
