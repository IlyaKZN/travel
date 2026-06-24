<script setup lang="ts">
import { ref } from 'vue'
import type { Trip, DmConversation } from '@/lib/mockData'
import DesktopNavbar from './DesktopNavbar.vue'
import DesktopHome from './DesktopHome.vue'
import DesktopTripDetail from './DesktopTripDetail.vue'
import DesktopCreateModal from './DesktopCreateModal.vue'
import DesktopChat from './DesktopChat.vue'
import DesktopProfile from './DesktopProfile.vue'

const screen = defineModel<import('@/types').Screen>('screen', { required: true })
const selectedTrip = defineModel<Trip>('selectedTrip', { required: true })

const showCreate = ref(false)
const selectedDm = ref<DmConversation | null>(null)
</script>

<template>
  <div class="desktop-app">
    <DesktopNavbar
      :active-screen="screen"
      @navigate="screen = $event"
      @create-click="showCreate = true"
    />

    <div class="desktop-app__content">
      <DesktopHome
        v-if="screen === 'home'"
        @trip-select="(t) => { selectedTrip = t; screen = 'detail' }"
        @create-click="showCreate = true"
      />
      <DesktopTripDetail
        v-else-if="screen === 'detail'"
        :trip="selectedTrip"
        @back="screen = 'home'"
        @join="() => { selectedDm = null; screen = 'chat' }"
      />
      <DesktopChat
        v-else-if="screen === 'chat'"
        :trip="selectedTrip"
        :selected-dm="selectedDm"
        @select-trip="(t) => { selectedTrip = t; selectedDm = null }"
        @select-dm="(dm) => { selectedDm = dm }"
      />
      <DesktopProfile v-else-if="screen === 'profile'" />
    </div>

    <DesktopCreateModal v-if="showCreate" @close="showCreate = false" />
  </div>
</template>
