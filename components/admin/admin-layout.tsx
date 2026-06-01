"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Flag,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ADMIN_APP_TITLE, ADMIN_NAV, ADMIN_OWNER_NAME } from "@/lib/admin/constants";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/lib/admin/require-super-admin";

const ICONS = {
  LayoutDashboard,
  Users,
  FileText,
  Flag,
  BarChart3,
  Settings,
} as const;

export function AdminLayout({
  adminUser,
  children,
}: {
  adminUser: AdminUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen-safe bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-card lg:flex">
        <div className="flex items-center gap-2 border-b border-border px-5 py-5">
          <Shield className="size-6 text-primary" />
          <div>
            <p className="text-sm font-bold text-primary">{ADMIN_APP_TITLE}</p>
            <p className="text-[10px] text-muted-foreground">Super admin</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {ADMIN_NAV.map((item) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS];
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-3 border-t border-border p-4">
          <ThemeToggle variant="menu" className="w-full justify-start" />
          <Link
            href="/feeds"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            ← Back to app
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Shield className="size-5 text-primary" />
            <span className="text-sm font-bold">{ADMIN_APP_TITLE}</span>
          </div>
          <p className="hidden text-sm text-muted-foreground lg:block">
            Signed in as{" "}
            <span className="font-semibold text-foreground">{ADMIN_OWNER_NAME}</span>
            <span className="text-muted-foreground/70"> · @{adminUser.username}</span>
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle className="lg:hidden" />
            <UserButton
              appearance={{
                elements: { avatarBox: "h-8 w-8" },
              }}
            />
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card px-2 py-2 lg:hidden hide-scrollbar">
          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                  active ? "bg-primary/20 text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
