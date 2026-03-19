<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 px-6"
  >
    <div class="w-full max-w-sm">
      <!-- Logo / Icon -->
      <div class="mb-8 text-center">
        <div
          class="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20"
        >
          <svg
            class="h-10 w-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-white">{{ $t("setup.title") }}</h1>
        <p class="mt-2 text-sm text-blue-200">{{ $t("setup.subtitle") }}</p>
      </div>

      <!-- Card -->
      <div class="rounded-3xl bg-white p-6 shadow-2xl">
        <h2 class="mb-1 text-lg font-bold text-gray-800">{{ $t("setup.namePrompt") }}</h2>
        <p class="mb-5 text-sm text-gray-400">
          {{ $t("setup.nameDescription") }}
        </p>

        <input
          v-model="name"
          @keyup.enter="submit"
          type="text"
          :placeholder="$t('setup.namePlaceholder')"
          maxlength="20"
          autofocus
          class="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-800 outline-none transition-colors focus:border-blue-500"
        />

        <button
          @click="submit"
          :disabled="!name.trim()"
          class="mt-4 w-full rounded-2xl bg-blue-600 py-4 text-base font-bold text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {{ $t("setup.startButton") }} →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useTrackerStore } from "../stores/tracker";

const store = useTrackerStore();
const router = useRouter();
const name = ref("");

const submit = () => {
  if (!name.value.trim()) return;
  store.updateUserProfile(name.value);
  router.replace("/");
};
</script>
