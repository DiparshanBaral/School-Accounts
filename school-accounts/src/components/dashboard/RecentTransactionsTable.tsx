/**
 * components/dashboard/RecentTransactionsTable.tsx
 * Displays the last N transactions on the dashboard.
 * Server-rendered component — receives pre-fetched data as props.
 */

import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Prisma } from "@prisma/client";
import Link from "next/link";

type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: {
    category: { select: { name: true; type: true } };
    student: { select: { name: true; class: true } };
    createdBy: { select: { name: true } };
  };
}>;

interface RecentTransactionsTableProps {
  transactions: TransactionWithRelations[];
}

export function RecentTransactionsTable({ transactions }: RecentTransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-gray-400 text-sm">
        No transactions recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Date
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Category
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Student
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Method
            </th>
            <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                {formatDate(txn.date)}
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex w-1.5 h-1.5 rounded-full",
                      txn.type === "INCOME" ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                  <span className="text-gray-700">{txn.category.name}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-gray-500">
                {txn.student ? `${txn.student.name} (${txn.student.class})` : "—"}
              </td>
              <td className="px-5 py-3">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                  {txn.paymentMethod}
                </span>
              </td>
              <td
                className={cn(
                  "px-5 py-3 text-right font-semibold whitespace-nowrap",
                  txn.type === "INCOME" ? "text-green-600" : "text-red-600"
                )}
              >
                {txn.type === "INCOME" ? "+" : "-"}{formatCurrency(txn.amount.toString())}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-5 py-3 border-t border-gray-100">
        <Link
          href="/transactions"
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View all transactions →
        </Link>
      </div>
    </div>
  );
}
