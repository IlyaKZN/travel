<template>
  <div class="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 z-30 pointer-events-none">
    <span class="text-xs font-bold text-gray-800">9:41</span>
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-3xl" />
    <div class="flex items-center gap-1.5">
      <div class="flex gap-[2px] items-end h-3.5">
        <div
          v-for="(h, i) in [2, 3, 4, 5, 5]"
          :key="i"
          class="w-[3px] rounded-sm"
          :class="i < 4 ? 'bg-gray-800' : 'bg-gray-300'"
          :style="{ height: `${h * 2.5}px` }"
        />
      </div>
      <span class="text-[11px] font-bold text-gray-800">5G</span>
      <div class="w-6 h-3.5 rounded-sm border-[1.5px] border-gray-700 flex items-center px-[2px] relative">
        <div class="w-4 h-2 bg-emerald-500 rounded-[2px]" />
        <div class="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[3px] h-2 bg-gray-700 rounded-r-sm" />
      </div>
    </div>
  </div>
</template>
