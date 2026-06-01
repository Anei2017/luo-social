"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/luo/app-shell";
import { ChatThread } from "@/components/luo/chat-thread";
import { EnsureProfile } from "@/components/luo/ensure-profile";
import { avatarUrl } from "@/lib/avatar";
import { Icon } from "@/components/luo/icon";

function MessagesInbox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const withUsername = searchParams.get("with");

  const conversations = useQuery(api.messages.listConversations);
  const targetUser = useQuery(
    api.users.getByUsername,
    withUsername ? { username: withUsername } : "skip",
  );
  const getOrCreate = useMutation(api.messages.getOrCreate);

  const [activeId, setActiveId] = useState<Id<"conversations"> | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!withUsername || !targetUser || starting) return;
    let cancelled = false;
    (async () => {
      setStarting(true);
      try {
        const id = await getOrCreate({
          otherUserId: targetUser._id as Id<"users">,
        });
        if (!cancelled) {
          setActiveId(id);
          router.replace("/messages");
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [withUsername, targetUser, getOrCreate, router, starting]);

  const active = conversations?.find((c) => c._id === activeId);

  return (
    <div className="mx-auto flex w-full max-w-5xl gap-4">
      <aside
        className={`card-dark w-full shrink-0 overflow-hidden md:w-80 ${
          activeId ? "hidden md:block" : "block"
        }`}
      >
        <div className="border-b border-outline-soft px-4 py-4">
          <h1 className="text-lg font-bold text-on-surface">Messages</h1>
          <p className="text-xs text-on-surface-muted">Chat with people you follow</p>
        </div>
        <ul className="max-h-[min(70vh,640px)] overflow-y-auto">
          {conversations === undefined && (
            <li className="p-4 text-sm text-on-surface-muted">Loading…</li>
          )}
          {conversations?.length === 0 && (
            <li className="p-6 text-center text-sm text-on-surface-muted">
              No conversations yet. Message someone from their profile or a post.
            </li>
          )}
          {conversations?.map((c) => (
            <li key={c._id}>
              <button
                type="button"
                onClick={() => setActiveId(c._id as Id<"conversations">)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-elevated ${
                  activeId === c._id ? "bg-surface-elevated" : ""
                }`}
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={avatarUrl(c.other)}
                    alt=""
                    fill
                    unoptimized
                    sizes="44px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {c.other?.displayName ?? "Member"}
                  </p>
                  <p className="truncate text-xs text-on-surface-dim">
                    {c.lastMessagePreview ?? "Start chatting"}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
        <Link
          href="/discover"
          className="flex items-center justify-center gap-2 border-t border-outline-soft py-4 text-sm font-medium text-primary"
        >
          <Icon name="person_add" />
          Find people to message
        </Link>
      </aside>

      <div className={`min-w-0 flex-1 ${activeId ? "block" : "hidden md:block"}`}>
        {active && active.other ? (
          <ChatThread
            conversationId={activeId!}
            otherName={active.other.displayName}
            otherUsername={active.other.username}
            otherAvatar={active.other.avatarUrl}
          />
        ) : (
          <div className="card-dark flex h-[min(70vh,640px)] flex-col items-center justify-center p-8 text-center">
            <Icon name="chat" className="mb-4 text-5xl text-on-surface-dim" />
            <p className="text-lg font-bold text-on-surface">Your messages</p>
            <p className="mt-2 max-w-sm text-sm text-on-surface-muted">
              Select a conversation or visit a profile and tap Message to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <AppShell>
      <EnsureProfile>
        <Suspense
          fallback={
            <p className="py-12 text-center text-on-surface-muted">Loading messages…</p>
          }
        >
          <MessagesInbox />
        </Suspense>
      </EnsureProfile>
    </AppShell>
  );
}
