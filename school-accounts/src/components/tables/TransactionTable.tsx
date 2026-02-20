/**
 * components/tables/TransactionTable.tsx
 * Full paginated transaction table with void/edit actions.
 */

"use client";

import { voidTransaction } from "@/actions/transactions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/lib/utils";
import type { Prisma, Role } from "@prisma/client";
import { useState, useTransition } from "react";
import { Trash2, Edit, AlertCircle } from "lucide-react";
import Link from "next/link";

type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: {
    category: { select: { id: true; name: true; type: true } };
    student: { select: { id: true; name: true; class: true } };
    createdBy: { select: { id: true; name: true } };
  };
}>;

interface TransactionTableProps {
  transactions: TransactionWithRelations[];
  userRole: Role;
  pagination: PaginationMeta;
}

export function TransactionTable({ transactions, userRole }: TransactionTableProps) {
  const [isPending, startTransition] = useTransition();
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleVoid(id: string) {
    if (!confirm("Are you sure you want to void this transaction? This cannot be undone.")) return;
    setVoidingId(id);
    setError(null);
    startTransition(async () => {
      const result = await voidTransaction(id);
      if (result?.error) setError(result.error);
      setVoidingId(null);
    });
  }

  if (transactions.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400 text-sm">
        No transactions found for the selected filters.
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mx-5 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ref</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
              {userRole === "ADMIN" && (
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr
                key={txn.id}
                className={cn(
                  "border-b border-gray-50 hover:bg-gray-50 transition-colors",
                  txn.isVoided && "opacity-50 bg-gray-50"
                )}
              >
                <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                  {formatDate(txn.date)}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      txn.type === "INCOME"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {txn.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-700">{txn.category.name}</td>
                <td className="px-5 py-3 text-gray-500">
                  {txn.student ? (
                    <Link
                      href={`/students/${txn.studentId}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {txn.student.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                    {txn.paymentMethod}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                  {txn.referenceNumber ?? "—"}
                </td>
                <td
                  className={cn(
                    "px-5 py-3 text-right font-semibold whitespace-nowrap",
                    txn.type === "INCOME" ? "text-green-600" : "text-red-600"
                  )}
                >
                  {txn.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(txn.amount.toString())}
                </td>
                {userRole === "ADMIN" && (
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/transactions/${txn.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      {!txn.isVoided && (
                        <button
                          onClick={() => handleVoid(txn.id)}
                          disabled={isPending && voidingId === txn.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Void transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
