<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-end justify-center"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="sheet-backdrop" @click="$emit('update:modelValue', false)"></div>
      <div
        class="animate-slide-up relative w-full max-w-md rounded-t-3xl bg-white p-6 pb-10 transition-colors dark:bg-gray-900"
      >
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-800 dark:text-gray-200">
            {{ $t("home.addRecord") }}
          </h2>
          <CloseButton @click="$emit('update:modelValue', false)" />
        </div>

        <div class="space-y-4">
          <!-- Type Toggle -->
          <div class="type-toggle-track">
            <button
              type="button"
              @click="form.type = 'expense'"
              :class="[
                'type-toggle-btn',
                form.type === 'expense'
                  ? 'type-toggle-btn--active-expense'
                  : 'type-toggle-btn--inactive',
              ]"
            >{{ $t("common.expense") }}</button>
            <button
              type="button"
              @click="form.type = 'income'"
              :class="[
                'type-toggle-btn',
                form.type === 'income'
                  ? 'type-toggle-btn--active-income'
                  : 'type-toggle-btn--inactive',
              ]"
            >{{ $t("common.income") }}</button>
          </div>

          <!-- Amount -->
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">NT$</span>
            <input
              v-model.number="form.amount"
              type="number"
              min="1"
              :placeholder="$t('common.amount')"
              class="input-field input-field-icon text-sm"
            />
          </div>

          <!-- Category Grid -->
          <div>
            <label class="label-text !text-xs">{{ $t("common.category") }}</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="cat in activeCats"
                :key="cat.id"
                @click="form.category = cat.name"
                type="button"
                :class="[
                  'cat-btn',
                  form.category === cat.name
                    ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-500 dark:bg-violet-900 dark:text-violet-300'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700',
                ]"
              >
                <CategoryIcon :name="cat.icon" class="mb-1 text-[28px]" />
                <span class="w-full truncate px-1 text-center text-xs font-medium">
                  {{ $te(`categories.${cat.id}`) ? $t(`categories.${cat.id}`) : cat.name }}
                </span>
              </button>
            </div>
          </div>

          <input v-model="form.date" type="date" class="input-field text-sm" />
          <input
            v-model="form.note"
            type="text"
            :placeholder="$t('common.note')"
            class="input-field text-sm"
          />

          <div class="flex gap-3 pt-1">
            <button
              @click="$emit('update:modelValue', false)"
              class="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {{ $t("common.cancel") }}
            </button>
            <button
              @click="submit"
              :disabled="!form.amount"
              class="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition-colors hover:bg-violet-700 disabled:bg-gray-300 disabled:dark:bg-gray-600"
            >
              {{ $t("common.save") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useTrackerStore } from "../../stores/tracker";
import CloseButton from "../CloseButton.vue";
import CategoryIcon from "../CategoryIcon.vue";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
}>();

const store = useTrackerStore();
const today = new Date().toISOString().split("T")[0];

const expenseCats = computed(() =>
  store.allCategories.filter((c) => c.type === "expense"),
);
const incomeCats = computed(() =>
  store.allCategories.filter((c) => c.type === "income"),
);

const activeCats = computed(() =>
  form.value.type === "expense" ? expenseCats.value : incomeCats.value,
);

const defaultForm = () => ({
  type: "expense" as "expense" | "income",
  amount: "" as number | "",
  category: expenseCats.value[0]?.name ?? "",
  date: today,
  note: "",
});

const form = ref(defaultForm());

watch(
  () => form.value.type,
  (newType) => {
    const cats = newType === "expense" ? expenseCats.value : incomeCats.value;
    if (!cats.find((c) => c.name === form.value.category)) {
      form.value.category = cats[0]?.name ?? "";
    }
  },
);

// Reset form when sheet closes
watch(
  () => props.modelValue,
  (open) => {
    if (!open) form.value = defaultForm();
  },
);

const submit = () => {
  if (!form.value.amount) return;
  store.addPersonalRecord({
    type: form.value.type,
    amount: Number(form.value.amount),
    category: form.value.category,
    date: form.value.date,
    note: form.value.note,
  });
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
