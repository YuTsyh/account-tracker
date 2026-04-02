import type { PersonalRecord } from "../stores/types";
import { toLocalDateString } from "./date";

interface PiggyCategory {
  id: number;
  name: string;
  type: "expense" | "income";
}

export function parsePiggyBackup(content: string): PersonalRecord[] {
  const sections = content.split("BK#");
  const categories: Record<number, PiggyCategory> = {};
  const rawRecords: any[] = [];
  const parsedRecords: PersonalRecord[] = [];

  for (const section of sections) {
    if (!section.trim()) continue;

    const type = section.charAt(0);
    const lines = section.substring(1).trim().split("\n");

    if (type === "C") {
      // Categories
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          categories[data.a] = {
            id: data.a,
            name: data.c,
            type: data.d === "Expense" ? "expense" : "income",
          };
        } catch (e) {
          console.error("Failed to parse category line:", line);
        }
      }
    } else if (type === "R") {
      // Records
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          rawRecords.push(data);
        } catch (e) {
          console.error("Failed to parse record line:", line);
        }
      }
    }
  }

  // Filter and map records
  for (const data of rawRecords) {
    const category = categories[data.i];
    const type = data.j === "Expense" ? "expense" : "income";
    const dateString = toLocalDateString(data.c);

    parsedRecords.push({
      id: crypto.randomUUID(),
      type: type,
      amount: data.f,
      category: category?.name || "其他",
      date: dateString,
      note: data.h || "",
    });
  }

  return parsedRecords;
}
