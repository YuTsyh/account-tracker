import { ref, type Ref } from "vue";
import type { Book, RecordItem, Category, PersonalRecord, RecordTemplate, UserProfile } from "./types";
import { pushSyncData, pullSyncData, pushSyncByUUID, pullSyncByUUID } from "../utils/api";
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
  save: () => Promise<void>
) {
  const toast = useToast();
  const { t } = i18n.global;
  const isSyncing = ref(false);

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
      toast.success(t("sync.success"));
    } catch {
      toast.error(t("sync.error"));
    } finally {
      isSyncing.value = false;
    }
  };

  const applyCloudData = async (data: any) => {
    if (!data) return;
    customCategories.value = data.categories || [];
    books.value = data.books || [];
    records.value = data.records || [];
    personalRecords.value = data.personal_records || [];
    recordTemplates.value = data.templates || [];
    await save();
  };

  const overwriteFromCloud = async () => {
    if (!userProfile.value.isLoggedIn || !userProfile.value.authToken || isSyncing.value) return;
    if (!confirm(t("sync.confirmOverwrite"))) return;
    isSyncing.value = true;
    try {
      const response = await pullSyncData();
      if (response.data) {
        await applyCloudData(response.data);
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
    if (!confirm(t("sync.confirmOverwrite"))) return;
    isSyncing.value = true;
    try {
      const response = await pullSyncByUUID(uuid);
      if (response.data) {
        await applyCloudData(response.data);
        
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
