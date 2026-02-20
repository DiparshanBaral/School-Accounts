/**
 * components/charts/CategoryPieChart.tsx
 * Donut-style pie chart for category breakdown.
 * Uses Recharts — client component.
 */

"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { CategoryBreakdown } from "@/lib/queries/dashboard";

// Color palette for pie slices — extend as needed
const COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

interface CategoryPieChartProps {
  data: CategoryBreakdown[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No data this month
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.name,
    value: item.amount,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | string | undefined) => {
            if (value === undefined) return "";
            return new Intl.NumberFormat("en-NP", {
              style: "currency",
              currency: "NPR",
              minimumFractionDigits: 0,
            }).format(Number(value));
          }}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "12px",
          }}
        />
        <Legend
          layout="vertical"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
