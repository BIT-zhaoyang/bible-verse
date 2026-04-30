import { addDays, subDays } from "date-fns";

import { appConfig } from "./config";

function getDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: appConfig.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return { year, month, day };
}

export function toDateKey(date: Date) {
  const { year, month, day } = getDateParts(date);
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey(now = new Date()) {
  return toDateKey(now);
}

export function getTomorrowDateKey(now = new Date()) {
  return toDateKey(addDays(now, 1));
}

export function getRecentReuseWindowStart(now = new Date()) {
  return toDateKey(subDays(now, 90));
}

export function compareDateKeys(left: string, right: string) {
  return left.localeCompare(right);
}

export function isPastOrToday(targetDate: string, now = new Date()) {
  return compareDateKeys(targetDate, getTodayDateKey(now)) <= 0;
}
