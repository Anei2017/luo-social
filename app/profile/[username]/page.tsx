"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/luo/app-shell";
import { ProfileView } from "@/components/luo/profile-view";
import type { ConvexUser } from "@/lib/types";

function ProfileByUsername() {
  const params = useParams();
  const username = typeof params.username === "string" ? params.username : "";
  const me = useQuery(api.users.current);
  const user = useQuery(api.users.getByUsername, { username });

  if (user === undefined) {
    return (
      <p className="py-12 text-center text-on-surface-muted">Loading profile…</p>
    );
  }

  if (user === null) {
    return (
      <div className="card-dark mx-auto max-w-md p-12 text-center">
        <p className="text-lg font-bold text-on-surface">User not found</p>
        <p className="mt-2 text-sm text-on-surface-muted">@{username} does not exist.</p>
      </div>
    );
  }

  return (
    <ProfileView
      user={user as ConvexUser}
      isOwnProfile={me?._id === user._id}
    />
  );
}

export default function UserProfilePage() {
  return (
    <AppShell>
      <ProfileByUsername />
    </AppShell>
  );
}
