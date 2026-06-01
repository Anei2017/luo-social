"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { useQuery } from "convex/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsCharts() {
  const data = useQuery(api.admin.analytics, { days: 14 });
  const { resolvedTheme } = useTheme();

  const chartTheme = useMemo(() => {
    const light = resolvedTheme === "light";
    return {
      grid: light ? "#e8dfd4" : "#27272a",
      tick: light ? "#78716c" : "#71717a",
      tooltipBg: light ? "#ffffff" : "#18181b",
      tooltipBorder: light ? "#e8dfd4" : "#3f3f46",
      line: "#f97316",
      bar: light ? "#15803d" : "#22c55e",
    };
  }, [resolvedTheme]);

  if (data === undefined) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const tooltipStyle = {
    background: chartTheme.tooltipBg,
    border: `1px solid ${chartTheme.tooltipBorder}`,
    borderRadius: 8,
    color: chartTheme.tick,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="New users per day">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.userGrowth}>
            <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: chartTheme.tick, fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: chartTheme.tick, fontSize: 10 }}
              allowDecimals={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="count"
              stroke={chartTheme.line}
              strokeWidth={2}
              dot={{ fill: chartTheme.line }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Posts per day">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.postsPerDay}>
            <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: chartTheme.tick, fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: chartTheme.tick, fontSize: 10 }}
              allowDecimals={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar
              dataKey="count"
              fill={chartTheme.bar}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-surface rounded-xl border border-border p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}
