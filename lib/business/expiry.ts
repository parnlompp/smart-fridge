import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import type { ExpiryStatus, StorageLocation } from "@/lib/types";

export const EXPIRY_RULES: Record<string, Record<StorageLocation, number>> = {
  Meat: { Refrigerator: 2, Freezer: 90, Pantry: 1 },
  Seafood: { Refrigerator: 2, Freezer: 90, Pantry: 1 },
  Dairy: { Refrigerator: 7, Freezer: 30, Pantry: 2 },
  Vegetables: { Refrigerator: 7, Freezer: 180, Pantry: 4 },
  Fruits: { Refrigerator: 7, Freezer: 180, Pantry: 5 },
  Grains: { Refrigerator: 14, Freezer: 180, Pantry: 180 },
  Condiments: { Refrigerator: 60, Freezer: 180, Pantry: 120 },
  "Frozen food": { Refrigerator: 1, Freezer: 120, Pantry: 1 },
  Other: { Refrigerator: 5, Freezer: 60, Pantry: 7 },
};

export function estimateExpiry(
  addedDate: string,
  category: string,
  location: StorageLocation,
) {
  const days =
    EXPIRY_RULES[category]?.[location] ?? EXPIRY_RULES.Other[location];
  return format(addDays(parseISO(addedDate), days), "yyyy-MM-dd");
}

export function getExpiryStatus(
  expiryDate: string,
  today = new Date(),
): { status: ExpiryStatus; daysRemaining: number } {
  const daysRemaining = differenceInCalendarDays(
    parseISO(expiryDate),
    startOfDay(today),
  );
  const status =
    daysRemaining < 0
      ? "expired"
      : daysRemaining === 0
        ? "today"
        : daysRemaining <= 3
          ? "soon"
          : "fresh";
  return { status, daysRemaining };
}

export const isUsable = (expiryDate: string, today = new Date()) =>
  getExpiryStatus(expiryDate, today).status !== "expired";
