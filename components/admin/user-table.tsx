"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Search, Ban, Shield, Trash2, Eye } from "lucide-react";
import { avatarUrl } from "@/lib/avatar";
import { formatConvexError } from "@/lib/convex-errors";
import { Skeleton } from "@/components/ui/skeleton";
export function UserTable() {
  const [search, setSearch] = useState("");
  const users = useQuery(api.admin.listUsers, { search: search || undefined });
  const banUser = useMutation(api.admin.banUser);
  const suspendUser = useMutation(api.admin.suspendUser);
  const setRole = useMutation(api.admin.setUserRole);
  const deleteUser = useMutation(api.admin.deleteUserAccount);

  async function handleBan(userId: Id<"users">, currentlyBanned: boolean) {
    const reason = currentlyBanned
      ? "Unbanned by admin"
      : prompt("Ban reason?") ?? "";
    if (!currentlyBanned && !reason.trim()) return;
    try {
      await banUser({ userId, reason, banned: !currentlyBanned });
    } catch (e) {
      alert(formatConvexError(e));
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, clan…"
          className="w-full rounded-lg border border-border bg-surface-input py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {users === undefined ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/80 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Clan</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-border/80 hover:bg-muted/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 overflow-hidden rounded-full">
                        <Image
                          src={avatarUrl(u)}
                          alt=""
                          fill
                          unoptimized
                          sizes="40px"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {u.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{u.username}
                          {u.email ? ` · ${u.email}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.clan ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.role === "super_admin"
                          ? "bg-primary/20 text-primary"
                          : u.role === "moderator"
                            ? "bg-sky-500/20 text-sky-700 dark:text-sky-300"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {u.role}
                    </span>
                    {u.banned && (
                      <span className="ml-1 text-xs text-red-400">banned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Link
                        href={`/profile/${u.username}`}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                      >
                        <Eye className="size-3" /> View
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          handleBan(u._id as Id<"users">, u.banned)
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-red-900/50 px-2 py-1 text-xs text-red-400 hover:bg-red-950/50"
                      >
                        <Ban className="size-3" />
                        {u.banned ? "Unban" : "Ban"}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const days = prompt("Suspend for how many days?", "7");
                          if (!days) return;
                          const until =
                            Date.now() + Number(days) * 86400000;
                          try {
                            await suspendUser({
                              userId: u._id as Id<"users">,
                              suspendedUntil: until,
                            });
                          } catch (e) {
                            alert(formatConvexError(e));
                          }
                        }}
                        className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                      >
                        Suspend
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const next =
                            u.role === "moderator" ? "member" : "moderator";
                          try {
                            await setRole({
                              userId: u._id as Id<"users">,
                              role: next,
                            });
                          } catch (e) {
                            alert(formatConvexError(e));
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                      >
                        <Shield className="size-3" />
                        {u.role === "moderator" ? "Demote" : "Mod"}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm("Permanently delete this user?")) return;
                          try {
                            await deleteUser({
                              userId: u._id as Id<"users">,
                            });
                          } catch (e) {
                            alert(formatConvexError(e));
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-red-900 px-2 py-1 text-xs text-red-500 hover:bg-red-950"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
