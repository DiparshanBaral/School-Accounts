/**
 * lib/validations/category.ts
 * Zod schemas for category management.
 */

import { z } from "zod";
import { CategoryType } from "@prisma/client";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name is too long"),
  type: z.nativeEnum(CategoryType),
});

export type CategoryInput = z.infer<typeof categorySchema>;
