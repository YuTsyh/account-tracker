<template>
  <div class="page-container">
    <!-- Header -->
    <div class="header-nav sticky top-0 z-10">
      <button
        type="button"
        @click="router.back()"
        class="-ml-2 p-2 text-gray-500 hover:text-gray-800"
      >
        <svg
          class="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <h1 class="flex-1 text-center font-bold text-gray-800">新增紀錄</h1>
      <div class="w-8"></div>
    </div>

    <!-- No book warning -->
    <div
      v-if="!store.currentBook"
      class="flex flex-col items-center justify-center px-8 py-24 text-center"
    >
      <div class="mb-3 text-5xl">📒</div>
      <p class="font-medium text-gray-600">請先選擇一個帳本</p>
      <router-link
        to="/books"
        class="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >前往帳本管理</router-link
      >
    </div>

    <div v-else class="p-4">
      <form @submit.prevent="submitRecord" class="card space-y-5">
        <!-- Expense / Income toggle -->
        <div class="flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            @click="form.type = 'expense'"
            :class="[
              'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all',
              form.type === 'expense'
                ? 'bg-white text-red-600 shadow'
                : 'text-gray-500',
            ]"
          >
            支出
          </button>
          <button
            type="button"
            @click="form.type = 'income'"
            :class="[
              'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all',
              form.type === 'income'
                ? 'bg-white text-green-600 shadow'
                : 'text-gray-500',
            ]"
          >
            收入
          </button>
        </div>

        <!-- Amount -->
        <div>
          <label class="label-text">金額</label>
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-400"
              >NT$</span
            >
            <input
              v-model.number="form.amount"
              type="number"
              min="1"
              required
              placeholder="0"
              class="input-field input-field-icon text-lg font-semibold"
            />
          </div>
        </div>

        <!-- Category -->
        <div>
          <label class="label-text">分類</label>
          <select v-model="form.category" class="input-field">
            <template v-if="form.type === 'expense'">
              <option value="飲食">🍔 飲食</option>
              <option value="交通">🚗 交通</option>
              <option value="購物">🛍️ 購物</option>
              <option value="娛樂">🎮 娛樂</option>
              <option value="住宿">🏨 住宿</option>
              <option value="景點">🎡 景點</option>
              <option value="繳費">🧾 繳費</option>
              <option value="其他">📌 其他</option>
            </template>
            <template v-else>
              <option value="薪水">💰 薪水</option>
              <option value="零用錢">🧧 零用錢</option>
              <option value="獎金">🏆 獎金</option>
              <option value="其他">📌 其他</option>
            </template>
          </select>
        </div>

        <!-- Paid By (expense only) -->
        <div v-if="form.type === 'expense'">
          <label class="label-text">付款人</label>
          <select v-model="form.paidById" class="input-field">
            <option
              v-for="m in store.currentBook.members"
              :key="m.id"
              :value="m.id"
            >
              {{ m.name }}
            </option>
          </select>
        </div>

        <!-- Split Among (expense only) -->
        <div v-if="form.type === 'expense'">
          <div class="mb-1.5 flex items-center justify-between">
            <label class="text-sm font-medium text-gray-600">分帳對象</label>
            <button
              type="button"
              @click="toggleAllMembers"
              class="text-xs text-blue-600 hover:underline"
            >
              {{
                form.splitAmongIds.length === store.currentBook.members.length
                  ? "取消全選"
                  : "全選"
              }}
            </button>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="m in store.currentBook.members"
              :key="m.id"
              type="button"
              @click="toggleMember(m.id)"
              :class="[
                'rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all',
                form.splitAmongIds.includes(m.id)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-500',
              ]"
            >
              {{ m.name }}
            </button>
          </div>
          <p
            v-if="form.splitAmongIds.length > 0 && form.amount"
            class="mt-2 text-right text-xs text-gray-400"
          >
            每人分擔：NT$
            {{
              Math.floor(
                form.amount / form.splitAmongIds.length,
              ).toLocaleString()
            }}
          </p>
        </div>

        <!-- Date -->
        <div>
          <label class="label-text">日期</label>
          <input v-model="form.date" type="date" required class="input-field" />
        </div>

        <!-- Note -->
        <div>
          <label class="label-text">備註 (選填)</label>
          <input
            v-model="form.note"
            type="text"
            placeholder="輸入備註..."
            class="input-field"
          />
        </div>

        <BaseButton
          type="submit"
          :disabled="form.type === 'expense' && form.splitAmongIds.length === 0"
        >
          儲存紀錄
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useTrackerStore } from "../stores/tracker";
import BaseButton from "../components/BaseButton.vue";

const store = useTrackerStore();
const router = useRouter();

const today = new Date().toISOString().split("T")[0];
const defaultPaidById = store.currentBook?.members[0]?.id ?? "";
const allMemberIds = store.currentBook?.members.map((m) => m.id) ?? [];

const form = ref({
  type: "expense" as "expense" | "income",
  amount: "" as number | "",
  category: "飲食",
  paidById: defaultPaidById,
  splitAmongIds: [...allMemberIds],
  date: today,
  note: "",
});

watch(
  () => form.value.type,
  (newType) => {
    form.value.category = newType === "expense" ? "飲食" : "薪水";
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

const toggleAllMembers = () => {
  const all = store.currentBook?.members.map((m) => m.id) ?? [];
  if (form.value.splitAmongIds.length === all.length) {
    form.value.splitAmongIds = [];
  } else {
    form.value.splitAmongIds = [...all];
  }
};

const submitRecord = () => {
  if (!form.value.amount || Number(form.value.amount) <= 0) return;
  if (!store.currentBook) return;

  const isExpense = form.value.type === "expense";
  if (isExpense && form.value.splitAmongIds.length === 0) return;

  store.addRecord({
    type: form.value.type,
    amount: Number(form.value.amount),
    category: form.value.category,
    date: form.value.date,
    note: form.value.note,
    paidById: isExpense ? form.value.paidById : "",
    splitAmongIds: isExpense ? form.value.splitAmongIds : [],
  });

  router.back();
};
</script>
