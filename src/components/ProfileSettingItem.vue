<template>
  <button
    type="button"
    :disabled="disabled"
    class="flex w-full items-center justify-between p-4 transition-all hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-700/50 dark:active:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none"
    :class="{ 'border-t border-gray-50 dark:border-gray-700': !isFirst }"
    @click="$emit('click')"
  >
    <div class="flex items-center gap-3">
      <div :class="['flex h-10 w-10 items-center justify-center rounded-xl transition-all', colorClasses, { 'animate-pulse': disabled }]">
        <CategoryIcon v-if="!disabled" :name="iconName" class="h-5 w-5" />
        <span v-else class="material-symbols-outlined spin-reverse text-[20px] leading-none flex items-center justify-center">sync</span>
      </div>
      <span class="font-bold text-gray-700 dark:text-gray-200">{{ title }}</span>
    </div>
    <div class="flex items-center gap-2">
      <slot name="right"></slot>
      <svg v-if="!disabled" class="h-5 w-5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <div v-else class="h-5 w-5 flex items-center justify-center">
        <div class="h-4 w-4 spin-reverse rounded-full border-2 border-gray-300 border-t-transparent"></div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import CategoryIcon from "./CategoryIcon.vue";

defineProps<{
  title: string;
  iconName: string;
  colorClasses: string;
  isFirst?: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  (e: "click"): void;
}>();
</script>

<style scoped>
.spin-reverse {
  animation: spin-ccw 1s linear infinite;
  transform-origin: center center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
@keyframes spin-ccw {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}
</style>
