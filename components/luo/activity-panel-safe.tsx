"use client";

import { QueryBoundary } from "./query-boundary";
import { ActivityPanel } from "./activity-panel";

function ActivityFallback() {
  return (
    <aside className="hidden w-[300px] shrink-0 xl:block">
      <div className="card-dark p-5">
        <h3 className="font-body text-sm font-bold text-on-surface">Recent Activity</h3>
        <p className="mt-3 text-sm text-on-surface-muted">
          Activity will appear after your database syncs. Run{" "}
          <code className="text-primary">npx convex dev</code> if you just added features.
        </p>
        <a href="/notifications" className="mt-4 block text-xs font-medium text-primary">
          Notifications →
        </a>
      </div>
    </aside>
  );
}

export function ActivityPanelSafe() {
  return (
    <QueryBoundary fallback={<ActivityFallback />}>
      <ActivityPanel />
    </QueryBoundary>
  );
}
