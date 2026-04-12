import type { Meal } from "@/services/api";

/** ISO string for when the meal was eaten (falls back to record creation time). */
export function getMealEatenAtIso(meal: Meal): string {
  return meal.eaten_at ?? meal.created_at;
}

export function getMealEatenAtDate(meal: Meal): Date {
  return new Date(getMealEatenAtIso(meal));
}

/** Round to nearest 5 minutes (local wall clock). */
export function roundToFiveMinutes(d: Date): Date {
  const ms = 5 * 60 * 1000;
  return new Date(Math.round(d.getTime() / ms) * ms);
}

export function toDateInputValue(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toTimeInputValue(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Combine local date (YYYY-MM-DD) and time (HH:MM) to UTC ISO. */
export function fromDateAndTimeToIso(dateStr: string, timeStr: string): string {
  const timePart = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  const d = new Date(`${dateStr}T${timePart}`);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date");
  }
  return d.toISOString();
}
