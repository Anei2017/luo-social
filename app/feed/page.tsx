import { Suspense } from "react";
import { AppShell } from "@/components/luo/app-shell";
import { FeedsSection } from "@/components/luo/feeds-section";

/** Same feeds UI as /feeds (keeps /feed#compose links working) */
export default function FeedPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <p className="py-12 text-center text-on-surface-muted">Loading feeds…</p>
        }
      >
        <FeedsSection />
      </Suspense>
    </AppShell>
  );
}
