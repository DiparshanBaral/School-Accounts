/**
 * lib/validations/student.ts
 * Zod schemas for student management.
 */

import { z } from "zod";
import { StudentStatus } from "@prisma/client";

export const studentSchema = z.object({
  name: z
    .string()
    .min(1, "Student name is required")
    .max(150, "Name is too long"),
  class: z.string().min(1, "Class is required").max(50),
  rollNo: z.string().min(1, "Roll number is required").max(20),
  status: z.nativeEnum(StudentStatus).default(StudentStatus.ACTIVE),
});

export type StudentInput = z.infer<typeof studentSchema>;
