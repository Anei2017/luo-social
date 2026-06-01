"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/luo/app-shell";
import { CommunityPageHeader } from "@/components/luo/community-page-header";
import { formatConvexError } from "@/lib/convex-errors";

function formatWhen(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function EventsPage() {
  const events = useQuery(api.events.list, {});
  const create = useMutation(api.events.create);
  const rsvp = useMutation(api.events.rsvp);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startsAt || saving) return;
    setSaving(true);
    try {
      await create({
        title,
        description,
        location: location || undefined,
        startsAt: new Date(startsAt).getTime(),
      });
      setTitle("");
      setDescription("");
      setLocation("");
      setStartsAt("");
      setShowForm(false);
    } catch (err) {
      alert(formatConvexError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleRsvp(eventId: Id<"events">, status: "going" | "interested") {
    try {
      await rsvp({ eventId, status });
    } catch (err) {
      alert(formatConvexError(err));
    }
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <CommunityPageHeader
          title="Events"
          description="Weddings, funerals, nyatiti nights, meetups — discover and RSVP."
        />
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="card-dark w-full py-3 text-sm font-bold text-primary"
        >
          {showForm ? "Cancel" : "+ Create event"}
        </button>
        {showForm && (
          <form onSubmit={handleCreate} className="card-dark space-y-3 p-4 sm:p-5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2.5 text-sm"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={3}
              className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2.5 text-sm"
              required
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2.5 text-sm"
            />
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2.5 text-sm"
              required
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-primary py-2.5 text-sm font-bold text-on-primary"
            >
              {saving ? "Saving…" : "Publish event"}
            </button>
          </form>
        )}
        {events === undefined && (
          <p className="text-center text-sm text-on-surface-muted">Loading…</p>
        )}
        {events?.length === 0 && (
          <div className="card-dark p-8 text-center text-sm text-on-surface-muted">
            No upcoming events. Create one for your community.
          </div>
        )}
        <ul className="space-y-3">
          {events?.map((ev) => (
            <li key={ev._id} className="card-dark p-4 sm:p-5">
              <h2 className="text-lg font-bold text-on-surface">{ev.title}</h2>
              <p className="text-xs text-primary">{formatWhen(ev.startsAt)}</p>
              {ev.location && (
                <p className="mt-1 text-xs text-on-surface-dim">{ev.location}</p>
              )}
              <p className="mt-2 text-sm text-on-surface-muted">{ev.description}</p>
              <p className="mt-2 text-xs text-on-surface-dim">
                {ev.goingCount} going · {ev.interestedCount} interested
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleRsvp(ev._id as Id<"events">, "going")}
                  className={`rounded-full px-4 py-2 text-xs font-bold ${
                    ev.myRsvp === "going"
                      ? "bg-primary text-on-primary"
                      : "border border-outline text-on-surface-muted"
                  }`}
                >
                  Going
                </button>
                <button
                  type="button"
                  onClick={() => handleRsvp(ev._id as Id<"events">, "interested")}
                  className={`rounded-full px-4 py-2 text-xs font-bold ${
                    ev.myRsvp === "interested"
                      ? "bg-primary text-on-primary"
                      : "border border-outline text-on-surface-muted"
                  }`}
                >
                  Interested
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
