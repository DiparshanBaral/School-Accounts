/**
 * actions/transactions.ts
 * Server actions for transaction CRUD operations.
 *
 * All actions validate input with Zod and enforce role-based access.
 * Transactions are NEVER deleted — only voided (isVoided = true).
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { transactionSchema } from "@/lib/validations/transaction";
import type { TransactionFilterInput } from "@/lib/validations/transaction";
import { buildPaginationMeta } from "@/lib/utils";
import { Prisma } from "@prisma/client";

// ─── Create Transaction ────────────────────────────────────────────────────

export async function createTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role === "VIEWER") return { error: "Access denied" };

  const raw = {
    type: formData.get("type"),
    date: formData.get("date"),
    amount: formData.get("amount"),
    categoryId: formData.get("categoryId"),
    studentId: formData.get("studentId") || undefined,
    paymentMethod: formData.get("paymentMethod"),
    referenceNumber: formData.get("referenceNumber") || undefined,
    description: formData.get("description") || undefined,
  };

  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  try {
    const transaction = await db.transaction.create({
      data: {
        type: data.type,
        date: new Date(data.date),
        // Use Prisma.Decimal to ensure exact precision — never use parseFloat here
        amount: new Prisma.Decimal(data.amount),
        categoryId: data.categoryId,
        studentId: data.studentId || null,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber || null,
        description: data.description || null,
        createdById: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true, id: transaction.id };
  } catch (error) {
    console.error("createTransaction error:", error);
    return { error: "Failed to create transaction. Please try again." };
  }
}

// ─── Update Transaction (ADMIN only) ──────────────────────────────────────

export async function updateTransaction(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "ADMIN") return { error: "Only admins can edit transactions" };

  const raw = {
    type: formData.get("type"),
    date: formData.get("date"),
    amount: formData.get("amount"),
    categoryId: formData.get("categoryId"),
    studentId: formData.get("studentId") || undefined,
    paymentMethod: formData.get("paymentMethod"),
    referenceNumber: formData.get("referenceNumber") || undefined,
    description: formData.get("description") || undefined,
  };

  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  try {
    await db.transaction.update({
      where: { id },
      data: {
        type: data.type,
        date: new Date(data.date),
        amount: new Prisma.Decimal(data.amount),
        categoryId: data.categoryId,
        studentId: data.studentId || null,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber || null,
        description: data.description || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.error("updateTransaction error:", error);
    return { error: "Failed to update transaction." };
  }
}

// ─── Void Transaction (ADMIN only) ────────────────────────────────────────
// CRITICAL: Never delete transactions. Set isVoided = true.

export async function voidTransaction(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "ADMIN") return { error: "Only admins can void transactions" };

  try {
    await db.transaction.update({
      where: { id },
      data: { isVoided: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.error("voidTransaction error:", error);
    return { error: "Failed to void transaction." };
  }
}

// ─── Get Transactions (paginated + filtered) ──────────────────────────────

export async function getTransactions(filters: TransactionFilterInput) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

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

  const [transactions, total] = await Promise.all([
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
  ]);

  return {
    data: transactions,
    pagination: buildPaginationMeta(total, page, limit),
  };
}
