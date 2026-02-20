# School Accounts

A production-ready school accounting system built with **Next.js 16 (App Router)**, **TypeScript**, **PostgreSQL**, **Prisma ORM v7**, **NextAuth v5**, **TailwindCSS**, and **Recharts**.

---

## ✨ Features

- **Role-based access control** — ADMIN, ACCOUNTANT, VIEWER
- **Dashboard** — daily/monthly income & expense summaries, running balance, charts, recent transactions
- **Transactions** — create, void (never hard-delete), filter by date range / type / category, pagination
- **Categories** — CRUD with deletion guard (cannot delete a category that has transactions)
- **Students** — register students, view individual transaction history with aggregated totals
- **Reports** — 12-month income vs. expense line chart, top 5 categories breakdown

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 – App Router + Server Actions |
| Language | TypeScript |
| Styling | TailwindCSS |
| Database | PostgreSQL |
| ORM | Prisma v7.4 with `@prisma/adapter-pg` |
| Auth | NextAuth v5 (credentials, JWT) |
| Validation | Zod v4 |
| Charts | Recharts |
| Icons | Lucide React |

---

## 📋 Prerequisites

- **Node.js** ≥ 18.x (v22 recommended)
- **npm** ≥ 10.x
- **PostgreSQL** 14+ running locally (or a remote URL)

---

## 🚀 Local Setup

### 1 — Clone the project

```bash
git clone <your-repo-url>
cd school-accounts
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Configure environment variables

Create a `.env` file in the project root:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/school_accounting"

# NextAuth — generate a strong secret: npx auth secret
AUTH_SECRET="your-super-secret-key-change-this-in-production"

# NextAuth public URL
NEXTAUTH_URL="http://localhost:3000"
```

> **Tip:** Generate a cryptographically secure `AUTH_SECRET` with:
> ```bash
> npx auth secret
> ```

### 4 — Create the database

Make sure your PostgreSQL server is running, then create the database:

```bash
createdb school_accounting
```

### 5 — Run migrations

```bash
npx prisma migrate dev --name init
```

This creates all tables, indexes, and enums defined in `prisma/schema.prisma`.

### 6 — Seed sample data

```bash
npm run seed
# or directly: npx tsx prisma/seed.ts
```

This creates:
- 3 users with different roles
- 8 categories (income + expense)
- 5 students
- 1 opening balance (NPR 50,000)
- 20 sample transactions spread across the last 3 months (including 1 voided transaction)

### 7 — Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|---|---|---|
| **ADMIN** | `admin@school.edu` | `password123` |
| **ACCOUNTANT** | `accountant@school.edu` | `password123` |
| **VIEWER** | `viewer@school.edu` | `password123` |

> ⚠️ Change all passwords before deploying to production.

---

## 🏗 Project Structure

```
school-accounts/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Development seed data
│   └── migrations/            # Auto-generated SQL migrations
├── prisma.config.ts           # Prisma v7 config (datasource URL lives here)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/         # Public login page
│   │   ├── (app)/
│   │   │   ├── dashboard/     # Dashboard with stats and charts
│   │   │   ├── transactions/  # Transaction list with filters
│   │   │   ├── categories/    # Category management (ADMIN only)
│   │   │   ├── students/      # Student list + [id] detail page
│   │   │   └── reports/       # Monthly reports
│   │   └── api/auth/          # NextAuth route handlers
│   ├── actions/               # Next.js Server Actions
│   │   ├── auth.ts
│   │   ├── transactions.ts
│   │   ├── categories.ts
│   │   └── students.ts
│   ├── components/
│   │   ├── charts/            # Recharts wrappers
│   │   ├── dashboard/         # StatCard, RecentTransactionsTable
│   │   ├── forms/             # Client-side form components
│   │   ├── layout/            # Sidebar, Header
│   │   └── tables/            # TransactionTable, StudentList
│   ├── lib/
│   │   ├── auth.ts            # NextAuth v5 config
│   │   ├── db.ts              # Prisma singleton with PrismaPg adapter
│   │   ├── utils.ts           # cn(), formatCurrency(), helpers
│   │   ├── queries/           # Server-side DB query functions
│   │   └── validations/       # Zod schemas
│   ├── middleware.ts           # Route protection
│   └── types/
│       └── next-auth.d.ts     # NextAuth type extensions
└── .env                       # Environment variables (never commit!)
```

---

## 🔒 Role Permissions

| Feature | ADMIN | ACCOUNTANT | VIEWER |
|---|:---:|:---:|:---:|
| View dashboard | ✅ | ✅ | ✅ |
| View reports | ✅ | ✅ | ✅ |
| View transactions | ✅ | ✅ | ✅ |
| Create transaction | ✅ | ✅ | ❌ |
| Void transaction | ✅ | ✅ | ❌ |
| View students | ✅ | ✅ | ❌ |
| Add/edit student | ✅ | ✅ | ❌ |
| Manage categories | ✅ | ❌ | ❌ |

---

## 🗄 Database Notes

- **Money fields** use `Decimal(12,2)` — never `Float` — to avoid floating-point precision errors.
- **Transactions are never deleted.** Use `voidTransaction()` which sets `isVoided = true`. Voided transactions are excluded from all financial calculations.
- **Opening balance** is a separate record (date-stamped). The running balance is computed as: `opening_balance + SUM(INCOME) - SUM(EXPENSE)` over all non-voided transactions.

---

## 🧰 Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run seed` | Seed development data |
| `npx prisma studio` | Open Prisma Studio (database GUI) |
| `npx prisma migrate dev --name <name>` | Create + apply a new migration |
| `npx prisma migrate reset` | Reset DB and re-run all migrations + seed |
| `npx prisma generate` | Regenerate Prisma Client after schema changes |
| `npx tsc --noEmit` | TypeScript type-check without emitting files |

---

## 🚢 Production Deployment

1. Set all environment variables on your hosting platform.
2. Run `npx prisma migrate deploy` (applies pending migrations without prompting).
3. Run `npm run build` then `npm start`.

> Do **not** run `seed.ts` in production — it deletes all existing data first.
