<script setup lang="ts">
import { ref } from 'vue'

const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{ apply: [filters: { locationType: string; maxPrice: number | null }] }>()

const locationType = ref('')
const maxPrice = ref<number | null>(null)

function apply() {
  emit('apply', { locationType: locationType.value, maxPrice: maxPrice.value })
  open.value = false
}

function reset() {
  locationType.value = ''
  maxPrice.value = null
  apply()
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" @click.self="open = false">
        <div class="w-full max-w-md rounded-t-2xl bg-white dark:bg-slate-900 p-6 sm:rounded-2xl">
          <h3 class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Фильтры</h3>
          <div class="space-y-4">
            <div>
              <label class="label-field">Тип локации</label>
              <select v-model="locationType" class="input-field">
                <option value="">Все</option>
                <option value="city">Город</option>
                <option value="festival">Фестиваль</option>
                <option value="nature">Природа</option>
              </select>
            </div>
            <div>
              <label class="label-field">Макс. цена (₽)</label>
              <input v-model.number="maxPrice" type="number" class="input-field" placeholder="50000" />
            </div>
          </div>
          <div class="mt-6 flex gap-3">
            <button type="button" class="btn-secondary flex-1" @click="reset">Сбросить</button>
            <button type="button" class="btn-primary flex-1" @click="apply">Применить</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
