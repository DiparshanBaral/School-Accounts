/**
 * components/dashboard/StatCard.tsx
 * Reusable summary metric card for the dashboard.
 */

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  highlight?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-gray-600",
  iconBg = "bg-gray-100",
  highlight = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 flex items-start gap-4",
        highlight
          ? "bg-indigo-600 border-indigo-600 text-white"
          : "bg-white border-gray-200"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          highlight ? "bg-indigo-500" : iconBg
        )}
      >
        <Icon className={cn("w-5 h-5", highlight ? "text-white" : iconColor)} />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "text-xs font-medium truncate",
            highlight ? "text-indigo-200" : "text-gray-500"
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "text-xl font-bold mt-0.5 truncate",
            highlight ? "text-white" : "text-gray-900"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
