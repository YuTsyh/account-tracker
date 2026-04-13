import type { Ref } from "vue";
import { computed } from "vue";
import type { Category } from "./types";
import { defaultCategories } from "./constants";
import { saveToStorage, STORAGE_KEYS } from "./storage";

/**
 * Category management actions.
 */
export function setupCategoryActions(
  customCategories: Ref<Category[]>,
  deletedCategoryIds: Ref<string[]>,
  pendingDeleteCustomCategoryIds: Ref<string[]>
) {
  const allCategories = computed(() =>
    [...defaultCategories, ...customCategories.value].filter(
      (c) => !deletedCategoryIds.value.includes(c.id)
    )
  );

  const addCustomCategory = async (cat: Omit<Category, "id" | "isDefault">) => {
    const newCat: Category = { ...cat, id: crypto.randomUUID(), isDefault: false, isSynced: false };
    customCategories.value.push(newCat);
    await saveToStorage(STORAGE_KEYS.CUSTOM_CATEGORIES, customCategories.value);
  };

  const deleteCustomCategory = async (id: string) => {
    const isCustom = customCategories.value.some((c) => c.id === id);
    if (isCustom) {
      pendingDeleteCustomCategoryIds.value.push(id);
      customCategories.value = customCategories.value.filter((c) => c.id !== id);
      await saveToStorage(STORAGE_KEYS.CUSTOM_CATEGORIES, customCategories.value);
      await saveToStorage(STORAGE_KEYS.PENDING_DELETE_CUSTOM_CATEGORIES, pendingDeleteCustomCategoryIds.value);
    } else {
      // Default category: hide locally (existing deletedCategoryIds mechanism)
      deletedCategoryIds.value.push(id);
      await saveToStorage(STORAGE_KEYS.DELETED_CATEGORIES, deletedCategoryIds.value);
    }
  };

  return { allCategories, addCustomCategory, deleteCustomCategory };
}
