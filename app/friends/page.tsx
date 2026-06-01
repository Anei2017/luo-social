"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/luo/app-shell";
import { FriendCard } from "@/components/luo/friend-card";
import { formatConvexError } from "@/lib/convex-errors";

type Tab = "friends" | "requests";

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>("friends");
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const myFriends = useQuery(api.friends.listMyFriends, { limit: 80 });
  const incoming = useQuery(api.friends.listPendingIncoming);
  const outgoing = useQuery(api.friends.listPendingOutgoing);

  const acceptRequest = useMutation(api.friends.acceptRequest);
  const declineRequest = useMutation(api.friends.declineRequest);
  const cancelRequest = useMutation(api.friends.cancelRequest);
  const removeFriend = useMutation(api.friends.removeFriend);

  const requestCount = (incoming?.length ?? 0) + (outgoing?.length ?? 0);

  async function runAction(
    id: string,
    action: () => Promise<unknown>,
  ) {
    setLoadingId(id);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(formatConvexError(err));
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <div className="card-dark p-4 sm:p-6">
          <h1 className="text-xl font-bold text-on-surface sm:text-2xl">Friends</h1>
          <p className="mt-1 text-sm text-on-surface-muted">
            Add friends to connect — your friends list is visible on your profile
            and theirs on theirs.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setTab("friends")}
              className={`min-h-11 flex-1 rounded-full py-2.5 text-sm font-bold ${
                tab === "friends"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-elevated text-on-surface-muted"
              }`}
            >
              My friends
              {myFriends && myFriends.length > 0 && (
                <span className="ml-1 opacity-80">({myFriends.length})</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setTab("requests")}
              className={`min-h-11 flex-1 rounded-full py-2.5 text-sm font-bold ${
                tab === "requests"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-elevated text-on-surface-muted"
              }`}
            >
              Requests
              {requestCount > 0 && (
                <span className="ml-1 opacity-80">({requestCount})</span>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="card-dark p-4 text-sm text-error" role="alert">
            {error}
          </p>
        )}

        {tab === "friends" && (
          <div className="card-dark p-4 sm:p-6">
            {myFriends === undefined && (
              <p className="text-sm text-on-surface-muted">Loading…</p>
            )}
            {myFriends?.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-on-surface-muted">
                  You have no friends yet. Visit profiles and tap{" "}
                  <strong className="text-on-surface">Add friend</strong>, or accept
                  requests in the Requests tab.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Link
                    href="/feeds"
                    className="inline-block rounded-full border border-outline px-5 py-2.5 text-sm font-semibold text-on-surface"
                  >
                    Go to feeds
                  </Link>
                  <Link
                    href="/discover"
                    className="inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary"
                  >
                    Discover people
                  </Link>
                </div>
              </div>
            )}
            <ul className="space-y-2">
              {myFriends?.map((entry) => (
                  <FriendCard
                    key={entry.friendshipId}
                    user={entry.user}
                    actions={
                      <>
                        <Link
                          href={`/messages?with=${entry.user.username}`}
                          className="rounded-full border border-primary/50 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                        >
                          Message
                        </Link>
                        <button
                          type="button"
                          disabled={loadingId === entry.friendshipId}
                          onClick={() =>
                            runAction(entry.friendshipId, () =>
                              removeFriend({
                                otherUserId: entry.user._id as Id<"users">,
                              }),
                            )
                          }
                          className="rounded-full border border-outline px-3 py-1.5 text-xs font-medium text-on-surface-dim hover:text-error"
                        >
                          Remove
                        </button>
                      </>
                    }
                  />
              ))}
            </ul>
          </div>
        )}

        {tab === "requests" && (
          <div className="space-y-4">
            <div className="card-dark p-4 sm:p-6">
              <h2 className="mb-3 text-sm font-bold text-on-surface">
                Incoming requests
              </h2>
              {incoming === undefined && (
                <p className="text-sm text-on-surface-muted">Loading…</p>
              )}
              {incoming?.length === 0 && (
                <p className="text-sm text-on-surface-muted">No pending requests.</p>
              )}
              <ul className="space-y-2">
                {incoming?.map((row) => (
                  <FriendCard
                    key={row.friendshipId}
                    user={row.user}
                    actions={
                      <>
                        <button
                          type="button"
                          disabled={loadingId === row.friendshipId}
                          onClick={() =>
                            runAction(row.friendshipId, () =>
                              acceptRequest({ friendshipId: row.friendshipId }),
                            )
                          }
                          className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-on-primary"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={loadingId === row.friendshipId}
                          onClick={() =>
                            runAction(row.friendshipId, () =>
                              declineRequest({ friendshipId: row.friendshipId }),
                            )
                          }
                          className="rounded-full border border-outline px-3 py-1.5 text-xs font-medium text-on-surface-muted"
                        >
                          Decline
                        </button>
                      </>
                    }
                  />
                ))}
              </ul>
            </div>

            <div className="card-dark p-4 sm:p-6">
              <h2 className="mb-3 text-sm font-bold text-on-surface">Sent requests</h2>
              {outgoing === undefined && (
                <p className="text-sm text-on-surface-muted">Loading…</p>
              )}
              {outgoing?.length === 0 && (
                <p className="text-sm text-on-surface-muted">No outgoing requests.</p>
              )}
              <ul className="space-y-2">
                {outgoing?.map((row) => (
                  <FriendCard
                    key={row.friendshipId}
                    user={row.user}
                    actions={
                      <button
                        type="button"
                        disabled={loadingId === row.friendshipId}
                        onClick={() =>
                          runAction(row.friendshipId, () =>
                            cancelRequest({ friendshipId: row.friendshipId }),
                          )
                        }
                        className="rounded-full border border-outline px-3 py-1.5 text-xs font-medium text-on-surface-muted"
                      >
                        Cancel
                      </button>
                    }
                  />
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
