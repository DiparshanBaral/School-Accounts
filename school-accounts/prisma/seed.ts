/**
 * prisma/seed.ts
 * Seed script for development data.
 *
 * Creates:
 *  - 3 users (admin, accountant, viewer)
 *  - 8 categories (income + expense)
 *  - 5 students
 *  - 1 opening balance
 *  - 20 sample transactions
 *
 * Run with: npx prisma db seed
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Clean slate ────────────────────────────────────────────────
  await prisma.transaction.deleteMany();
  await prisma.openingBalance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ──────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@school.edu",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const accountant = await prisma.user.create({
    data: {
      name: "Accountant User",
      email: "accountant@school.edu",
      password: hashedPassword,
      role: "ACCOUNTANT",
    },
  });

  await prisma.user.create({
    data: {
      name: "Viewer User",
      email: "viewer@school.edu",
      password: hashedPassword,
      role: "VIEWER",
    },
  });

  console.log("✅ Users created");

  // ─── Categories ──────────────────────────────────────────────────
  const [tuitionFee, admissionFee, examFee, donationIncome] = await Promise.all([
    prisma.category.create({ data: { name: "Tuition Fee", type: "INCOME" } }),
    prisma.category.create({ data: { name: "Admission Fee", type: "INCOME" } }),
    prisma.category.create({ data: { name: "Exam Fee", type: "INCOME" } }),
    prisma.category.create({ data: { name: "Donation", type: "INCOME" } }),
  ]);

  const [salaryExpense, utilityExpense, maintenanceExpense, stationeryExpense] = await Promise.all([
    prisma.category.create({ data: { name: "Salary", type: "EXPENSE" } }),
    prisma.category.create({ data: { name: "Utilities", type: "EXPENSE" } }),
    prisma.category.create({ data: { name: "Maintenance", type: "EXPENSE" } }),
    prisma.category.create({ data: { name: "Stationery", type: "EXPENSE" } }),
  ]);

  console.log("✅ Categories created");

  // ─── Students ────────────────────────────────────────────────────
  const students = await Promise.all([
    prisma.student.create({ data: { name: "Arjun Thapa", class: "Grade 10", rollNo: "01", status: "ACTIVE" } }),
    prisma.student.create({ data: { name: "Sita Rai", class: "Grade 10", rollNo: "02", status: "ACTIVE" } }),
    prisma.student.create({ data: { name: "Ram Poudel", class: "Grade 9", rollNo: "01", status: "ACTIVE" } }),
    prisma.student.create({ data: { name: "Gita Sharma", class: "Grade 9", rollNo: "02", status: "ACTIVE" } }),
    prisma.student.create({ data: { name: "Krishna Adhikari", class: "Grade 8", rollNo: "01", status: "INACTIVE" } }),
  ]);

  console.log("✅ Students created");

  // ─── Opening Balance ─────────────────────────────────────────────
  await prisma.openingBalance.create({
    data: {
      amount: "50000.00",
      date: new Date("2026-01-01"),
    },
  });

  console.log("✅ Opening balance created");

  // ─── Transactions ─────────────────────────────────────────────────
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const txnData = [
    // Today's transactions
    { type: "INCOME" as const, date: today, amount: "15000.00", categoryId: tuitionFee.id, studentId: students[0].id, paymentMethod: "CASH" as const, description: "Jan tuition - Arjun" },
    { type: "INCOME" as const, date: today, amount: "15000.00", categoryId: tuitionFee.id, studentId: students[1].id, paymentMethod: "ESEWA" as const, description: "Jan tuition - Sita", referenceNumber: "ESW-001" },
    { type: "EXPENSE" as const, date: today, amount: "5000.00", categoryId: stationeryExpense.id, paymentMethod: "CASH" as const, description: "Office stationery purchase" },

    // This month
    { type: "INCOME" as const, date: new Date(now.getFullYear(), now.getMonth(), 5), amount: "25000.00", categoryId: admissionFee.id, studentId: students[2].id, paymentMethod: "BANK" as const, referenceNumber: "BANK-202601", description: "New admission fee - Ram" },
    { type: "INCOME" as const, date: new Date(now.getFullYear(), now.getMonth(), 7), amount: "15000.00", categoryId: tuitionFee.id, studentId: students[2].id, paymentMethod: "CASH" as const },
    { type: "INCOME" as const, date: new Date(now.getFullYear(), now.getMonth(), 8), amount: "15000.00", categoryId: tuitionFee.id, studentId: students[3].id, paymentMethod: "KHALTI" as const, referenceNumber: "KHL-4421" },
    { type: "EXPENSE" as const, date: new Date(now.getFullYear(), now.getMonth(), 10), amount: "80000.00", categoryId: salaryExpense.id, paymentMethod: "BANK" as const, referenceNumber: "BANK-SAL-FEB", description: "February staff salary" },
    { type: "EXPENSE" as const, date: new Date(now.getFullYear(), now.getMonth(), 12), amount: "3500.00", categoryId: utilityExpense.id, paymentMethod: "BANK" as const, description: "Electricity bill" },
    { type: "INCOME" as const, date: new Date(now.getFullYear(), now.getMonth(), 14), amount: "5000.00", categoryId: examFee.id, studentId: students[0].id, paymentMethod: "CASH" as const, description: "Board exam fee" },
    { type: "INCOME" as const, date: new Date(now.getFullYear(), now.getMonth(), 14), amount: "5000.00", categoryId: examFee.id, studentId: students[1].id, paymentMethod: "CASH" as const },

    // Last month
    { type: "INCOME" as const, date: new Date(now.getFullYear(), now.getMonth() - 1, 5), amount: "15000.00", categoryId: tuitionFee.id, studentId: students[0].id, paymentMethod: "CASH" as const },
    { type: "INCOME" as const, date: new Date(now.getFullYear(), now.getMonth() - 1, 5), amount: "15000.00", categoryId: tuitionFee.id, studentId: students[1].id, paymentMethod: "CASH" as const },
    { type: "INCOME" as const, date: new Date(now.getFullYear(), now.getMonth() - 1, 5), amount: "15000.00", categoryId: tuitionFee.id, studentId: students[2].id, paymentMethod: "ESEWA" as const },
    { type: "EXPENSE" as const, date: new Date(now.getFullYear(), now.getMonth() - 1, 10), amount: "80000.00", categoryId: salaryExpense.id, paymentMethod: "BANK" as const, description: "January staff salary" },
    { type: "EXPENSE" as const, date: new Date(now.getFullYear(), now.getMonth() - 1, 15), amount: "8500.00", categoryId: maintenanceExpense.id, paymentMethod: "CASH" as const, description: "Roof repair - block B" },
    { type: "INCOME" as const, date: new Date(now.getFullYear(), now.getMonth() - 1, 20), amount: "20000.00", categoryId: donationIncome.id, paymentMethod: "BANK" as const, referenceNumber: "BANK-DON-001", description: "Alumni donation" },

    // Older
    { type: "INCOME" as const, date: new Date(now.getFullYear(), now.getMonth() - 2, 5), amount: "15000.00", categoryId: tuitionFee.id, studentId: students[0].id, paymentMethod: "CASH" as const },
    { type: "EXPENSE" as const, date: new Date(now.getFullYear(), now.getMonth() - 2, 10), amount: "80000.00", categoryId: salaryExpense.id, paymentMethod: "BANK" as const },
    { type: "INCOME" as const, date: new Date(now.getFullYear(), now.getMonth() - 3, 5), amount: "15000.00", categoryId: tuitionFee.id, studentId: students[1].id, paymentMethod: "CASH" as const },
    // One voided transaction to demonstrate the feature
    { type: "INCOME" as const, date: today, amount: "999.00", categoryId: tuitionFee.id, paymentMethod: "CASH" as const, description: "TEST — should be voided", isVoided: true },
  ];

  for (const txn of txnData) {
    await prisma.transaction.create({
      data: {
        type: txn.type,
        date: txn.date,
        amount: txn.amount,
        categoryId: txn.categoryId,
        studentId: txn.studentId ?? null,
        paymentMethod: txn.paymentMethod,
        referenceNumber: txn.referenceNumber ?? null,
        description: txn.description ?? null,
        isVoided: txn.isVoided ?? false,
        createdById: txn.type === "INCOME" ? accountant.id : admin.id,
      },
    });
  }

  console.log("✅ Transactions created");
  console.log("");
  console.log("─────────────────────────────────────");
  console.log("  Seed complete! Login credentials:");
  console.log("─────────────────────────────────────");
  console.log("  ADMIN      → admin@school.edu");
  console.log("  ACCOUNTANT → accountant@school.edu");
  console.log("  VIEWER     → viewer@school.edu");
  console.log("  Password   → password123");
  console.log("─────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
