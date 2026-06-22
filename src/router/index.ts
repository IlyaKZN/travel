import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: () => import('@/pages/LandingPage.vue') },
    { path: '/register', name: 'register', component: () => import('@/pages/RegisterPage.vue') },
    { path: '/confirm', name: 'confirm', component: () => import('@/pages/ConfirmPage.vue') },
    { path: '/create-profile', name: 'create-profile', component: () => import('@/pages/CreateProfilePage.vue') },
    { path: '/login', name: 'login', component: () => import('@/pages/LoginPage.vue') },
    { path: '/reset-password', name: 'reset-password', component: () => import('@/pages/ResetPasswordPage.vue') },
    { path: '/profile', name: 'profile', component: () => import('@/pages/ProfilePage.vue') },
    { path: '/profile/settings', name: 'profile-settings', component: () => import('@/pages/ProfileSettingsPage.vue') },
    { path: '/tours', name: 'tours', component: () => import('@/pages/ToursPage.vue') },
    { path: '/tours/create', name: 'create-tour', component: () => import('@/pages/CreateTourPage.vue') },
    { path: '/tours/:id', name: 'tour-detail', component: () => import('@/pages/TourDetailPage.vue') },
    { path: '/trips', name: 'trips', component: () => import('@/pages/TripsPage.vue') },
    { path: '/trips/create', name: 'create-trip', component: () => import('@/pages/CreateTripPage.vue') },
    { path: '/trips/:id', name: 'trip-detail', component: () => import('@/pages/TripDetailPage.vue') },
    { path: '/chats', name: 'chats', component: () => import('@/pages/ChatsPage.vue') },
    { path: '/chats/:id', name: 'chat-room', component: () => import('@/pages/ChatRoomPage.vue') },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
