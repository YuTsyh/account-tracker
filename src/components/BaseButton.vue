<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'flex w-full items-center justify-center rounded-xl py-3.5 text-base font-semibold shadow-md transition-colors disabled:cursor-not-allowed',
      variantClasses[variant],
    ]"
    @click="$emit('click', $event)"
  >
    <slot name="icon"></slot>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps({
  type: {
    type: String as () => "button" | "submit" | "reset",
    default: "button",
  },
  variant: {
    type: String as () => "primary" | "secondary" | "danger",
    default: "primary",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click"]);

const variantClasses = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300",
  secondary:
    "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-50",
  danger:
    "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-red-300",
};
</script>
