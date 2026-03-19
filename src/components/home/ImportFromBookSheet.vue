<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-end justify-center"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="sheet-backdrop" @click="$emit('update:modelValue', false)"></div>
      <div
        class="animate-slide-up relative w-full max-w-md rounded-t-3xl bg-white p-6 pb-12 transition-colors dark:bg-gray-900"
      >
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-800 dark:text-gray-200">
              {{ $t("home.importTitle") }}
            </h2>
            <p class="hint-text mt-1">{{ $t("home.importSubtitle") }}</p>
          </div>
          <CloseButton @click="$emit('update:modelValue', false)" />
        </div>

        <div v-if="store.books.length === 0" class="empty-state py-8 text-sm">
          <div class="mb-3 text-4xl">📭</div>
          {{ $t("home.noBooksForImport") }}
        </div>

        <div v-else class="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
          <div
            v-for="book in store.books"
            :key="book.id"
            class="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
          >
            <p class="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200">
              <span class="text-lg">📒</span> {{ book.name }}
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="member in book.members"
                :key="member.id"
                @click="handleImport(book.id, member.id, member.name, book.name)"
                class="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm transition-all hover:bg-violet-50 active:scale-95 dark:border-violet-700 dark:bg-gray-800 dark:text-violet-400"
              >
                <span class="text-xs font-normal text-gray-400 dark:text-gray-500">{{ $t("home.iAm") }}</span>
                {{ member.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useTrackerStore } from "../../stores/tracker";
import CloseButton from "../CloseButton.vue";

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
}>();

const store = useTrackerStore();

const handleImport = (
  bookId: string,
  memberId: string,
  memberName: string,
  bookName: string,
) => {
  const prev = store.currentBookId;
  store.selectBook(bookId);
  const stat = store.memberStats.find((s) => s.member.id === memberId);

  if (!stat || stat.owed <= 0) {
    alert(`「${memberName}」在「${bookName}」中沒有需要負擔的花費。`);
    if (prev) store.selectBook(prev);
    return;
  }

  if (
    confirm(
      `將「${memberName}」在「${bookName}」應負擔的 NT$ ${stat.owed.toLocaleString()} 匯入個人帳戶？`,
    )
  ) {
    store.importMyShareFromBook(memberId);
  }
  if (prev) store.selectBook(prev);
  emit("update:modelValue", false);
};
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
</style>
