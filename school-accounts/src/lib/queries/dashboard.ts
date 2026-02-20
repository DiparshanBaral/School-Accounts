/**
 * lib/queries/dashboard.ts
 * Server-side aggregation queries for the dashboard.
 *
 * ACCOUNTING RULES:
 * - All queries exclude isVoided = true transactions
 * - Running balance = opening balance + sum(INCOME) - sum(EXPENSE)
 * - Use Prisma aggregate for precision (Decimal, not Float)
 */

import { db } from "@/lib/db";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { decimalToNumber } from "@/lib/utils";

// ─── Daily Summary ─────────────────────────────────────────────────────────

export async function getDailySummary(date: Date = new Date()) {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [incomeAgg, expenseAgg] = await Promise.all([
    db.transaction.aggregate({
      where: {
        type: "INCOME",
        isVoided: false,
        date: { gte: dayStart, lte: dayEnd },
      },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: {
        type: "EXPENSE",
        isVoided: false,
        date: { gte: dayStart, lte: dayEnd },
      },
      _sum: { amount: true },
    }),
  ]);

  const income = decimalToNumber(incomeAgg._sum.amount);
  const expense = decimalToNumber(expenseAgg._sum.amount);

  return {
    income,
    expense,
    net: income - expense,
  };
}

// ─── Monthly Summary ───────────────────────────────────────────────────────

export async function getMonthlySummary(date: Date = new Date()) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const [incomeAgg, expenseAgg] = await Promise.all([
    db.transaction.aggregate({
      where: {
        type: "INCOME",
        isVoided: false,
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: {
        type: "EXPENSE",
        isVoided: false,
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
  ]);

  const income = decimalToNumber(incomeAgg._sum.amount);
  const expense = decimalToNumber(expenseAgg._sum.amount);

  return {
    income,
    expense,
    net: income - expense,
  };
}

// ─── Running Balance ───────────────────────────────────────────────────────
// Formula: OpeningBalance + SUM(INCOME) - SUM(EXPENSE)

export async function getRunningBalance() {
  const [openingBalance, incomeAgg, expenseAgg] = await Promise.all([
    // Get the most recent opening balance
    db.openingBalance.findFirst({ orderBy: { date: "desc" } }),
    db.transaction.aggregate({
      where: { type: "INCOME", isVoided: false },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { type: "EXPENSE", isVoided: false },
      _sum: { amount: true },
    }),
  ]);

  const opening = decimalToNumber(openingBalance?.amount ?? 0);
  const income = decimalToNumber(incomeAgg._sum.amount);
  const expense = decimalToNumber(expenseAgg._sum.amount);

  return opening + income - expense;
}

// ─── Monthly Chart Data (last 6 months) ────────────────────────────────────

export interface MonthlyChartData {
  month: string; // e.g. "Aug 2025"
  income: number;
  expense: number;
}

export async function getMonthlyChartData(months = 6): Promise<MonthlyChartData[]> {
  const result: MonthlyChartData[] = [];

  // Build date ranges for each month going back
  for (let i = months - 1; i >= 0; i--) {
    const targetDate = subMonths(new Date(), i);
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);
    const label = format(targetDate, "MMM yyyy");

    const [incomeAgg, expenseAgg] = await Promise.all([
      db.transaction.aggregate({
        where: {
          type: "INCOME",
          isVoided: false,
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: {
          type: "EXPENSE",
          isVoided: false,
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),
    ]);

    result.push({
      month: label,
      income: decimalToNumber(incomeAgg._sum.amount),
      expense: decimalToNumber(expenseAgg._sum.amount),
    });
  }

  return result;
}

// ─── Category Breakdown ────────────────────────────────────────────────────

export interface CategoryBreakdown {
  name: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
}

export async function getCategoryBreakdown(date: Date = new Date()): Promise<CategoryBreakdown[]> {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const groups = await db.transaction.groupBy({
    by: ["categoryId"],
    where: {
      isVoided: false,
      date: { gte: monthStart, lte: monthEnd },
    },
    _sum: { amount: true },
  });

  const categories = await db.category.findMany({
    where: { id: { in: groups.map((g) => g.categoryId) } },
    select: { id: true, name: true, type: true },
  });

  return groups.map((g) => {
    const cat = categories.find((c) => c.id === g.categoryId);
    return {
      name: cat?.name ?? "Unknown",
      type: cat?.type ?? "EXPENSE",
      amount: decimalToNumber(g._sum.amount),
    };
  });
}

// ─── Recent Transactions ───────────────────────────────────────────────────

export async function getRecentTransactions(limit = 10) {
  return db.transaction.findMany({
    where: { isVoided: false },
    include: {
      category: { select: { name: true, type: true } },
      student: { select: { name: true, class: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
