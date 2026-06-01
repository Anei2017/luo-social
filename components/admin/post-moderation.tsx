"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Trash2 } from "lucide-react";
import { formatConvexError } from "@/lib/convex-errors";
import { Skeleton } from "@/components/ui/skeleton";

export function PostModeration() {
  const [reportedOnly, setReportedOnly] = useState(false);
  const posts = useQuery(api.admin.listPosts, { reportedOnly });
  const deletePost = useMutation(api.admin.deletePost);

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={reportedOnly}
          onChange={(e) => setReportedOnly(e.target.checked)}
          className="rounded border-border accent-primary"
        />
        Show reported posts only
      </label>

      {posts === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts to show.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) =>
            post ? (
              <li
                key={post._id}
                className="card-surface rounded-xl border border-border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      @{post.author?.username ?? "unknown"} ·{" "}
                      {new Date(post.createdAt).toLocaleString()}
                      {post.reported && (
                        <span className="ml-2 text-primary">Reported</span>
                      )}
                    </p>
                    <p className="mt-2 line-clamp-4 text-sm text-foreground">
                      {post.content}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const reason = prompt("Delete reason (optional)?") ?? "";
                      if (!confirm("Delete this post?")) return;
                      try {
                        await deletePost({
                          postId: post._id as Id<"posts">,
                          reason,
                        });
                      } catch (e) {
                        alert(formatConvexError(e));
                      }
                    }}
                    className="shrink-0 rounded-lg border border-destructive/40 p-2 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ) : null,
          )}
        </ul>
      )}
    </div>
  );
}
