import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/api/client'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: () => import('@/pages/LandingPage.vue') },

    { path: '/auth', redirect: '/auth/login' },
    { path: '/auth/register', name: 'register', component: () => import('@/pages/RegisterPage.vue'), meta: { guest: true } },
    { path: '/auth/verify', name: 'verify', component: () => import('@/pages/ConfirmPage.vue'), meta: { guest: true } },
    { path: '/auth/login', name: 'login', component: () => import('@/pages/LoginPage.vue'), meta: { guest: true } },
    { path: '/auth/recover', name: 'recover', component: () => import('@/pages/ResetPasswordPage.vue'), meta: { guest: true } },

    { path: '/register', redirect: '/auth/register' },
    { path: '/confirm', redirect: '/auth/verify' },
    { path: '/login', redirect: '/auth/login' },
    { path: '/reset-password', redirect: '/auth/recover' },

    {
      path: '/profile/create',
      name: 'profile-create',
      component: () => import('@/pages/CreateProfilePage.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/create-profile', redirect: '/profile/create' },

    {
      path: '/profile/:userId',
      name: 'profile',
      component: () => import('@/pages/ProfilePage.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/profile', redirect: '/profile/me' },

    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/ProfileSettingsPage.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/profile/settings', redirect: '/settings' },

    { path: '/tours', name: 'tours', component: () => import('@/pages/ToursPage.vue') },
    {
      path: '/tours/create',
      name: 'create-tour',
      component: () => import('@/pages/CreateTourPage.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/tours/:id', name: 'tour-detail', component: () => import('@/pages/TourDetailPage.vue') },

    { path: '/trips', name: 'trips', component: () => import('@/pages/TripsPage.vue') },
    {
      path: '/trips/create',
      name: 'create-trip',
      component: () => import('@/pages/CreateTripPage.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/trips/:id', name: 'trip-detail', component: () => import('@/pages/TripDetailPage.vue') },

    { path: '/chats', name: 'chats', component: () => import('@/pages/ChatsPage.vue'), meta: { requiresAuth: true } },
    { path: '/chats/:id', name: 'chat-room', component: () => import('@/pages/ChatRoomPage.vue'), meta: { requiresAuth: true } },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const token = getToken()

  if (to.meta.requiresAuth && !token) {
    return { path: '/auth/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && token) {
    return { path: '/trips' }
  }
})

export default router
