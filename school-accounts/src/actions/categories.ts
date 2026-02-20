/**
 * actions/categories.ts
 * Server actions for category management.
 * Prevents deletion if category is referenced by any transaction.
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { categorySchema } from "@/lib/validations/category";

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role === "VIEWER") return { error: "Access denied" };

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const category = await db.category.create({
      data: parsed.data,
    });
    revalidatePath("/categories");
    return { success: true, id: category.id };
  } catch (error: unknown) {
    // Handle unique constraint violation
    if ((error as { code?: string })?.code === "P2002") {
      return { error: "A category with this name already exists." };
    }
    return { error: "Failed to create category." };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "ADMIN") return { error: "Only admins can edit categories" };

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await db.category.update({ where: { id }, data: parsed.data });
    revalidatePath("/categories");
    return { success: true };
  } catch {
    return { error: "Failed to update category." };
  }
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "ADMIN") return { error: "Only admins can delete categories" };

  // Prevent deletion if any transaction references this category
  const transactionCount = await db.transaction.count({
    where: { categoryId: id },
  });

  if (transactionCount > 0) {
    return {
      error: `Cannot delete: ${transactionCount} transaction(s) use this category. Consider renaming it instead.`,
    };
  }

  try {
    await db.category.delete({ where: { id } });
    revalidatePath("/categories");
    return { success: true };
  } catch {
    return { error: "Failed to delete category." };
  }
}

export async function getCategories() {
  return db.category.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}
