/**
 * types/next-auth.d.ts
 * Extends NextAuth's built-in types to include custom fields:
 * - user.id
 * - user.role (our custom Role enum)
 *
 * This file must be in a place TypeScript can discover it.
 */

import type { Role } from "@prisma/client";
import type { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
  }
}
