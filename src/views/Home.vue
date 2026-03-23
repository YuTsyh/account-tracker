<template>
  <div class="page-container min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
    <!-- Header -->
    <div class="rounded-b-3xl bg-gradient-to-br from-indigo-500 to-purple-600 px-6 pb-8 pt-10 text-white shadow-lg">
      <SummaryBar
        :totalExpense="filteredExpense"
        :totalIncome="filteredIncome"
        :balance="filteredBalance"
        labelClass="text-violet-200"
        valueClass="text-lg"
      />
    </div>

    <!-- Personal Records -->
    <div class="mt-3 px-4">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="section-title">{{ $t("home.personalRecords") }}</h2>
        <span class="section-count">{{ $t("home.totalRecords", { count: filteredPersonalRecords.length }) }}</span>
      </div>

      <!-- Controls Row: Always visible so user can import even if empty -->
      <div class="relative mb-3 mt-1 flex items-center gap-2">
        <!-- Invisible Overlay to close popups -->
        <div
          v-if="showFilterMenu || showImportMenu"
          @click="showFilterMenu = false; showImportMenu = false"
          class="fixed inset-0 z-10"
        ></div>

        <MonthSelector :mode="filterMode" v-model="selectedMonth" class="flex-1" :class="{ 'opacity-50 pointer-events-none': filterMode === 'all' }" />
        
        <!-- Filter Dropdown -->
        <div class="relative">
          <button
            @click="showFilterMenu = !showFilterMenu; showImportMenu = false"
            class="relative z-20 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          
          <transition name="slide-up">
            <div v-if="showFilterMenu" class="absolute right-0 top-12 z-20 w-36 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
              <button
                @click="setFilterMode('all')"
                :class="['w-full px-4 py-3 text-left text-sm font-bold transition-colors hover:bg-gray-50 dark:hover:bg-gray-700', filterMode === 'all' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200']"
              >
                {{ $t('filter.all') }}
              </button>
              <div class="h-px bg-gray-100 dark:bg-gray-700/50"></div>
              <button
                @click="setFilterMode('year')"
                :class="['w-full px-4 py-3 text-left text-sm font-bold transition-colors hover:bg-gray-50 dark:hover:bg-gray-700', filterMode === 'year' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200']"
              >
                {{ $t('filter.year') }}
              </button>
              <div class="h-px bg-gray-100 dark:bg-gray-700/50"></div>
              <button
                @click="setFilterMode('month')"
                :class="['w-full px-4 py-3 text-left text-sm font-bold transition-colors hover:bg-gray-50 dark:hover:bg-gray-700', filterMode === 'month' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200']"
              >
                {{ $t('filter.month') }}
              </button>
            </div>
          </transition>
        </div>

        <!-- Quick Import / Templates Dropdown -->
        <div class="relative">
          <button
            @click="showImportMenu = !showImportMenu; showFilterMenu = false"
            class="relative z-20 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-violet-50 text-violet-600 shadow-sm transition-colors hover:bg-violet-100 active:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:hover:bg-violet-900/50"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          <transition name="slide-up">
            <div v-if="showImportMenu" class="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
              <!-- Import From Book -->
              <button
                @click="showImportSheet = true; showImportMenu = false"
                class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                  📥
                </div>
                {{ $t("home.importFromBook") }}
              </button>
              <div class="h-px bg-gray-100 dark:bg-gray-700/50"></div>
              
              <!-- Templates -->
              <button
                v-for="tpl in store.recordTemplates"
                :key="tpl.id"
                @click="openNewRecordFromTemplate(tpl.id); showImportMenu = false"
                class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <div
                  :class="[
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs',
                    getTemplateCategoryStyle(tpl.category).bg,
                    getTemplateCategoryStyle(tpl.category).text,
                  ]"
                >
                  <CategoryIcon :name="getTemplateCategoryStyle(tpl.category).icon" style="transform: scale(0.65);" />
                </div>
                <span class="truncate">{{ tpl.name }}</span>
              </button>

              <div class="h-px bg-gray-100 dark:bg-gray-700/50"></div>
              <!-- Manage Templates -->
              <button
                @click="showTemplateManager = true; showImportMenu = false"
                class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  ⚙️
                </div>
                {{ $t("templates.manage") }}
              </button>
            </div>
          </transition>
        </div>
      </div>

      <div v-if="filteredPersonalRecords.length === 0" class="empty-state py-10 text-sm">
        <div class="mb-2 text-3xl">📄</div>
        {{ $t("home.noRecords") }}
      </div>

      <div v-else class="space-y-6">
        <DailyRecordGroup
          v-for="[dateGroup, records] in groupedRecords"
          :key="dateGroup"
          :dateGroup="dateGroup"
          :records="records"
          @edit="openEditRecord"
          @delete="store.deletePersonalRecord"
        />
      </div>
    </div>

    <!-- Draggable FAB -->
    <DraggableFab @click="openNewRecord" />

    <!-- Sheets (extracted components) -->
    <AddPersonalRecordSheet v-model="showForm" :editRecordId="editRecordId" :initialTemplateId="useTemplateId" />
    <ImportFromBookSheet v-model="showImportSheet" />
    <TemplateSettingsModal v-model="showTemplateManager" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useTrackerStore } from "../stores/tracker";
import { colorMap } from "../utils/category";
import DraggableFab from "../components/DraggableFab.vue";
import CategoryIcon from "../components/CategoryIcon.vue";
import SummaryBar from "../components/SummaryBar.vue";
import MonthSelector from "../components/MonthSelector.vue";
import AddPersonalRecordSheet from "../components/home/AddPersonalRecordSheet.vue";
import ImportFromBookSheet from "../components/home/ImportFromBookSheet.vue";
import TemplateSettingsModal from "../components/TemplateSettingsModal.vue";
import DailyRecordGroup from "../components/home/DailyRecordGroup.vue";

const store = useTrackerStore();
const showForm = ref(false);
const showImportSheet = ref(false);
const showImportMenu = ref(false);
const showTemplateManager = ref(false);
const editRecordId = ref<string | undefined>(undefined);
const useTemplateId = ref<string | undefined>(undefined);

// ---- Month Selector & Filter Grouping ----
const selectedMonth = ref<string>(new Date().toISOString().slice(0, 7)); // e.g., '2026-03'
const filterMode = ref<"all" | "year" | "month">("month");
const showFilterMenu = ref(false);

const setFilterMode = (mode: "all" | "year" | "month") => {
  filterMode.value = mode;
  showFilterMenu.value = false;
};

const filteredPersonalRecords = computed(() => {
  return store.personalRecords
    .filter((r) => {
      if (filterMode.value === "all") return true;
      if (filterMode.value === "year") return r.date.startsWith(selectedMonth.value.split('-')[0]);
      if (filterMode.value === "month") return r.date.startsWith(selectedMonth.value);
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
});

const groupedRecords = computed(() => {
  const groups = new Map<string, typeof store.personalRecords>();
  filteredPersonalRecords.value.forEach((record) => {
    if (!groups.has(record.date)) {
      groups.set(record.date, []);
    }
    groups.get(record.date)!.push(record);
  });
  // The filtered records are already sorted descending by date, so Groups will inherently preserve order if iterated correctly
  // Map insertion order is preserved, but we can explicitly sort to be safe
  return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
});

const filteredExpense = computed(() =>
  filteredPersonalRecords.value.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0),
);
const filteredIncome = computed(() =>
  filteredPersonalRecords.value.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0),
);
const filteredBalance = computed(() => filteredIncome.value - filteredExpense.value);

const openNewRecord = () => {
  editRecordId.value = undefined;
  useTemplateId.value = undefined;
  showForm.value = true;
};

const openEditRecord = (id: string) => {
  editRecordId.value = id;
  useTemplateId.value = undefined;
  showForm.value = true;
};

const openNewRecordFromTemplate = (templateId: string) => {
  const tpl = store.recordTemplates.find(t => t.id === templateId);
  if (tpl && tpl.amount !== null) {
    // Template stores category id, but records store category name. Resolve it:
    const catName = store.allCategories.find(c => c.id === tpl.category)?.name ?? tpl.category;
    store.addPersonalRecord({
      type: tpl.type,
      amount: tpl.amount,
      category: catName,
      date: new Date().toISOString().split("T")[0],
      note: tpl.note,
    });
    // Record is added, no need to open sheet
    return;
  }
  
  editRecordId.value = undefined;
  useTemplateId.value = templateId;
  showForm.value = true;
};

const getTemplateCategoryStyle = (categoryId: string) => {
  const cat = store.allCategories.find(c => c.id === categoryId);
  const color = cat?.color ?? "gray";
  return {
    icon: cat?.icon ?? "more_horiz",
    ...(colorMap[color] ?? colorMap.gray),
  };
};
</script>
