import type { PersonalRecord } from "../stores/types";

export function parseEverydayCSV(content: string): PersonalRecord[] {
  const lines = content.trim().split("\n");
  if (lines.length <= 1) return [];

  // Skip header: 日期,類別,大類別,金額,貨幣,成員,帳戶,標籤,備註,收支區分,上次更新,UUID
  const records: PersonalRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Use a simple comma split, but handle potential quoted values if necessary.
    // For this specific format, simple split should work as seen in the sample.
    const columns = line.split(",");
    if (columns.length < 10) continue;

    const rawDate = columns[0]; // 20260331
    const category = columns[1]; // 交通
    const amount = parseFloat(columns[3]); // 1000
    const note = columns[8]; // SUICA
    const typeIndicator = columns[9]; // 支

    // Date conversion: 20260331 -> 2026-03-31
    const year = rawDate.substring(0, 4);
    const month = rawDate.substring(4, 6);
    const day = rawDate.substring(6, 8);
    const formattedDate = `${year}-${month}-${day}`;

    const type: "expense" | "income" = typeIndicator === "收" ? "income" : "expense";

    records.push({
      id: crypto.randomUUID(),
      type: type,
      amount: isNaN(amount) ? 0 : amount,
      category: category || "其他",
      date: formattedDate,
      note: note || "",
    });
  }

  return records;
}
