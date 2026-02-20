/**
 * lib/validations/transaction.ts
 * Zod schemas for transaction creation and editing.
 * All monetary inputs are validated as strings then coerced to numbers
 * to avoid floating-point issues. Prisma handles Decimal serialization.
 */

import { z } from "zod";
import { TransactionType, PaymentMethod } from "@prisma/client";

export const transactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  date: z
    .string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Amount must be a positive number"
    ),
  categoryId: z.string().uuid("Invalid category"),
  studentId: z.string().uuid("Invalid student").optional().or(z.literal("")),
  paymentMethod: z.nativeEnum(PaymentMethod),
  referenceNumber: z.string().max(100).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const transactionFilterSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  categoryId: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
