/**
 * app/(app)/students/page.tsx
 * Student management page.
 */

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentList } from "@/components/tables/StudentList";
import { AddStudentButton } from "@/components/forms/AddStudentButton";

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "VIEWER") redirect("/dashboard");

  const students = await db.student.findMany({
    include: {
      _count: { select: { transactions: true } },
    },
    orderBy: [{ class: "asc" }, { rollNo: "asc" }],
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">
            {students.length} student{students.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <AddStudentButton />
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <StudentList students={students} userRole={session.user.role} />
      </div>
    </div>
  );
}
