import type { Ref } from "vue";
import type { RecordTemplate } from "./types";

/**
 * Record template CRUD actions.
 */
export function setupTemplateActions(
  recordTemplates: Ref<RecordTemplate[]>,
  pendingDeleteTemplateIds: Ref<string[]>,
  save: () => Promise<void>
) {
  const addTemplate = async (template: Omit<RecordTemplate, "id">) => {
    recordTemplates.value.push({ ...template, id: crypto.randomUUID(), isSynced: false });
    await save();
  };

  const updateTemplate = async (id: string, updates: Partial<RecordTemplate>) => {
    const idx = recordTemplates.value.findIndex((t) => t.id === id);
    if (idx !== -1) {
      recordTemplates.value[idx] = { ...recordTemplates.value[idx], ...updates, isSynced: false };
      await save();
    }
  };

  const deleteTemplate = async (id: string) => {
    pendingDeleteTemplateIds.value.push(id);
    recordTemplates.value = recordTemplates.value.filter((t) => t.id !== id);
    await save();
  };

  return { addTemplate, updateTemplate, deleteTemplate };
}
