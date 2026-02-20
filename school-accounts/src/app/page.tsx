/**
 * app/page.tsx
 * Root redirect — sends visitors straight to dashboard (middleware handles auth).
 */

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
