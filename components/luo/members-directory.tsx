"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { avatarUrl } from "@/lib/avatar";
import { formatConvexError } from "@/lib/convex-errors";
import { FriendActionButton } from "./friend-action-button";
import { Icon } from "./icon";

export function MembersDirectory({
  onConversationStarted,
}: {
  onConversationStarted: (conversationId: Id<"conversations">) => void;
}) {
  const [search, setSearch] = useState("");
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const members = useQuery(api.users.listMembers, {
    search: search.trim() || undefined,
    limit: 80,
  });
  const getOrCreate = useMutation(api.messages.getOrCreate);

  async function startChat(otherUserId: Id<"users">) {
    setStartingId(otherUserId);
    setError(null);
    try {
      const id = await getOrCreate({ otherUserId });
      onConversationStarted(id);
    } catch (err) {
      setError(formatConvexError(err));
    } finally {
      setStartingId(null);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-outline-soft px-4 py-3">
        <p className="text-xs text-on-surface-muted">
          Message any member — no follow required
        </p>
        <div className="relative mt-2">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-dim"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members…"
            className="w-full rounded-full border border-outline bg-surface-elevated py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>
      <ul className="max-h-[min(70vh,640px)] overflow-y-auto">
        {members === undefined && (
          <li className="p-4 text-sm text-on-surface-muted">Loading members…</li>
        )}
        {members?.length === 0 && (
          <li className="p-6 text-center text-sm text-on-surface-muted">
            {search.trim()
              ? "No members match your search."
              : "No other members yet. Invite friends to sign up."}
          </li>
        )}
        {members?.map((member) => (
          <li
            key={member._id}
            className="flex items-center gap-3 border-b border-outline-soft/40 px-4 py-3 last:border-0"
          >
            <Link
              href={`/profile/${member.username}`}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={avatarUrl(member)}
                  alt=""
                  fill
                  unoptimized
                  sizes="44px"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-on-surface">
                  {member.displayName}
                </p>
                <p className="truncate text-xs text-on-surface-dim">
                  @{member.username}
                </p>
              </div>
            </Link>
            <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
              <FriendActionButton
                otherUserId={member._id as Id<"users">}
                compact
              />
              <button
                type="button"
                disabled={startingId === member._id}
                onClick={() => startChat(member._id as Id<"users">)}
                className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary disabled:opacity-50"
              >
                {startingId === member._id ? "…" : "Chat"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error && (
        <p className="border-t border-outline-soft px-4 py-2 text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
