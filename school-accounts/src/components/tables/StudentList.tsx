/**
 * components/tables/StudentList.tsx
 * Student table with edit capability and link to detail page.
 */

"use client";

import { cn } from "@/lib/utils";
import type { Prisma, Role } from "@prisma/client";
import Link from "next/link";
import { Eye } from "lucide-react";

type StudentWithCount = Prisma.StudentGetPayload<{
  include: { _count: { select: { transactions: true } } };
}>;

interface StudentListProps {
  students: StudentWithCount[];
  userRole: Role;
}

export function StudentList({ students }: StudentListProps) {
  if (students.length === 0) {
    return (
      <div className="py-14 text-center text-gray-400 text-sm">
        No students registered yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Class</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Roll No</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Transactions</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3 font-medium text-gray-900">{student.name}</td>
              <td className="px-5 py-3 text-gray-600">{student.class}</td>
              <td className="px-5 py-3 text-gray-600">{student.rollNo}</td>
              <td className="px-5 py-3">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-semibold",
                    student.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {student.status}
                </span>
              </td>
              <td className="px-5 py-3 text-gray-500">{student._count.transactions}</td>
              <td className="px-5 py-3">
                <Link
                  href={`/students/${student.id}`}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
