import { TopNav } from "./top-nav";
import { LeftPanel } from "./left-panel";
import { ActivityPanelSafe } from "./activity-panel-safe";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNav />
      <div className="mx-auto flex max-w-[1600px] gap-5 px-4 py-5 pb-24 lg:px-6 xl:gap-6">
        <LeftPanel />
        <div className="min-w-0 flex-1 max-w-2xl xl:max-w-none">{children}</div>
        <ActivityPanelSafe />
      </div>
      <MobileNav />
    </div>
  );
}
