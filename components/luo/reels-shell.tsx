import Link from "next/link";
import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";
import { ConvexAuthGate } from "./convex-auth-gate";
import { EnsureProfile } from "./ensure-profile";
import { FEEDS_PATH } from "@/lib/feeds-path";
import { Icon } from "./icon";

/** Full-width layout for vertical video reels */
export function ReelsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen-safe bg-black text-on-surface">
      <TopNav />
      <div className="mx-auto max-w-lg px-0 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:max-w-2xl md:pb-24 lg:max-w-3xl">
        <ConvexAuthGate>
          <EnsureProfile>{children}</EnsureProfile>
        </ConvexAuthGate>
      </div>
      <MobileNav />
    </div>
  );
}

export function ReelsPageHeader({
  onCreateClick,
}: {
  onCreateClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-0">
      <div>
        <h1 className="text-xl font-bold text-on-surface">Reels</h1>
        <p className="text-xs text-on-surface-muted">Short videos from the community</p>
      </div>
      <div className="flex gap-2">
        <Link
          href={FEEDS_PATH}
          className="flex min-h-10 items-center gap-1 rounded-full border border-outline px-3 text-xs font-semibold text-on-surface-muted"
        >
          <Icon name="dynamic_feed" className="text-base" />
          Feeds
        </Link>
        <button
          type="button"
          onClick={onCreateClick}
          className="flex min-h-10 items-center gap-1 rounded-full bg-primary px-4 text-xs font-bold text-on-primary"
        >
          <Icon name="videocam" className="text-base" />
          Create
        </button>
      </div>
    </div>
  );
}
