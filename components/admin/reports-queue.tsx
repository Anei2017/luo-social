"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CheckCircle } from "lucide-react";
import { formatConvexError } from "@/lib/convex-errors";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function ReportsQueue() {
  const pending = useQuery(api.admin.listReports, { status: "pending" });
  const reviewReport = useMutation(api.admin.reviewReport);
  const deletePost = useMutation(api.admin.deletePost);
  const banUser = useMutation(api.admin.banUser);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Pending reports</h2>
      {pending === undefined ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No pending reports — great job!
        </p>
      ) : (
        <ul className="space-y-3">
          {pending.map((r) => (
            <li
              key={r._id}
              className="rounded-xl border border-primary/25 bg-card p-4 shadow-sm"
            >
              <p className="text-sm text-foreground">{r.reason}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                By @{r.reporter?.username} ·{" "}
                {new Date(r.createdAt).toLocaleString()}
              </p>
              {r.post && (
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  Post: {r.post.content}
                </p>
              )}
              {r.targetUser && (
                <p className="mt-1 text-xs text-muted-foreground">
                  User: @{r.targetUser.username}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {r.postId && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/50 text-destructive"
                    onClick={async () => {
                      if (!confirm("Delete reported post?")) return;
                      try {
                        await deletePost({ postId: r.postId! });
                        await reviewReport({ reportId: r._id });
                      } catch (e) {
                        alert(formatConvexError(e));
                      }
                    }}
                  >
                    Delete post
                  </Button>
                )}
                {r.targetUserId && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/50 text-destructive"
                    onClick={async () => {
                      const reason = prompt("Ban reason?") ?? "Reported";
                      try {
                        await banUser({
                          userId: r.targetUserId!,
                          reason,
                          banned: true,
                        });
                        await reviewReport({ reportId: r._id });
                      } catch (e) {
                        alert(formatConvexError(e));
                      }
                    }}
                  >
                    Ban user
                  </Button>
                )}
                <Button
                  size="sm"
                  className="gap-1 bg-accent-green text-white hover:opacity-90"
                  onClick={async () => {
                    try {
                      await reviewReport({
                        reportId: r._id as Id<"reports">,
                        adminNote: "Reviewed",
                      });
                    } catch (e) {
                      alert(formatConvexError(e));
                    }
                  }}
                >
                  <CheckCircle className="size-4" />
                  Mark reviewed
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
