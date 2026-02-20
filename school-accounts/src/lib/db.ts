/**
 * lib/db.ts
 * Global Prisma Client singleton.
 *
 * Prisma v7 uses driver adapters. We use @prisma/adapter-pg with the `pg` pool.
 * In development, Next.js hot-reloading creates multiple module instances which
 * would exhaust the database connection pool. We store the client on the global
 * object to reuse the same instance across hot reloads.
 */

import { PrismaClient } from ".prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
