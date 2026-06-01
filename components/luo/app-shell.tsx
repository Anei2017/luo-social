import { TopNav } from "./top-nav";
import { LeftPanel } from "./left-panel";
import { ActivityPanelSafe } from "./activity-panel-safe";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen-safe bg-background text-on-surface">
      <TopNav />
      <div className="mx-auto flex max-w-[1600px] gap-4 px-3 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:gap-5 sm:px-4 sm:py-5 md:pb-24 lg:px-6 xl:gap-6">
        <LeftPanel />
        <div className="min-w-0 flex-1 max-w-2xl xl:max-w-none">{children}</div>
        <ActivityPanelSafe />
      </div>
      <MobileNav />
    </div>
  );
}
