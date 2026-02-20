/**
 * app/(app)/transactions/page.tsx
 * Paginated, filtered transaction list page.
 * Server component that reads search params and fetches data.
 */

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionTable } from "@/components/tables/TransactionTable";
import { TransactionFilters } from "@/components/forms/TransactionFilters";
import { AddTransactionButton } from "@/components/forms/AddTransactionButton";
import { transactionFilterSchema } from "@/lib/validations/transaction";
import { buildPaginationMeta, formatCurrency } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import Link from "next/link";

interface TransactionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;

  const filters = transactionFilterSchema.parse({
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    type: params.type,
    categoryId: params.categoryId,
    paymentMethod: params.paymentMethod,
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  });

  const { dateFrom, dateTo, type, categoryId, paymentMethod, page, limit } = filters;

  const where: Prisma.TransactionWhereInput = {
    isVoided: false,
    ...(type && { type }),
    ...(categoryId && { categoryId }),
    ...(paymentMethod && { paymentMethod }),
    ...(dateFrom || dateTo
      ? {
          date: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : {}),
  };

  const [transactions, total, categories, incomeSum, expenseSum] = await Promise.all([
    db.transaction.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, type: true } },
        student: { select: { id: true, name: true, class: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.transaction.count({ where }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.transaction.aggregate({
      where: { ...where, type: "INCOME" },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { ...where, type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ]);

  const pagination = buildPaginationMeta(total, page, limit);
  const totalIncome = parseFloat(incomeSum._sum.amount?.toString() ?? "0");
  const totalExpense = parseFloat(expenseSum._sum.amount?.toString() ?? "0");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} record{total !== 1 ? "s" : ""} found
          </p>
        </div>
        {session.user.role !== "VIEWER" && (
          <AddTransactionButton categories={categories} userId={session.user.id} />
        )}
      </div>

      {/* Filter bar */}
      <TransactionFilters categories={categories} />

      {/* Filtered totals */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3">
          <p className="text-xs text-green-600 font-medium">Filtered Income</p>
          <p className="text-lg font-bold text-green-700">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <p className="text-xs text-red-600 font-medium">Filtered Expense</p>
          <p className="text-lg font-bold text-red-700">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
          <p className="text-xs text-blue-600 font-medium">Filtered Net</p>
          <p className="text-lg font-bold text-blue-700">{formatCurrency(totalIncome - totalExpense)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <TransactionTable
          transactions={transactions}
          userRole={session.user.role}
          pagination={pagination}
        />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            {pagination.hasPrev && (
              <Link
                href={`/transactions?page=${page - 1}`}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                Previous
              </Link>
            )}
            {pagination.hasNext && (
              <Link
                href={`/transactions?page=${page + 1}`}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
