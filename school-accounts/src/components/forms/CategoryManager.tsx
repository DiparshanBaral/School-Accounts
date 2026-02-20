/**
 * components/forms/CategoryManager.tsx
 * Client component for creating, editing, and deleting categories.
 * Shows transaction count — prevents deletion if count > 0.
 */

"use client";

import { useState, useTransition } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories";
import { Plus, Edit, Trash2, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: { _count: { select: { transactions: true } } };
}>;

interface CategoryManagerProps {
  categories: CategoryWithCount[];
}

export function CategoryManager({ categories: initial }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initial);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  function handleCreate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCategory(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsAdding(false);
        showSuccess("Category created successfully");
        // Refresh page data
        window.location.reload();
      }
    });
  }

  function handleUpdate(id: string, formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateCategory(id, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditingId(null);
        showSuccess("Category updated");
        window.location.reload();
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result?.error) {
        setError(result.error);
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        showSuccess("Category deleted");
      }
    });
  }

  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Add form */}
      {isAdding && (
        <form
          action={handleCreate}
          className="bg-white rounded-xl border border-indigo-200 p-4 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              name="name"
              required
              placeholder="e.g. Tuition Fee"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select
              name="type"
              required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Category tables */}
      {(["INCOME", "EXPENSE"] as const).map((type) => {
        const items = type === "INCOME" ? incomeCategories : expenseCategories;
        return (
          <div key={type} className="bg-white rounded-xl border border-gray-200">
            <div
              className={cn(
                "px-5 py-3 border-b border-gray-100 rounded-t-xl",
                type === "INCOME" ? "bg-green-50" : "bg-red-50"
              )}
            >
              <span
                className={cn(
                  "text-sm font-semibold",
                  type === "INCOME" ? "text-green-700" : "text-red-700"
                )}
              >
                {type} Categories ({items.length})
              </span>
            </div>
            {items.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">No categories yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-2.5 text-xs text-gray-500 font-semibold uppercase">Name</th>
                    <th className="text-left px-5 py-2.5 text-xs text-gray-500 font-semibold uppercase">Transactions</th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((cat) =>
                    editingId === cat.id ? (
                      <tr key={cat.id} className="border-b border-gray-50">
                        <td colSpan={3} className="px-5 py-2">
                          <form
                            action={(fd) => handleUpdate(cat.id, fd)}
                            className="flex gap-2 items-center"
                          >
                            <input
                              name="name"
                              defaultValue={cat.name}
                              required
                              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input type="hidden" name="type" value={cat.type} />
                            <button
                              type="submit"
                              disabled={isPending}
                              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="text-gray-400 hover:text-gray-600 px-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-800">{cat.name}</td>
                        <td className="px-5 py-3 text-gray-500">{cat._count.transactions}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => setEditingId(cat.id)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              disabled={cat._count.transactions > 0}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              title={
                                cat._count.transactions > 0
                                  ? "Cannot delete — used in transactions"
                                  : "Delete"
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}
