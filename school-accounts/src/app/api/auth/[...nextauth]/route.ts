/**
 * app/api/auth/[...nextauth]/route.ts
 * Mounts the NextAuth v5 handlers on Next.js App Router.
 * GET  → used for sign-out redirects
 * POST → used for sign-in credential submission
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
