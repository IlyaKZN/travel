import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/HomePage.vue"),
      meta: { title: "Waymate — Найди попутчиков" },
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("@/views/AuthPage.vue"),
      meta: { title: "Вход — Waymate" },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/views/RegisterPage.vue"),
      meta: { title: "Регистрация — Waymate" },
    },
    {
      path: "/onboarding",
      name: "onboarding",
      component: () => import("@/views/OnboardingPage.vue"),
      meta: { title: "Добро пожаловать — Waymate" },
    },
    {
      path: "/create",
      name: "create",
      component: () => import("@/views/CreatePage.vue"),
      meta: { title: "Создать поездку — Waymate" },
    },
    {
      path: "/chats",
      name: "chats",
      component: () => import("@/views/ChatsPage.vue"),
      meta: { title: "Чаты — Waymate" },
    },
    {
      path: "/chats/:chatId",
      name: "chats-chat",
      component: () => import("@/views/ChatsPage.vue"),
      meta: { title: "Чат — Waymate" },
    },
    {
      path: "/chat/:chatId",
      name: "chat",
      redirect: (to) => ({ name: "chats-chat", params: { chatId: to.params.chatId } }),
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("@/views/ProfilePage.vue"),
      meta: { title: "Профиль — Waymate" },
    },
    {
      path: "/profile/:userId",
      name: "profile-user",
      component: () => import("@/views/ProfileUserPage.vue"),
      meta: { title: "Профиль — Waymate" },
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("@/views/SettingsPage.vue"),
      meta: { title: "Редактирование профиля — Waymate" },
    },
    {
      path: "/trip/:tripId",
      name: "trip",
      component: () => import("@/views/TripDetailPage.vue"),
      meta: { title: "Поездка — Waymate" },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundPage.vue"),
      meta: { title: "404 — Waymate" },
    },
  ],
});

export { router };
