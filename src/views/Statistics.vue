<template>
  <div class="page-container min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
    <!-- Header -->
    <div class="rounded-b-3xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 pb-8 pt-10 text-white shadow-lg">
      <div class="mb-4">
        <p class="text-xs font-medium uppercase tracking-wider text-emerald-200">
          {{ $t("statistics.subtitle") }}
        </p>
        <h1 class="mt-0.5 text-xl font-bold text-white">
          {{ $t("statistics.title") }}
        </h1>
      </div>

      <SummaryBar
        :totalExpense="filteredExpense"
        :totalIncome="filteredIncome"
        :balance="filteredBalance"
        labelClass="text-emerald-200"
        valueClass="text-lg"
      />
    </div>

    <div class="mt-5 px-4">
      <!-- Date Filter (default to year) -->
      <DateFilterBar
        v-if="store.personalRecords.length > 0"
        :dates="recordDates"
        initialMode="year"
        hideDateMode
        @change="onFilterChange"
        class="mb-5"
      />

      <!-- Empty State -->
      <div v-if="filteredRecords.length === 0" class="empty-state py-16">
        <div class="mb-3 text-5xl">📊</div>
        <p class="font-bold">{{ $t("statistics.noData") }}</p>
      </div>

      <template v-else>
        <!-- Shared expense / income toggle -->
        <div class="mb-4 flex justify-end">
          <div class="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            <button
              @click="categoryTab = 'expense'"
              :class="[
                'rounded-lg px-3 py-1 text-xs font-semibold transition-colors',
                categoryTab === 'expense'
                  ? 'bg-white text-red-600 shadow-sm dark:bg-gray-700 dark:text-red-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              ]"
            >
              {{ $t("common.expense") }}
            </button>
            <button
              @click="categoryTab = 'income'"
              :class="[
                'rounded-lg px-3 py-1 text-xs font-semibold transition-colors',
                categoryTab === 'income'
                  ? 'bg-white text-green-600 shadow-sm dark:bg-gray-700 dark:text-green-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              ]"
            >
              {{ $t("common.income") }}
            </button>
          </div>
        </div>

        <!-- ===== Trend Bar Chart ===== -->
        <div v-if="dateFilter.mode !== 'date'" class="mb-6">
          <h2 class="section-title mb-3">{{ trendTitle }}</h2>

          <div v-if="trendData.length === 0" class="empty-state py-8 text-sm">
            <div class="mb-2 text-3xl">📈</div>
            {{ $t("statistics.noData") }}
          </div>

          <!-- Vertical bar chart (single color based on toggle) -->
          <div
            v-else
            class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div class="relative flex">
              <!-- Background Grid (Fixed behind the scrollable area) -->
              <div class="pointer-events-none absolute inset-x-0 top-8 z-0 flex h-[160px] flex-col justify-between pl-12">
                <!-- 4 horizontal lines to match the 4 Y-axis labels -->
                <div class="w-full border-t border-gray-100 dark:border-gray-700"></div>
                <div class="w-full border-t border-gray-100 dark:border-gray-700"></div>
                <div class="w-full border-t border-gray-100 dark:border-gray-700"></div>
                <div class="w-full border-t border-gray-100 dark:border-gray-700"></div>
              </div>

              <!-- Y-axis labels -->
              <div class="relative z-10 w-12 shrink-0 pt-8">
                <div class="relative h-[160px] w-full">
                  <span class="absolute right-2 top-[0%] -translate-y-1/2 text-[10px] text-gray-500">{{ Math.round(trendMaxVal).toLocaleString() }}</span>
                  <span class="absolute right-2 top-[33.33%] -translate-y-1/2 text-[10px] text-gray-500">{{ Math.round(trendMaxVal * 2 / 3).toLocaleString() }}</span>
                  <span class="absolute right-2 top-[66.67%] -translate-y-1/2 text-[10px] text-gray-500">{{ Math.round(trendMaxVal / 3).toLocaleString() }}</span>
                  <span class="absolute right-2 top-[100%] -translate-y-1/2 text-[10px] text-gray-500">0</span>
                </div>
              </div>

              <!-- Scrollable Bars Area (pt-8 provides space for tooltip inside overflow) -->
              <div class="relative z-10 flex-1 overflow-x-auto pb-4">
                <div
                  class="flex pt-8"
                  :style="{ minWidth: trendData.length * 28 + 'px' }"
                >
                  <div
                    v-for="item in trendData"
                    :key="item.key"
                    class="group relative flex flex-1 flex-col items-center border-l border-gray-50/50 dark:border-gray-700/30 first:border-none"
                  >
                    <!-- Bar area -->
                    <div class="relative mx-auto w-full" style="height: 160px">
                      <!-- Bar -->
                      <div
                        class="absolute bottom-0 left-1/2 w-[14px] -translate-x-1/2 rounded-t-md transition-all duration-500"
                        :class="categoryTab === 'expense' ? 'bg-red-400' : 'bg-green-400'"
                        :style="{ height: Math.max(item.percent * 1.6, item.value > 0 ? 2 : 0) + 'px' }"
                      ></div>

                      <!-- Tooltip on hover (top right of bar, no background) -->
                      <div
                        v-if="item.value > 0"
                        class="pointer-events-none absolute z-10 whitespace-nowrap text-[10px] font-bold text-gray-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-300"
                        :style="{ 
                          bottom: Math.max(item.percent * 1.6, 2) + 'px', 
                          left: '50%', 
                          marginLeft: '8px', 
                          marginBottom: '2px' 
                        }"
                      >
                        {{ item.value.toLocaleString() }}
                      </div>
                    </div>

                    <!-- X-axis label -->
                    <span class="mt-1 block text-center text-[10px] leading-tight text-gray-400">
                      {{ item.shortLabel }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== Category Breakdown ===== -->
        <div class="mb-6">
          <h2 class="section-title mb-3">{{ $t("statistics.categoryBreakdown") }}</h2>

          <!-- Category list or empty -->
          <div v-if="categoryBreakdown.length === 0" class="empty-state py-8 text-sm">
            <div class="mb-2 text-3xl">🔍</div>
            {{ $t("statistics.noData") }}
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="item in categoryBreakdown"
              :key="item.categoryName"
              class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    :class="[
                      'record-icon',
                      item.style.bg,
                      item.style.text,
                    ]"
                  >
                    <CategoryIcon :name="item.style.icon" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {{ item.localizedName }}
                    </p>
                    <p class="hint-text mt-0.5">
                      {{ item.count }} {{ $t("statistics.records") }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p
                    :class="[
                      'font-bold',
                      categoryTab === 'expense' ? 'text-red-500' : 'text-green-500',
                    ]"
                  >
                    {{ item.total.toLocaleString() }}
                  </p>
                  <p class="hint-text mt-0.5">{{ item.percentage }}%</p>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="categoryTab === 'expense' ? 'bg-red-400' : 'bg-green-400'"
                  :style="{ width: item.percentage + '%' }"
                ></div>
              </div>
            </div>

            <!-- Total row -->
            <div class="flex items-center justify-between rounded-2xl bg-gray-100 p-4 font-bold dark:bg-gray-800">
              <span class="text-gray-600 dark:text-gray-300">{{ $t("statistics.total") }}</span>
              <span :class="categoryTab === 'expense' ? 'text-red-500' : 'text-green-500'">
                {{ categoryTotal.toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTrackerStore } from "../stores/tracker";
import { colorMap } from "../utils/category";
import SummaryBar from "../components/SummaryBar.vue";
import DateFilterBar from "../components/DateFilterBar.vue";
import CategoryIcon from "../components/CategoryIcon.vue";
import type { DateFilter } from "../components/DateFilterBar.vue";

const store = useTrackerStore();
const { te, t } = useI18n();

// ---- Date Filter (default: year) ----
const today = new Date().toISOString().split("T")[0];
const currentYear = today.slice(0, 4);
const currentMonth = today.slice(5, 7);

const dateFilter = ref<DateFilter>({ mode: "year", year: currentYear, month: currentMonth, date: today });
const onFilterChange = (f: DateFilter) => { dateFilter.value = f; };
const recordDates = computed(() => store.personalRecords.map((r) => r.date));

const filteredRecords = computed(() => {
  const records = store.personalRecords;
  const { mode, year, month, date } = dateFilter.value;
  let result;
  if (mode === "all") result = records;
  else if (mode === "year") result = records.filter((r) => r.date.startsWith(year));
  else if (mode === "month") result = records.filter((r) => r.date.startsWith(`${year}-${month}`));
  else if (mode === "date") result = records.filter((r) => r.date === date);
  else result = records;
  return result;
});

const filteredExpense = computed(() =>
  filteredRecords.value.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0),
);
const filteredIncome = computed(() =>
  filteredRecords.value.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0),
);
const filteredBalance = computed(() => filteredIncome.value - filteredExpense.value);

// ---- Shared toggle for trend + category ----
const categoryTab = ref<"expense" | "income">("expense");

// ---- Category Breakdown ----
const categoryMap = computed(() =>
  new Map(store.allCategories.map((c) => [c.name, c])),
);

const getCategoryStyle = (categoryName: string) => {
  const cat = categoryMap.value.get(categoryName);
  const color = cat?.color ?? "gray";
  return {
    icon: cat?.icon ?? "more_horiz",
    ...(colorMap[color] ?? colorMap.gray),
  };
};

const getLocalizedCategoryName = (categoryName: string) => {
  const cat = categoryMap.value.get(categoryName);
  if (cat && te(`categories.${cat.id}`)) return t(`categories.${cat.id}`);
  return categoryName;
};

const categoryTotal = computed(() => {
  return filteredRecords.value
    .filter((r) => r.type === categoryTab.value)
    .reduce((s, r) => s + r.amount, 0);
});

const categoryBreakdown = computed(() => {
  const typeRecords = filteredRecords.value.filter((r) => r.type === categoryTab.value);
  const total = typeRecords.reduce((s, r) => s + r.amount, 0);
  if (total === 0) return [];

  const map = new Map<string, { total: number; count: number }>();
  for (const r of typeRecords) {
    const entry = map.get(r.category) ?? { total: 0, count: 0 };
    entry.total += r.amount;
    entry.count += 1;
    map.set(r.category, entry);
  }

  return [...map.entries()]
    .map(([categoryName, data]) => ({
      categoryName,
      localizedName: getLocalizedCategoryName(categoryName),
      total: Math.round(data.total),
      count: data.count,
      percentage: Math.round((data.total / total) * 100),
      style: getCategoryStyle(categoryName),
    }))
    .sort((a, b) => b.total - a.total);
});

// ---- Dynamic Trend ----
const trendTitle = computed(() => {
  const mode = dateFilter.value.mode;
  if (mode === "all") return t("statistics.yearlyTrend");
  if (mode === "year") return t("statistics.monthlyTrend");
  if (mode === "month") return t("statistics.dailyTrend");
  return "";
});

// Max value for Y-axis (reactive via ref updated inside computed)
const trendMaxValRaw = ref(0);
const trendMaxVal = computed(() => trendMaxValRaw.value);

const trendData = computed(() => {
  const records = filteredRecords.value;
  const mode = dateFilter.value.mode;
  const type = categoryTab.value;
  if (records.length === 0 || mode === "date") return [];

  // Only use records matching current toggle
  const typeRecords = records.filter((r) => r.type === type);

  const getKey = (dateStr: string): string => {
    if (mode === "all") return dateStr.slice(0, 4);
    if (mode === "year") return dateStr.slice(0, 7);
    if (mode === "month") return dateStr;
    return dateStr;
  };

  const map = new Map<string, number>();

  // Pre-fill map for 'year' (all 12 months) and 'month' (all days in month)
  if (mode === "year") {
    const y = dateFilter.value.year;
    for (let m = 1; m <= 12; m++) {
      const mm = m.toString().padStart(2, '0');
      map.set(`${y}-${mm}`, 0);
    }
  } else if (mode === "month") {
    const y = parseInt(dateFilter.value.year, 10);
    const m = parseInt(dateFilter.value.month, 10);
    const daysInMonth = new Date(y, m, 0).getDate();
    const prefix = `${dateFilter.value.year}-${dateFilter.value.month}`;
    for (let d = 1; d <= daysInMonth; d++) {
      const dd = d.toString().padStart(2, '0');
      map.set(`${prefix}-${dd}`, 0);
    }
  }

  for (const r of typeRecords) {
    const key = getKey(r.date);
    // Only add to map if it's 'all' mode, or if the key is already in our pre-filled map
    // (though typeRecords is already filtered to the selected period, so it should match)
    if (mode === "all" || map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + r.amount);
    }
  }

  const entries = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const maxVal = entries.reduce((m, [, v]) => Math.max(m, v), 0);
  trendMaxValRaw.value = maxVal;
  if (maxVal === 0) return [];

  return entries.map(([key, value]) => {
    let shortLabel = key;
    if (mode === "all") {
      shortLabel = key; // year: 2024, 2025, 2026
    } else if (mode === "year") {
      // month: just number 1, 2, ..., 12
      shortLabel = String(parseInt(key.slice(5, 7), 10));
    } else if (mode === "month") {
      // day: just number 1, 2, ..., 31
      shortLabel = String(parseInt(key.slice(8, 10), 10));
    }

    return {
      key,
      shortLabel,
      value: Math.round(value),
      percent: Math.max(Math.round((value / maxVal) * 100), value > 0 ? 2 : 0),
    };
  });
});
</script>
