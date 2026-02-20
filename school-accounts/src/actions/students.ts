/**
 * actions/students.ts
 * Server actions for student management.
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { studentSchema } from "@/lib/validations/student";

export async function createStudent(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role === "VIEWER") return { error: "Access denied" };

  const parsed = studentSchema.safeParse({
    name: formData.get("name"),
    class: formData.get("class"),
    rollNo: formData.get("rollNo"),
    status: formData.get("status") || "ACTIVE",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const student = await db.student.create({ data: parsed.data });
    revalidatePath("/students");
    return { success: true, id: student.id };
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return { error: "A student with this roll number already exists in this class." };
    }
    return { error: "Failed to create student." };
  }
}

export async function updateStudent(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role === "VIEWER") return { error: "Access denied" };

  const parsed = studentSchema.safeParse({
    name: formData.get("name"),
    class: formData.get("class"),
    rollNo: formData.get("rollNo"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await db.student.update({ where: { id }, data: parsed.data });
    revalidatePath("/students");
    revalidatePath(`/students/${id}`);
    return { success: true };
  } catch {
    return { error: "Failed to update student." };
  }
}

export async function getStudentTransactions(studentId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const transactions = await db.transaction.findMany({
    where: { studentId, isVoided: false },
    include: {
      category: { select: { name: true, type: true } },
    },
    orderBy: { date: "desc" },
  });

  return { data: transactions };
}
