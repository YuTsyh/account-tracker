<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex flex-col justify-end"
      @click.self="close"
    >
      <!-- 1. Background (Top Area): Category Selector -->
      <div class="flex-1 w-full overflow-y-auto bg-black/40 backdrop-blur-sm p-4 pt-12 pb-6 custom-scrollbar" @click.self="close">
        <div class="mx-auto w-full max-w-md">
          <div class="grid grid-cols-4 sm:grid-cols-5 gap-y-6 gap-x-2">
            <button
              v-for="cat in activeCats" :key="cat.id"
              type="button"
              @click="form.categoryId = cat.id"
              class="flex flex-col items-center gap-1.5 transition-all group"
              :class="form.categoryId === cat.id ? 'scale-110 opacity-100' : 'opacity-80 hover:opacity-100'"
            >
              <div
                class="flex h-12 w-12 items-center justify-center rounded-2xl text-[24px] transition-all"
                :class="form.categoryId === cat.id ? (form.type === 'expense' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30') : 'bg-white/80 text-gray-700 dark:bg-gray-800/80 dark:text-gray-300'"
              >
                <CategoryIcon :name="cat.icon" />
              </div>
              <span class="text-xs font-bold text-center leading-tight whitespace-nowrap text-white drop-shadow-md">
                {{ $te(`categories.${cat.id}`) ? $t(`categories.${cat.id}`) : cat.name }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Foreground (Bottom Sheet): Add Record Form -->
      <section
        class="animate-slide-up relative flex max-h-[70vh] w-full flex-col rounded-t-[2rem] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transition-colors dark:bg-gray-900 pb-safe"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="sheetTitleId"
        :aria-describedby="sheetSubtitleId"
      >
        <div class="mx-auto w-full max-w-md flex flex-col h-full">
          <!-- Handle -->
          <div class="absolute -top-3 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/50 backdrop-blur-md dark:bg-gray-600/50"></div>

          <!-- Header -->
          <div class="z-10 flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4 transition-colors dark:border-gray-800">
            <div>
              <h2 :id="sheetTitleId" class="font-bold text-gray-800 dark:text-gray-200 text-lg">
                {{ $t("recordSheet.title") }}
              </h2>
              <p :id="sheetSubtitleId" class="text-[11px] font-medium text-gray-500 mt-0.5">{{ $t("recordSheet.subtitle", { name: bookName }) }}</p>
            </div>
            
            <div class="flex items-center gap-2">
              <!-- Type Toggle (Small, Top Right, Single click to toggle) -->
              <button
                type="button"
                @click="form.type = form.type === 'expense' ? 'income' : 'expense'"
                class="flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800 active:scale-95 transition-transform"
              >
                <div
                  :class="[
                    'px-2.5 py-1 text-xs font-bold rounded-md transition-all',
                    form.type === 'expense'
                      ? 'bg-white text-red-700 shadow-sm dark:bg-gray-700 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                  ]"
                >{{ $t("common.expense") }}</div>
                <div
                  :class="[
                    'px-2.5 py-1 text-xs font-bold rounded-md transition-all',
                    form.type === 'income'
                      ? 'bg-white text-emerald-700 shadow-sm dark:bg-gray-700 dark:text-emerald-400'
                      : 'text-gray-500 dark:text-gray-400'
                  ]"
                >{{ $t("common.income") }}</div>
              </button>

              <CloseButton @click="close" class="!p-1.5 bg-gray-100 dark:bg-gray-800 rounded-full" />
            </div>
          </div>

          <!-- Body Form -->
          <form
            @submit.prevent="handleSubmit"
            class="custom-scrollbar flex-1 overflow-y-auto px-6 py-4"
          >
            <!-- Templates Quick Select -->
            <div v-if="!editRecordId && store.recordTemplates.length > 0" class="-mx-2 mb-4">
              <div class="flex items-center gap-2 overflow-x-auto px-2 pb-1 no-scrollbar">
                <button
                  v-for="tpl in store.recordTemplates"
                  :key="tpl.id"
                  @click="applyTemplate(tpl.id)"
                  type="button"
                  class="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50/50 px-3 py-1.5 text-xs font-bold text-gray-600 transition-all hover:bg-gray-100 active:scale-95 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <div 
                    class="flex h-5 w-5 items-center justify-center rounded-full"
                    :class="[getTemplateColorClass(tpl.category)]"
                  >
                    <CategoryIcon :name="getTemplateIcon(tpl.category)" style="transform: scale(0.6);" />
                  </div>
                  {{ tpl.name }}
                </button>
              </div>
            </div>

            <!-- Fields Sequential Layout -->
            <div class="space-y-4">
              
              <!-- 1. Date -->
              <div class="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                <span class="material-symbols-outlined text-gray-400 text-xl">calendar_today</span>
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 w-16 shrink-0">{{ $t("common.date") }}</label>
                <input
                  v-model="form.date"
                  type="date"
                  required
                  @click="($event.target as HTMLInputElement).showPicker?.()"
                  @focus="($event.target as HTMLInputElement).showPicker?.()"
                  class="flex-1 bg-transparent text-right font-bold text-gray-800 dark:text-gray-200 outline-none w-full cursor-pointer relative z-10"
                />
              </div>

              <!-- 2. Amount -->
              <div class="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                <span class="material-symbols-outlined text-gray-400 text-xl">attach_money</span>
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 w-16 shrink-0">{{ $t("common.amount") }}</label>
                <div class="flex-1 flex items-center justify-end gap-1">
                  <span class="text-gray-400 font-semibold text-sm">NT$</span>
                  <input
                    v-model="form.amountStr"
                    type="text"
                    inputmode="none"
                    @focus="showKeyboard = true"
                    required
                    placeholder="0"
                    class="w-full bg-transparent text-right text-xl font-bold text-gray-800 outline-none dark:text-gray-100 caret-violet-500"
                  />
                </div>
              </div>

              <CalculatorKeyboard 
                v-if="showKeyboard"
                v-model="form.amountStr"
                @submit="showKeyboard = false"
                class="mt-1 mb-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl"
              />

              <div v-show="!showKeyboard" class="space-y-4 animate-fade-in">
                <!-- 3. Category Display -->
                <div class="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span class="material-symbols-outlined text-gray-400 text-xl">category</span>
                  <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 w-16 shrink-0">{{ $t("common.category") }}</label>
                  <div class="flex-1 flex items-center justify-end gap-2 text-right">
                    <span class="text-sm font-bold" :class="form.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'">
                      {{ $te(`categories.${currentCategoryId}`) ? $t(`categories.${currentCategoryId}`) : (currentCategoryObj?.name || $t('common.select')) }}
                    </span>
                    <div v-if="currentCategoryId" class="flex h-6 w-6 items-center justify-center rounded-[6px] text-white shadow-sm" :class="form.type === 'expense' ? 'bg-red-600' : 'bg-emerald-600'">
                      <CategoryIcon :name="currentCategoryIcon" class="text-[14px]" />
                    </div>
                  </div>
                </div>

                <!-- 4. Note -->
                <div class="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <span class="material-symbols-outlined text-gray-400 text-xl">edit_note</span>
                  <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 w-16 shrink-0">{{ $t("common.note") }}</label>
                  <input
                    v-model="form.note"
                    type="text"
                    :placeholder="$t('common.note')"
                    class="flex-1 bg-transparent text-right font-medium text-gray-800 dark:text-gray-200 outline-none w-full"
                  />
                </div>

                <!-- Shared: Paid By & Split Among (Preserved layout, tightly matching standard inputs) -->
                <div v-if="form.type === 'expense'" class="space-y-4 pt-2 mt-2">
                  
                  <!-- Paid By -->
                  <div class="flex flex-col gap-2 pt-2">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-gray-400 text-xl">person</span>
                      <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">{{ $t("recordSheet.paidBy") }}</label>
                    </div>
                    <div class="flex flex-wrap gap-2 pl-7">
                      <button
                        v-for="m in members"
                        :key="'paid-' + m.id"
                        type="button"
                        @click="form.paidById = m.id"
                        :class="[
                          'rounded-lg border px-3 py-1.5 text-xs font-bold transition-all',
                          form.paidById === m.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-400 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700',
                        ]"
                      >
                        {{ m.name }}
                      </button>
                    </div>
                  </div>

                  <!-- Split Among -->
                  <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors dark:border-gray-700/50 dark:bg-gray-800/50 mt-2">
                    <div class="mb-2 flex items-center justify-between">
                      <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-gray-400 text-[18px]">group</span>
                        {{ $t("recordSheet.splitAmong") }}
                      </label>
                      <button
                        type="button"
                        @click="toggleAll"
                        class="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {{
                          form.splitAmongIds.length === members.length
                            ? $t("recordSheet.unselectAll")
                            : $t("recordSheet.selectAll")
                        }}
                      </button>
                    </div>
                    <div class="flex flex-wrap gap-2 pl-4">
                      <button
                        v-for="m in members"
                        :key="m.id"
                        type="button"
                        @click="toggleMember(m.id)"
                        :class="[
                          'rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all',
                          form.splitAmongIds.includes(m.id)
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/40 dark:text-blue-300 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400',
                        ]"
                      >
                        {{ m.name }}
                      </button>
                    </div>
                    <p
                      v-if="form.splitAmongIds.length > 0 && isValidAmount"
                      class="mt-2 text-right text-xs font-bold text-blue-600 dark:text-blue-400"
                    >
                      {{
                        $t("recordSheet.splitPerPerson", {
                          amount: Math.floor(
                            Number(form.amountStr) / form.splitAmongIds.length,
                          ).toLocaleString(),
                        })
                      }}
                    </p>
                  </div>
                </div>

                <!-- Save as Template -->
                <div v-if="!editRecordId" class="flex items-center gap-2.5 px-1 py-1">
                  <input
                    id="saveAsTemplate"
                    v-model="shouldSaveAsTemplate"
                    type="checkbox"
                    class="h-4.5 w-4.5 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label for="saveAsTemplate" class="cursor-pointer text-xs font-bold text-gray-500 dark:text-gray-400">
                    {{ $t("templates.saveAsTemplate") }}
                  </label>
                </div>

                <!-- Submit Button -->
                <BaseButton
                  type="submit"
                  :disabled="
                    !isValidAmount || (form.type === 'expense' && form.splitAmongIds.length === 0)
                  "
                  class="mt-2 w-full shadow-lg shadow-blue-600/20"
                >
                  {{ $t("common.save") }}
                </BaseButton>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import { useTrackerStore } from "../../stores/tracker";
import type { Member } from "../../stores/tracker";
import { colorMap } from "../../utils/category";
import BaseButton from "../BaseButton.vue";
import CloseButton from "../CloseButton.vue";
import CategoryIcon from "../CategoryIcon.vue";
import CalculatorKeyboard from "../CalculatorKeyboard.vue";

const props = defineProps<{
  modelValue: boolean;
  bookName: string;
  members: Member[];
  editRecordId?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const store = useTrackerStore();
const today = new Date().toISOString().split("T")[0];
const baseId = useId();
const sheetTitleId = `${baseId}-title`;
const sheetSubtitleId = `${baseId}-subtitle`;

const defaultForm = () => ({
  type: "expense" as "expense" | "income",
  amountStr: "",
  categoryId: "",
  paidById: props.members[0]?.id ?? "",
  splitAmongIds: props.members.map((m) => m.id),
  date: today,
  note: "",
});

const form = ref(defaultForm());
const showKeyboard = ref(false);
const shouldSaveAsTemplate = ref(false);

const expenseCats = computed(() =>
  store.allCategories.filter((c) => c.type === "expense"),
);
const incomeCats = computed(() =>
  store.allCategories.filter((c) => c.type === "income"),
);
const activeCats = computed(() =>
  form.value.type === "expense" ? expenseCats.value : incomeCats.value,
);

const currentCategoryObj = computed(() =>
  activeCats.value.find((c) => c.id === form.value.categoryId)
);
const currentCategoryId = computed(() => form.value.categoryId);
const currentCategoryIcon = computed(() => currentCategoryObj.value?.icon ?? "category");


const evaluateAmount = () => {
  const str = form.value.amountStr.trim();
  if (!str) return;
  if (/^[\d+\-*/. ()]+$/.test(str)) {
    try {
      const result = new Function(`return ${str}`)();
      if (!isNaN(result) && result > 0) {
        form.value.amountStr = String(Math.floor(result));
      }
    } catch {
      // ignore
    }
  }
};

const isValidAmount = computed(() => {
  const v = Number(form.value.amountStr);
  return !isNaN(v) && v > 0;
});

const applyTemplate = (templateId: string) => {
  const t = store.recordTemplates.find((x) => x.id === templateId);
  if (!t) return;
  
  form.value.type = t.type;
  form.value.categoryId = t.category;
  form.value.amountStr = t.amount !== null ? String(t.amount) : "";
  form.value.note = t.note || "";
  
  if (t.amount === null) {
    showKeyboard.value = true;
  }
};

const getTemplateIcon = (categoryId: string) => {
  return store.allCategories.find((c) => c.id === categoryId)?.icon ?? "more_horiz";
};

const getTemplateColorClass = (categoryId: string) => {
  const color = store.allCategories.find((c) => c.id === categoryId)?.color ?? "gray";
  const styles = colorMap[color] ?? colorMap.gray;
  return `${styles.bg} ${styles.text}`;
};

// Reset & sync category when type changes or sheet opens
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      shouldSaveAsTemplate.value = false;
      if (props.editRecordId) {
        const r = store.records.find(x => x.id === props.editRecordId);
        if (r) {
          const cat = store.allCategories.find(c => c.name === r.category && c.type === r.type);
          form.value = {
            type: r.type,
            amountStr: String(r.amount),
            categoryId: cat?.id || r.category,
            paidById: r.paidById,
            splitAmongIds: [...r.splitAmongIds],
            date: r.date,
            note: r.note,
          };
          return;
        }
      }
      const reset = defaultForm();
      reset.categoryId = expenseCats.value[0]?.id ?? "";
      form.value = reset;
      showKeyboard.value = true;
    } else {
      showKeyboard.value = false;
    }
  },
);

watch(
  () => form.value.type,
  (newType) => {
    const cats = newType === "expense" ? expenseCats.value : incomeCats.value;
    if (!cats.find((c) => c.id === form.value.categoryId)) {
      form.value.categoryId = cats[0]?.id ?? "";
    }
  },
);

const toggleMember = (id: string) => {
  const idx = form.value.splitAmongIds.indexOf(id);
  if (idx >= 0) {
    form.value.splitAmongIds.splice(idx, 1);
  } else {
    form.value.splitAmongIds.push(id);
  }
};

const toggleAll = () => {
  const all = props.members.map((m) => m.id);
  form.value.splitAmongIds =
    form.value.splitAmongIds.length === all.length ? [] : [...all];
};

const close = () => emit("update:modelValue", false);

const handleSubmit = () => {
  evaluateAmount();
  const amt = Number(form.value.amountStr);
  if (!amt || isNaN(amt) || amt <= 0) return;
  const isExpense = form.value.type === "expense";
  if (isExpense && form.value.splitAmongIds.length === 0) return;

  const data = {
    type: form.value.type,
    amount: amt,
    category: currentCategoryObj.value?.name || form.value.categoryId,
    date: form.value.date,
    note: form.value.note,
    paidById: isExpense ? form.value.paidById : "",
    splitAmongIds: isExpense ? form.value.splitAmongIds : [],
  };

  if (props.editRecordId) {
    store.updateRecord(props.editRecordId, data);
  } else {
    store.addRecord(data);
    
    // Save as template if requested
    if (shouldSaveAsTemplate.value) {
      store.addTemplate({
        name: form.value.note || currentCategoryObj.value?.name || form.value.categoryId,
        type: form.value.type,
        category: form.value.categoryId,
        amount: amt,
        note: form.value.note,
      });
    }
  }
  close();
};
</script>
