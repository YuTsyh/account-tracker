import { ref, type Ref } from "vue";
import type { Book, RecordItem, Category, PersonalRecord, RecordTemplate, UserProfile } from "./types";
import { pushSyncData, pullSyncData, pushSyncByUUID, pullSyncByUUID } from "../utils/api";
import { saveToStorage, STORAGE_KEYS } from "./storage";
import { useToast } from "../composables/useToast";
import { i18n } from "../i18n";

/**
 * Full cloud sync (push/pull all data).
 * Used for authenticated Google users.
 */
export function setupCloudSyncActions(
  userProfile: Ref<UserProfile>,
  books: Ref<Book[]>,
  records: Ref<RecordItem[]>,
  personalRecords: Ref<PersonalRecord[]>,
  customCategories: Ref<Category[]>,
  recordTemplates: Ref<RecordTemplate[]>,
  pendingDeleteRecordIds: Ref<string[]>,
  pendingDeletePersonalRecordIds: Ref<string[]>,
  pendingDeleteBookIds: Ref<string[]>,
  pendingDeleteCustomCategoryIds: Ref<string[]>,
  pendingDeleteTemplateIds: Ref<string[]>,
  save: () => Promise<void>
) {
  const toast = useToast();
  const { t } = i18n.global;
  const isSyncing = ref(false);

  // =====================
  //  Helpers
  // =====================

  /** Count all locally-modified records not yet pushed to cloud. */
  const countPending = () =>
    records.value.filter((r) => !r.isSynced).length +
    personalRecords.value.filter((r) => !r.isSynced).length +
    books.value.filter((b) => !b.isSynced).length +
    customCategories.value.filter((c) => !c.isSynced).length +
    recordTemplates.value.filter((t) => !t.isSynced).length +
    pendingDeleteRecordIds.value.length +
    pendingDeletePersonalRecordIds.value.length +
    pendingDeleteBookIds.value.length +
    pendingDeleteCustomCategoryIds.value.length +
    pendingDeleteTemplateIds.value.length;

  /** Mark all local data as synced and clear all tombstones. */
  const markAllSynced = async () => {
    records.value.forEach((r) => { r.isSynced = true; });
    personalRecords.value.forEach((r) => { r.isSynced = true; });
    books.value.forEach((b) => { b.isSynced = true; });
    customCategories.value.forEach((c) => { c.isSynced = true; });
    recordTemplates.value.forEach((t) => { t.isSynced = true; });

    pendingDeleteRecordIds.value = [];
    pendingDeletePersonalRecordIds.value = [];
    pendingDeleteBookIds.value = [];
    pendingDeleteCustomCategoryIds.value = [];
    pendingDeleteTemplateIds.value = [];

    await Promise.all([
      saveToStorage(STORAGE_KEYS.PENDING_DELETE_RECORDS, []),
      saveToStorage(STORAGE_KEYS.PENDING_DELETE_PERSONAL_RECORDS, []),
      saveToStorage(STORAGE_KEYS.PENDING_DELETE_BOOKS, []),
      saveToStorage(STORAGE_KEYS.PENDING_DELETE_CUSTOM_CATEGORIES, []),
      saveToStorage(STORAGE_KEYS.PENDING_DELETE_TEMPLATES, []),
    ]);
  };

  // =====================
  //  Smart Merge helper
  // =====================

  /**
   * Merge a cloud array with local pending state.
   * - Cloud items are marked isSynced = true
   * - Local pending (isSynced = false) override same-ID cloud items
   * - Local pending items not in cloud are preserved
   * - Items in tombstone set are excluded from cloud data
   */
  function mergeWithCloud<T extends { id: string; isSynced?: boolean }>(
    cloudItems: T[],
    localItems: T[],
    tombstoneIds: string[]
  ): T[] {
    const tombstoneSet = new Set(tombstoneIds);
    const localPending = localItems.filter((item) => !item.isSynced);
    const localPendingById = new Map(localPending.map((item) => [item.id, item]));

    // Filter tombstoned items and apply cloud data (local pending overrides same ID)
    const cloudFiltered = cloudItems
      .filter((item) => !tombstoneSet.has(item.id))
      .map((item) => ({ ...localPendingById.get(item.id) ?? item, isSynced: localPendingById.has(item.id) ? false : true } as T));

    // Add local pending items not already represented in cloud
    const cloudIds = new Set(cloudFiltered.map((item) => item.id));
    const extraLocal = localPending.filter((item) => !cloudIds.has(item.id));

    return [...cloudFiltered, ...extraLocal];
  }

  // =====================
  //  applyCloudData (Smart Merge)
  // =====================

  const applyCloudData = async (data: any) => {
    if (!data) return;

    customCategories.value = mergeWithCloud(
      (data.categories || []) as Category[],
      customCategories.value,
      pendingDeleteCustomCategoryIds.value
    );

    books.value = mergeWithCloud(
      (data.books || []) as Book[],
      books.value,
      pendingDeleteBookIds.value
    );

    records.value = mergeWithCloud(
      (data.records || []) as RecordItem[],
      records.value,
      pendingDeleteRecordIds.value
    );

    personalRecords.value = mergeWithCloud(
      (data.personal_records || []) as PersonalRecord[],
      personalRecords.value,
      pendingDeletePersonalRecordIds.value
    );

    recordTemplates.value = mergeWithCloud(
      (data.templates || []) as RecordTemplate[],
      recordTemplates.value,
      pendingDeleteTemplateIds.value
    );

    await save();
  };

  // =====================
  //  Sync Actions
  // =====================

  const syncToCloud = async () => {
    if (!userProfile.value.isLoggedIn || !userProfile.value.authToken || isSyncing.value) return;
    isSyncing.value = true;
    const payload = {
      books: books.value,
      records: records.value,
      personal_records: personalRecords.value,
      categories: customCategories.value,
      templates: recordTemplates.value,
    };
    try {
      await pushSyncData(payload);
      await markAllSynced();
      await save();
      toast.success(t("sync.success"));
    } catch {
      toast.error(t("sync.error"));
    } finally {
      isSyncing.value = false;
    }
  };

  const overwriteFromCloud = async () => {
    if (!userProfile.value.isLoggedIn || !userProfile.value.authToken || isSyncing.value) return;

    const pendingCount = countPending();
    if (pendingCount > 0) {
      if (!confirm(t("sync.confirmOverwriteWithPending", { count: pendingCount }))) return;
    } else {
      if (!confirm(t("sync.confirmOverwrite"))) return;
    }

    isSyncing.value = true;
    try {
      const response = await pullSyncData();
      if (response.data) {
        // Full overwrite: reset all pending state first, then apply
        pendingDeleteRecordIds.value = [];
        pendingDeletePersonalRecordIds.value = [];
        pendingDeleteBookIds.value = [];
        pendingDeleteCustomCategoryIds.value = [];
        pendingDeleteTemplateIds.value = [];

        customCategories.value = (response.data.categories || []).map((c: Category) => ({ ...c, isSynced: true }));
        books.value = (response.data.books || []).map((b: Book) => ({ ...b, isSynced: true }));
        records.value = (response.data.records || []).map((r: RecordItem) => ({ ...r, isSynced: true }));
        personalRecords.value = (response.data.personal_records || []).map((r: PersonalRecord) => ({ ...r, isSynced: true }));
        recordTemplates.value = (response.data.templates || []).map((t: RecordTemplate) => ({ ...t, isSynced: true }));

        await save();
        toast.success(t("sync.restoreSuccess"));
      }
    } catch {
      toast.error(t("sync.pullError"));
    } finally {
      isSyncing.value = false;
    }
  };

  const backupByUUID = async () => {
    if (isSyncing.value) return false;
    isSyncing.value = true;
    const payload = {
      books: books.value,
      records: records.value,
      personal_records: personalRecords.value,
      categories: customCategories.value,
      templates: recordTemplates.value,
    };
    try {
      await pushSyncByUUID(userProfile.value.id, payload);
      await markAllSynced();
      await save();
      toast.success(t("sync.backupSuccess"));
      return true;
    } catch {
      toast.error(t("sync.backupError"));
      return false;
    } finally {
      isSyncing.value = false;
    }
  };

  const restoreByUUID = async (uuid: string) => {
    if (!uuid || isSyncing.value) return;

    const pendingCount = countPending();
    if (pendingCount > 0) {
      if (!confirm(t("sync.confirmOverwriteWithPending", { count: pendingCount }))) return;
    } else {
      if (!confirm(t("sync.confirmOverwrite"))) return;
    }

    isSyncing.value = true;
    try {
      const response = await pullSyncByUUID(uuid);
      if (response.data) {
        // Full overwrite: reset all pending state first, then apply
        pendingDeleteRecordIds.value = [];
        pendingDeletePersonalRecordIds.value = [];
        pendingDeleteBookIds.value = [];
        pendingDeleteCustomCategoryIds.value = [];
        pendingDeleteTemplateIds.value = [];

        customCategories.value = (response.data.categories || []).map((c: Category) => ({ ...c, isSynced: true }));
        books.value = (response.data.books || []).map((b: Book) => ({ ...b, isSynced: true }));
        records.value = (response.data.records || []).map((r: RecordItem) => ({ ...r, isSynced: true }));
        personalRecords.value = (response.data.personal_records || []).map((r: PersonalRecord) => ({ ...r, isSynced: true }));
        recordTemplates.value = (response.data.templates || []).map((t: RecordTemplate) => ({ ...t, isSynced: true }));

        // Also update local user ID to match the restored backup
        userProfile.value.id = uuid;
        await save();

        toast.success(t("sync.restoreUUIDSuccess"));
        return true;
      }
    } catch {
      toast.error(t("sync.restoreUUIDError"));
    } finally {
      isSyncing.value = false;
    }
    return false;
  };

  return { syncToCloud, overwriteFromCloud, backupByUUID, restoreByUUID, applyCloudData, isSyncing };
}
