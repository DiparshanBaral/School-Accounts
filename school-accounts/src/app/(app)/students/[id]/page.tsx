/**
 * app/(app)/students/[id]/page.tsx
 * Individual student detail page with transaction history.
 */

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const student = await db.student.findUnique({
    where: { id },
    include: {
      transactions: {
        where: { isVoided: false },
        include: {
          category: { select: { name: true, type: true } },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!student) notFound();

  // Aggregate totals for this student
  const totalIncome = student.transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const totalExpense = student.transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Back link */}
      <Link
        href="/students"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </Link>

      {/* Student card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Class {student.class} · Roll No {student.rollNo}
            </p>
          </div>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold",
              student.status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            )}
          >
            {student.status}
          </span>
        </div>

        {/* Financial summary */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Total Income</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Expense</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Net</p>
            <p
              className={cn(
                "text-lg font-bold",
                totalIncome - totalExpense >= 0 ? "text-blue-600" : "text-orange-600"
              )}
            >
              {formatCurrency(totalIncome - totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">
            Transaction History ({student.transactions.length})
          </h2>
        </div>
        {student.transactions.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">
            No transactions for this student.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {student.transactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{formatDate(txn.date)}</td>
                    <td className="px-5 py-3 text-gray-700">{txn.category.name}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {txn.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{txn.description ?? "—"}</td>
                    <td
                      className={cn(
                        "px-5 py-3 text-right font-semibold whitespace-nowrap",
                        txn.type === "INCOME" ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {txn.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(txn.amount.toString())}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
