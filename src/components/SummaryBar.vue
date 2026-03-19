<template>
  <div class="grid grid-cols-3 gap-3">
    <div class="rounded-2xl bg-white/15 p-3 text-center">
      <p :class="['text-xs', labelClass]">總支出</p>
      <p class="mt-0.5 font-bold text-white" :class="valueClass">
        {{ totalExpense.toLocaleString() }}
      </p>
    </div>
    <div class="rounded-2xl bg-white/15 p-3 text-center">
      <p :class="['text-xs', labelClass]">總收入</p>
      <p class="mt-0.5 font-bold text-white" :class="valueClass">
        {{ totalIncome.toLocaleString() }}
      </p>
    </div>
    <div class="rounded-2xl bg-white/15 p-3 text-center">
      <p :class="['text-xs', labelClass]">淨額</p>
      <p
        class="mt-0.5 font-bold"
        :class="[valueClass, balance < 0 ? 'text-red-300' : 'text-green-300']"
      >
        {{ balance.toLocaleString() }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalExpense: number;
  totalIncome: number;
  balance: number;
  /** Tailwind class for the label (e.g. 'text-violet-200', 'text-blue-200') */
  labelClass?: string;
  /** Tailwind class for the value font size (e.g. 'text-lg', 'text-base') */
  valueClass?: string;
}>();
</script>
