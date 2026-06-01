"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/luo/app-shell";
import { ProfileView } from "@/components/luo/profile-view";
import type { ConvexUser } from "@/lib/types";

function OwnProfile() {
  const profile = useQuery(api.users.current);
  const router = useRouter();

  useEffect(() => {
    if (profile?.username) {
      router.replace(`/profile/${profile.username}`);
    }
  }, [profile?.username, router]);

  if (!profile) {
    return (
      <p className="py-12 text-center text-on-surface-muted">Loading profile…</p>
    );
  }

  return (
    <ProfileView user={profile as ConvexUser} isOwnProfile />
  );
}

export default function ProfilePage() {
  return (
    <AppShell>
      <OwnProfile />
    </AppShell>
  );
}
