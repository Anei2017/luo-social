"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/luo/app-shell";
import { CommunityPageHeader } from "@/components/luo/community-page-header";
import { formatConvexError } from "@/lib/convex-errors";

export default function JobsPage() {
  const jobs = useQuery(api.jobs.list, {});
  const create = useMutation(api.jobs.create);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await create({
        title,
        company: company || undefined,
        location: location || undefined,
        description,
        applyUrl: applyUrl || undefined,
      });
      setTitle("");
      setCompany("");
      setLocation("");
      setDescription("");
      setApplyUrl("");
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
          title="Job Board"
          description="Jobs and opportunities shared by the Luo community."
        />
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="card-dark w-full py-3 text-sm font-bold text-primary"
        >
          {showForm ? "Cancel" : "+ Post a job"}
        </button>
        {showForm && (
          <form onSubmit={handleCreate} className="card-dark space-y-3 p-4 sm:p-5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Job title"
              className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2.5 text-sm"
              required
            />
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2.5 text-sm"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2.5 text-sm"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={4}
              className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2.5 text-sm"
              required
            />
            <input
              value={applyUrl}
              onChange={(e) => setApplyUrl(e.target.value)}
              placeholder="Apply link (optional)"
              className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-primary py-2.5 text-sm font-bold text-on-primary"
            >
              {saving ? "Posting…" : "Publish job"}
            </button>
          </form>
        )}
        <ul className="space-y-3">
          {jobs?.map((job) => (
            <li key={job._id} className="card-dark p-4 sm:p-5">
              <h2 className="font-bold text-on-surface">{job.title}</h2>
              {(job.company || job.location) && (
                <p className="text-xs text-on-surface-dim">
                  {[job.company, job.location].filter(Boolean).join(" · ")}
                </p>
              )}
              <p className="mt-2 text-sm text-on-surface-muted">{job.description}</p>
              {job.applyUrl && (
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-bold text-primary"
                >
                  Apply →
                </a>
              )}
            </li>
          ))}
        </ul>
        {jobs?.length === 0 && (
          <p className="text-center text-sm text-on-surface-muted">No jobs posted yet.</p>
        )}
      </div>
    </AppShell>
  );
}
