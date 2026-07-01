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
      meta: { title: "ЕдемВместе — Найди попутчиков" },
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("@/views/AuthPage.vue"),
      meta: { title: "Вход — ЕдемВместе" },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/views/RegisterPage.vue"),
      meta: { title: "Регистрация — ЕдемВместе" },
    },
    {
      path: "/onboarding",
      name: "onboarding",
      component: () => import("@/views/OnboardingPage.vue"),
      meta: { title: "Добро пожаловать — ЕдемВместе" },
    },
    {
      path: "/create",
      name: "create",
      redirect: (to) => ({
        path: "/",
        query: to.query.tripId ? { openCreate: to.query.tripId } : { openCreate: "1" },
      }),
    },
    {
      path: "/chats",
      name: "chats",
      component: () => import("@/views/ChatsPage.vue"),
      meta: { title: "Чаты — ЕдемВместе" },
    },
    {
      path: "/chats/:chatId",
      name: "chats-chat",
      component: () => import("@/views/ChatsPage.vue"),
      meta: { title: "Чат — ЕдемВместе" },
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
      meta: { title: "Профиль — ЕдемВместе" },
    },
    {
      path: "/profile/:userId",
      name: "profile-user",
      component: () => import("@/views/ProfileUserPage.vue"),
      meta: { title: "Профиль — ЕдемВместе" },
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("@/views/SettingsPage.vue"),
      meta: { title: "Редактирование профиля — ЕдемВместе" },
    },
    {
      path: "/trip/:tripId",
      name: "trip",
      component: () => import("@/views/TripDetailPage.vue"),
      meta: { title: "Поездка — ЕдемВместе" },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundPage.vue"),
      meta: { title: "404 — ЕдемВместе" },
    },
  ],
});

export { router };
