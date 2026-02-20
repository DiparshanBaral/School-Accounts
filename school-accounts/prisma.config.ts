/**
 * prisma.config.ts
 * Prisma v7 configuration.
 * Datasource URL is provided here (not in schema.prisma in v7).
 */

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },

  datasource: {
    // Use process.env directly so `prisma generate` doesn't fail in CI
    // when DATABASE_URL isn't set (generate doesn't need a live DB connection)
    url: process.env.DATABASE_URL ?? "",
  },
});
