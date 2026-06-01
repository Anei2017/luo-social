import { AppShell } from "@/components/luo/app-shell";
import { EnsureProfile } from "@/components/luo/ensure-profile";
import { FeedList } from "@/components/luo/feed-list";

export default function FeedPage() {
  return (
    <AppShell>
      <EnsureProfile>
        <FeedList />
      </EnsureProfile>
    </AppShell>
  );
}
