/**
 * components/layout/Sidebar.tsx
 * Collapsible sidebar navigation with role-based menu visibility.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Users,
  BarChart2,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "ACCOUNTANT", "VIEWER"],
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: ArrowLeftRight,
    roles: ["ADMIN", "ACCOUNTANT"],
  },
  {
    href: "/categories",
    label: "Categories",
    icon: Tags,
    roles: ["ADMIN"],
  },
  {
    href: "/students",
    label: "Students",
    icon: Users,
    roles: ["ADMIN", "ACCOUNTANT"],
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart2,
    roles: ["ADMIN", "ACCOUNTANT", "VIEWER"],
  },
];

interface SidebarProps {
  userRole: Role;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">School Accounts</p>
          <p className="text-xs text-gray-400">{userRole}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-gray-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Role Badge */}
      <div className="px-6 py-4 border-t border-gray-200">
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            userRole === "ADMIN"
              ? "bg-purple-100 text-purple-700"
              : userRole === "ACCOUNTANT"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          )}
        >
          {userRole}
        </span>
      </div>
    </aside>
  );
}
