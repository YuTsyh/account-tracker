<template>
  <span
    :class="['material-symbols-outlined block select-none', className]"
    style="line-height: inherit; font-size: inherit"
  >
    {{ name }}
  </span>
</template>

<script setup lang="ts">
defineProps({
  name: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    default: "",
  },
});
</script>
