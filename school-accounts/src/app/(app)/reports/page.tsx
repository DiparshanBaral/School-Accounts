/**
 * app/(app)/reports/page.tsx
 * Summary reports page — read accessible to all roles.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatCurrency, decimalToNumber } from "@/lib/utils";
import { getMonthlyChartData } from "@/lib/queries/dashboard";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [chartData, totalIncome, totalExpense, topCategories] = await Promise.all([
    getMonthlyChartData(12),
    db.transaction.aggregate({
      where: { type: "INCOME", isVoided: false },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { type: "EXPENSE", isVoided: false },
      _sum: { amount: true },
    }),
    db.transaction.groupBy({
      by: ["categoryId"],
      where: { isVoided: false },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    }),
  ]);

  // Resolve category names
  const categoryIds = topCategories.map((g: { categoryId: string }) => g.categoryId);
  const categories = await db.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, type: true },
  });

  const income = decimalToNumber(totalIncome._sum.amount);
  const expense = decimalToNumber(totalExpense._sum.amount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">All-time financial summary</p>
      </div>

      {/* All-time totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">All-Time Income</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(income)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">All-Time Expense</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(expense)}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Net Balance</p>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{formatCurrency(income - expense)}</p>
        </div>
      </div>

      {/* 12-month chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Income vs Expense — Last 12 Months
        </h2>
        <IncomeExpenseChart data={chartData} />
      </div>

      {/* Top 5 categories */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Top 5 Categories (All Time)</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            {topCategories.map((group: { categoryId: string; _sum: { amount: unknown } }) => {
              const cat = categories.find((c) => c.id === group.categoryId);
              return (
                <tr key={group.categoryId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{cat?.name ?? "Unknown"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        cat?.type === "INCOME"
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {cat?.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-900">
                    {formatCurrency(decimalToNumber(group._sum.amount))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
