export interface LocalDateParts {
  year: number;
  month: number;
  day: number;
}

const LOCAL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseLocalDateString(dateStr: string): LocalDateParts {
  const match = LOCAL_DATE_RE.exec(dateStr);
  if (!match) {
    throw new Error(`Invalid local date string: ${dateStr}`);
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalYearMonthString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function formatLocalDate(
  dateStr: string,
  locale = navigator.language,
): string {
  const { year, month, day } = parseLocalDateString(dateStr);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(year, month - 1, day));
}

export function formatLocalDateWithWeekday(
  dateStr: string,
  locale = navigator.language,
): string {
  const { year, month, day } = parseLocalDateString(dateStr);
  const date = new Date(year, month - 1, day);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
    date,
  );
  return `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")} ${weekday}`;
}

export function toLocalDateString(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return getLocalDateString(date);
}
