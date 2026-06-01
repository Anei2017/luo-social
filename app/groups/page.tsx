"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/luo/app-shell";
import { CommunityPageHeader } from "@/components/luo/community-page-header";
import { formatConvexError } from "@/lib/convex-errors";

export default function GroupsPage() {
  const groups = useQuery(api.groups.list);
  const seedDefaults = useMutation(api.groups.seedDefaults);
  const join = useMutation(api.groups.join);
  const leave = useMutation(api.groups.leave);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current || groups === undefined) return;
    if (groups.length > 0) return;
    seeded.current = true;
    void seedDefaults({}).catch(() => {
      seeded.current = false;
    });
  }, [groups, seedDefaults]);

  async function toggleJoin(groupId: Id<"groups">, isMember: boolean) {
    try {
      if (isMember) await leave({ groupId });
      else await join({ groupId });
    } catch (err) {
      alert(formatConvexError(err));
    }
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <CommunityPageHeader
          title="Luo Groups"
          description="Location and interest groups — join to see group posts and connect."
        />
        {groups === undefined && (
          <p className="text-center text-sm text-on-surface-muted">Loading groups…</p>
        )}
        <ul className="space-y-3">
          {groups?.map((g) => (
            <li key={g._id} className="card-dark p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link
                    href={`/groups/${g.slug}`}
                    className="text-lg font-bold text-on-surface hover:text-primary"
                  >
                    {g.name}
                  </Link>
                  {g.location && (
                    <p className="text-xs text-on-surface-dim">{g.location}</p>
                  )}
                  <p className="mt-2 text-sm text-on-surface-muted">{g.description}</p>
                  <p className="mt-2 text-xs text-on-surface-dim">
                    {g.memberCount} member{g.memberCount === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleJoin(g._id as Id<"groups">, g.isMember)}
                  className={`min-h-11 shrink-0 rounded-full px-5 py-2.5 text-sm font-bold ${
                    g.isMember
                      ? "border border-outline text-on-surface-muted"
                      : "bg-primary text-on-primary"
                  }`}
                >
                  {g.isMember ? "Joined" : "Join"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
