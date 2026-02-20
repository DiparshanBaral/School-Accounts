/**
 * components/forms/TransactionFilters.tsx
 * Client-side filter bar for the transactions list page.
 * Updates URL search params on change for server-side filtering.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { Category } from "@prisma/client";

interface TransactionFiltersProps {
  categories: Category[];
}

export function TransactionFilters({ categories }: TransactionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when filters change
      params.set("page", "1");
      router.push(`/transactions?${params.toString()}`);
    },
    [router, searchParams]
  );

  function clearFilters() {
    router.push("/transactions");
  }

  const hasFilters = Array.from(searchParams.keys()).some((k) => k !== "page");

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Date From */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">From</label>
          <input
            type="date"
            defaultValue={searchParams.get("dateFrom") ?? ""}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">To</label>
          <input
            type="date"
            defaultValue={searchParams.get("dateTo") ?? ""}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Type */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Type</label>
          <select
            defaultValue={searchParams.get("type") ?? ""}
            onChange={(e) => updateFilter("type", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Category</label>
          <select
            defaultValue={searchParams.get("categoryId") ?? ""}
            onChange={(e) => updateFilter("categoryId", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.type})
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Method</label>
          <select
            defaultValue={searchParams.get("paymentMethod") ?? ""}
            onChange={(e) => updateFilter("paymentMethod", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="BANK">Bank</option>
            <option value="ESEWA">eSewa</option>
            <option value="KHALTI">Khalti</option>
          </select>
        </div>

        {/* Clear button */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-1.5 text-sm text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg hover:border-red-200 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
