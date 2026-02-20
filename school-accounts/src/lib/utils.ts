/**
 * lib/utils.ts
 * Shared utility functions used throughout the application.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

// ─── Tailwind class merger ─────────────────────────────────────────────────

/**
 * Merges Tailwind CSS classes without conflicts.
 * Uses clsx for conditional classes and tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency formatting ───────────────────────────────────────────────────

/**
 * Format a number or Decimal string as Nepali Rupees.
 * Always shows 2 decimal places.
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a raw number for display without currency symbol.
 */
export function formatAmount(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// ─── Date utilities ────────────────────────────────────────────────────────

/** Returns today as a YYYY-MM-DD string (local time). */
export function todayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Returns the first day of the current month as a Date. */
export function currentMonthStart(): Date {
  return startOfMonth(new Date());
}

/** Returns the last day of the current month as a Date. */
export function currentMonthEnd(): Date {
  return endOfMonth(new Date());
}

/** Wraps a date in day start/end for inclusive range queries. */
export function dayRange(date: Date): { gte: Date; lte: Date } {
  return { gte: startOfDay(date), lte: endOfDay(date) };
}

/** Formats a Date for display (e.g., "Feb 19, 2026"). */
export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM dd, yyyy");
}

/** Formats a Date to ISO date string (YYYY-MM-DD). */
export function toISODate(date: Date | string): string {
  return format(new Date(date), "yyyy-MM-dd");
}

// ─── Pagination ────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// ─── General helpers ───────────────────────────────────────────────────────

/** Converts Prisma Decimal (returned as string) to a JS number safely. */
export function decimalToNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  return parseFloat(String(value));
}
