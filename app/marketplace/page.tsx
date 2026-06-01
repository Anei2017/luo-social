"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/luo/app-shell";
import { CommunityPageHeader } from "@/components/luo/community-page-header";
import { formatConvexError } from "@/lib/convex-errors";

export default function MarketplacePage() {
  const listings = useQuery(api.marketplace.list, {});
  const create = useMutation(api.marketplace.create);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await create({ title, description, priceLabel: priceLabel || undefined });
      setTitle("");
      setDescription("");
      setPriceLabel("");
      setShowForm(false);
    } catch (err) {
      alert(formatConvexError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <CommunityPageHeader
          title="Luo Marketplace"
          description="Buy and sell Luo-related products — clothes, books, food, music, and more."
        />
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="card-dark w-full py-3 text-sm font-bold text-primary"
        >
          {showForm ? "Cancel" : "+ List an item"}
        </button>
        {showForm && (
          <form onSubmit={handleCreate} className="card-dark space-y-3 p-4 sm:p-5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Item title"
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
              value={priceLabel}
              onChange={(e) => setPriceLabel(e.target.value)}
              placeholder="Price (e.g. $20 or Free)"
              className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-primary py-2.5 text-sm font-bold text-on-primary"
            >
              {saving ? "Posting…" : "List item"}
            </button>
          </form>
        )}
        <ul className="space-y-3">
          {listings?.map((item) => (
            <li key={item._id} className="card-dark p-4 sm:p-5">
              <h2 className="font-bold text-on-surface">{item.title}</h2>
              {item.priceLabel && (
                <p className="text-sm font-semibold text-primary">{item.priceLabel}</p>
              )}
              <p className="mt-2 text-sm text-on-surface-muted">{item.description}</p>
              <p className="mt-2 text-xs text-on-surface-dim">
                {item.author?.displayName ?? "Seller"}
                {item.contactHint ? ` · ${item.contactHint}` : ""}
              </p>
            </li>
          ))}
        </ul>
        {listings?.length === 0 && (
          <p className="text-center text-sm text-on-surface-muted">No listings yet.</p>
        )}
      </div>
    </AppShell>
  );
}
