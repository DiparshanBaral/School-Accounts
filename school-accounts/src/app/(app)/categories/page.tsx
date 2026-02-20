/**
 * app/(app)/categories/page.tsx
 * Category management page — ADMIN only.
 */

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CategoryManager } from "@/components/forms/CategoryManager";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const categories = await db.category.findMany({
    include: {
      _count: { select: { transactions: true } },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage income and expense categories
          </p>
        </div>
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}
