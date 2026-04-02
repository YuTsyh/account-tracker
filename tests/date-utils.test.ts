import { describe, expect, it } from "vitest";
import {
  formatLocalDate,
  getLocalDateString,
  getLocalYearMonthString,
  parseLocalDateString,
} from "../src/utils/date";

describe("date utils", () => {
  it("keeps a local calendar date as yyyy-MM-dd without UTC drift", () => {
    expect(getLocalDateString(new Date(2026, 2, 31, 0, 15))).toBe("2026-03-31");
    expect(getLocalYearMonthString(new Date(2026, 2, 31, 0, 15))).toBe(
      "2026-03",
    );
  });

  it("parses and formats pure date strings without shifting to the previous day", () => {
    expect(parseLocalDateString("2026-03-31")).toEqual({
      year: 2026,
      month: 3,
      day: 31,
    });
    expect(formatLocalDate("2026-03-31", "en-US")).toBe("03/31/2026");
  });
});
