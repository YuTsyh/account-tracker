import { defineStore } from "pinia";
import { ref } from "vue";
import type { Book, RecordItem, PersonalRecord, UserProfile, Category, RecordTemplate } from "./types";
import { loadFromStorage, saveToStorage, STORAGE_KEYS, migrateFromLocalStorage } from "./storage";
import { setupUserActions } from "./user";
import { setupCategoryActions } from "./categories";
import { setupBookActions } from "./books";
import { setupPersonalActions } from "./personal";
import { setupTemplateActions } from "./templates";
import { setupCloudSyncActions } from "./cloud-sync";

// Re-export types & constants for backward compatibility
export type { Member, Book, RecordItem, PersonalRecord, RecordTemplate, UserProfile, Category, Settlement } from "./types";
export { defaultCategories } from "./constants";

export const useTrackerStore = defineStore("tracker", () => {
  // =====================
  //  Reactive State
  // =====================
  const isInitialized = ref(false);
  const books = ref<Book[]>([]);
  const records = ref<RecordItem[]>([]);
  const currentBookId = ref<string | null>(null);
  const personalRecords = ref<PersonalRecord[]>([]);

  const userProfileDefaults: UserProfile = { name: "", theme: "system", animations: true, isLoggedIn: false };
  const userProfile = ref<UserProfile>({ ...userProfileDefaults });

  const customCategories = ref<Category[]>([]);
  const deletedCategoryIds = ref<string[]>([]);
  const recordTemplates = ref<RecordTemplate[]>([]);

  // =====================
  //  Persistence
  // =====================

  let initPromise: Promise<void> | null = null;
  /**
   * Initializes the store by migrating from localStorage (if needed)
   * and loading data from IndexedDB.
   */
  const init = () => {
    if (isInitialized.value) return Promise.resolve();
    if (initPromise) return initPromise;

    initPromise = (async () => {
      // 1. One-time migration from localStorage to IDB
      await migrateFromLocalStorage();

      // 2. Load all pieces of state from IndexedDB
      const [
        loadedBooks,
        loadedRecords,
        loadedCurrentBookId,
        loadedPersonalRecords,
        loadedUserProfile,
        loadedCustomCategories,
        loadedDeletedCategories,
        loadedTemplates,
      ] = await Promise.all([
        loadFromStorage(STORAGE_KEYS.BOOKS, []),
        loadFromStorage(STORAGE_KEYS.RECORDS, []),
        loadFromStorage(STORAGE_KEYS.CURRENT_BOOK, null),
        loadFromStorage(STORAGE_KEYS.PERSONAL_RECORDS, []),
        loadFromStorage(STORAGE_KEYS.USER_PROFILE, userProfileDefaults),
        loadFromStorage(STORAGE_KEYS.CUSTOM_CATEGORIES, []),
        loadFromStorage(STORAGE_KEYS.DELETED_CATEGORIES, []),
        loadFromStorage(STORAGE_KEYS.TEMPLATES, []),
      ]);

      books.value = loadedBooks;
      records.value = loadedRecords;
      currentBookId.value = loadedCurrentBookId;
      personalRecords.value = loadedPersonalRecords;
      userProfile.value = { ...userProfileDefaults, ...loadedUserProfile };
      customCategories.value = loadedCustomCategories;
      deletedCategoryIds.value = loadedDeletedCategories;
      recordTemplates.value = loadedTemplates;

      isInitialized.value = true;
      console.log("[tracker] Store initialized from IndexedDB.");
    })();

    return initPromise;
  };

  const save = async () => {
    await Promise.all([
      saveToStorage(STORAGE_KEYS.BOOKS, books.value),
      saveToStorage(STORAGE_KEYS.RECORDS, records.value),
      saveToStorage(STORAGE_KEYS.CURRENT_BOOK, currentBookId.value),
      saveToStorage(STORAGE_KEYS.PERSONAL_RECORDS, personalRecords.value),
      saveToStorage(STORAGE_KEYS.USER_PROFILE, userProfile.value),
      saveToStorage(STORAGE_KEYS.CUSTOM_CATEGORIES, customCategories.value),
      saveToStorage(STORAGE_KEYS.TEMPLATES, recordTemplates.value),
    ]);
  };

  // =====================
  //  Compose Sub-modules
  // =====================
  const userActions = setupUserActions(userProfile, save);
  const categoryActions = setupCategoryActions(customCategories, deletedCategoryIds);
  const bookActions = setupBookActions(books, records, currentBookId, userProfile, save);
  const personalActions = setupPersonalActions(personalRecords, bookActions.memberStats, bookActions.currentBook, save);
  const templateActions = setupTemplateActions(recordTemplates, save);
  const cloudSyncActions = setupCloudSyncActions(userProfile, books, records, personalRecords, customCategories, recordTemplates, save);

  // =====================
  //  Return All
  // =====================
  return {
    // State
    isInitialized,
    userProfile,
    books,
    records,
    currentBookId,
    personalRecords,
    customCategories,
    recordTemplates,

    // Lifecycle
    init,

    // User
    ...userActions,

    // Categories
    ...categoryActions,

    // Books (CRUD + Settlement + Shared Sync)
    ...bookActions,

    // Personal Records
    ...personalActions,

    // Templates
    ...templateActions,

    // Cloud Sync
    ...cloudSyncActions,
  };
});
