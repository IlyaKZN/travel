<script setup lang="ts">
import { ref, computed } from 'vue'
import { TRIPS } from '@/lib/mockData'
import type { Trip, DmConversation } from '@/lib/mockData'
import type { Screen, Tab } from '@/types'
import { DESKTOP_BREAKPOINT } from '@/types'
import { useIsDesktop } from '@/composables/useIsDesktop'
import DesktopApp from '@/components/desktop/DesktopApp.vue'
import BottomNav from '@/components/BottomNav.vue'
import OnboardingScreen from '@/components/mobile/OnboardingScreen.vue'
import HomeScreen from '@/components/mobile/HomeScreen.vue'
import TripDetailScreen from '@/components/mobile/TripDetailScreen.vue'
import CreateTripScreen from '@/components/mobile/CreateTripScreen.vue'
import ChatsListScreen from '@/components/mobile/ChatsListScreen.vue'
import ChatScreen from '@/components/mobile/ChatScreen.vue'
import DmChatScreen from '@/components/mobile/DmChatScreen.vue'
import ProfileScreen from '@/components/mobile/ProfileScreen.vue'

const isDesktop = useIsDesktop()

const screen = ref<Screen>(
  typeof window !== 'undefined' && window.innerWidth < DESKTOP_BREAKPOINT && !localStorage.getItem('waymate-onboarded')
    ? 'onboarding'
    : 'home',
)
const activeTab = ref<Tab>('home')
const selectedTrip = ref<Trip>(TRIPS[0])
const selectedDm = ref<DmConversation | null>(null)

const showMobileNav = computed(() =>
  !['onboarding', 'detail', 'tripChat', 'dmChat'].includes(screen.value),
)

const desktopScreen = computed({
  get: () => (screen.value === 'onboarding' ? 'home' : screen.value),
  set: (s: Screen) => { screen.value = s },
})

function handleTabChange(tab: Tab) {
  activeTab.value = tab
  const map: Record<Tab, Screen> = { home: 'home', create: 'create', chat: 'chat', profile: 'profile' }
  screen.value = map[tab]
  if (tab === 'chat') {
    selectedDm.value = null
  }
}

function handleOnboardingComplete() {
  localStorage.setItem('waymate-onboarded', '1')
  screen.value = 'home'
  activeTab.value = 'home'
}
</script>

<template>
  <DesktopApp
    v-if="isDesktop"
    v-model:screen="desktopScreen"
    v-model:selected-trip="selectedTrip"
  />

  <div v-else class="h-[100dvh] flex flex-col bg-background overflow-hidden">
    <div class="flex-1 overflow-hidden">
      <OnboardingScreen v-if="screen === 'onboarding'" @start="handleOnboardingComplete" />
      <HomeScreen
        v-else-if="screen === 'home'"
        @trip-select="(t) => { selectedTrip = t; screen = 'detail' }"
      />
      <TripDetailScreen
        v-else-if="screen === 'detail'"
        :trip="selectedTrip"
        @back="screen = 'home'"
        @join="() => { selectedDm = null; screen = 'chat'; activeTab = 'chat' }"
      />
      <CreateTripScreen
        v-else-if="screen === 'create'"
        @back="() => { screen = 'home'; activeTab = 'home' }"
      />
      <ChatsListScreen
        v-else-if="screen === 'chat'"
        @trip-chat="(t) => { selectedTrip = t; screen = 'tripChat' }"
        @dm-chat="(dm) => { selectedDm = dm; screen = 'dmChat' }"
      />
      <ChatScreen
        v-else-if="screen === 'tripChat'"
        :trip="selectedTrip"
        @back="screen = 'chat'"
      />
      <DmChatScreen
        v-else-if="screen === 'dmChat' && selectedDm"
        :dm="selectedDm"
        @back="() => { selectedDm = null; screen = 'chat' }"
      />
      <ProfileScreen v-else-if="screen === 'profile'" />
    </div>
    <BottomNav v-if="showMobileNav" :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>
