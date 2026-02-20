/**
 * app/(app)/dashboard/page.tsx
 * Main dashboard — server component.
 * Fetches all financial summaries server-side for performance and accuracy.
 */

import {
  getDailySummary,
  getMonthlySummary,
  getRunningBalance,
  getMonthlyChartData,
  getCategoryBreakdown,
  getRecentTransactions,
} from "@/lib/queries/dashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, Scale } from "lucide-react";

export default async function DashboardPage() {
  // All data fetched in parallel for optimal performance
  const [daily, monthly, runningBalance, chartData, categoryData, recentTxns] =
    await Promise.all([
      getDailySummary(),
      getMonthlySummary(),
      getRunningBalance(),
      getMonthlyChartData(6),
      getCategoryBreakdown(),
      getRecentTransactions(10),
    ]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Financial overview — {new Date().toLocaleDateString("en-NP", { dateStyle: "full" })}
        </p>
      </div>

      {/* Today's Summary Cards */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Today
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Income"
            value={formatCurrency(daily.income)}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            title="Today's Expense"
            value={formatCurrency(daily.expense)}
            icon={TrendingDown}
            iconColor="text-red-600"
            iconBg="bg-red-50"
          />
          <StatCard
            title="Today's Net"
            value={formatCurrency(daily.net)}
            icon={Scale}
            iconColor={daily.net >= 0 ? "text-blue-600" : "text-orange-600"}
            iconBg={daily.net >= 0 ? "bg-blue-50" : "bg-orange-50"}
          />
          <StatCard
            title="Running Balance"
            value={formatCurrency(runningBalance)}
            icon={Wallet}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
            highlight
          />
        </div>
      </section>

      {/* Monthly Summary Cards */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          This Month
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Monthly Income"
            value={formatCurrency(monthly.income)}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            title="Monthly Expense"
            value={formatCurrency(monthly.expense)}
            icon={TrendingDown}
            iconColor="text-red-600"
            iconBg="bg-red-50"
          />
          <StatCard
            title="Monthly Net"
            value={formatCurrency(monthly.net)}
            icon={Scale}
            iconColor={monthly.net >= 0 ? "text-blue-600" : "text-orange-600"}
            iconBg={monthly.net >= 0 ? "bg-blue-50" : "bg-orange-50"}
          />
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Income vs Expense (Last 6 Months)
          </h3>
          <IncomeExpenseChart data={chartData} />
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Category Breakdown (This Month)
          </h3>
          <CategoryPieChart data={categoryData} />
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">
            Recent Transactions
          </h3>
        </div>
        <RecentTransactionsTable transactions={recentTxns} />
      </section>
    </div>
  );
}
