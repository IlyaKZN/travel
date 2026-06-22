<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import TourCard from '@/components/TourCard.vue'
import FilterModal from '@/components/FilterModal.vue'
import { useStore } from '@/composables/useStore'

const { tours, fetchTours } = useStore()

const search = ref('')
const showFilter = ref(false)
const filters = ref({ locationType: '', maxPrice: null as number | null })
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    await fetchTours({
      search: search.value || undefined,
      locationType: filters.value.locationType || undefined,
      maxPrice: filters.value.maxPrice,
    })
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch([search, filters], load, { deep: true })

function applyFilters(f: typeof filters.value) {
  filters.value = f
}
</script>

<template>
  <div class="page-shell">
    <AppHeader title="Авторские туры" />

    <div class="page-container">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Авторские туры</h1>
        <RouterLink to="/tours/create" class="btn-primary">Создать тур</RouterLink>
      </div>

      <div class="mt-4 flex gap-2">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="search" type="text" class="input-field !pl-10" placeholder="Поиск тура..." />
        </div>
        <button type="button" class="btn-secondary !px-3" @click="showFilter = true">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      <p v-if="loading" class="py-8 text-center text-stone-400">Загрузка…</p>

      <div v-else class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TourCard v-for="tour in tours" :key="tour.id" :tour="tour" />
      </div>

      <p v-if="!loading && !tours.length" class="py-16 text-center text-slate-400 dark:text-slate-500">Туры не найдены</p>
    </div>

    <FilterModal v-model="showFilter" @apply="applyFilters" />
  </div>
</template>
