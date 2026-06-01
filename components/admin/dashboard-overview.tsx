"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, FileText, UserPlus, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardOverview() {
  const stats = useQuery(api.admin.overview);

  if (stats === undefined) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "Total posts",
      value: stats.totalPosts,
      icon: FileText,
      color: "text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "New signups today",
      value: stats.newSignupsToday,
      icon: UserPlus,
      color: "text-primary",
    },
    {
      label: "Pending reports",
      value: stats.pendingReports,
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="card-surface rounded-xl border border-border p-5 transition hover:border-primary/30"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {c.label}
              </p>
              <c.icon className={`size-5 ${c.color}`} />
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums text-foreground">
              {c.value}
            </p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Banned accounts: {stats.bannedUsers} · Active today (approx.):{" "}
        {stats.activeToday}
      </p>
    </div>
  );
}
