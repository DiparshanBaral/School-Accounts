/**
 * app/(auth)/layout.tsx
 * Minimal layout wrapper for auth pages (login, etc.)
 * No sidebar — clean centered layout.
 */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
