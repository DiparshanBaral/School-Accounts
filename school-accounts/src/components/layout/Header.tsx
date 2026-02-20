/**
 * components/layout/Header.tsx
 * Top navigation header with user info and logout button.
 */

"use client";

import { logoutAction } from "@/actions/auth";
import { LogOut, User } from "lucide-react";
import type { Role } from "@prisma/client";

interface HeaderUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role: Role;
}

interface HeaderProps {
  user: HeaderUser;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div>
        <h2 className="text-sm font-medium text-gray-500">
          School Cash Accounting System
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
