"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatConvexError } from "@/lib/convex-errors";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const FEATURE_KEYS = [
  { key: "marketplace" as const, label: "Marketplace" },
  { key: "jobs" as const, label: "Job board" },
  { key: "events" as const, label: "Events" },
  { key: "groups" as const, label: "Luo groups" },
  { key: "reels" as const, label: "Reels" },
  { key: "voiceRooms" as const, label: "Voice rooms" },
];

const fieldClass =
  "w-full rounded-lg border border-border bg-surface-input px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function AppSettingsForm() {
  const settings = useQuery(api.admin.getSettings);
  const update = useMutation(api.admin.updateSettings);
  const [rules, setRules] = useState("");
  const [banner, setBanner] = useState("");
  const [features, setFeatures] = useState({
    marketplace: true,
    jobs: true,
    events: true,
    groups: true,
    reels: true,
    voiceRooms: false,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setRules(settings.communityRules);
      setBanner(settings.announcementBanner ?? "");
      setFeatures(settings.features);
    }
  }, [settings]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await update({
        communityRules: rules,
        announcementBanner: banner.trim() || undefined,
        features,
      });
      setMsg("Settings saved.");
    } catch (err) {
      setMsg(formatConvexError(err));
    } finally {
      setSaving(false);
    }
  }

  if (settings === undefined) {
    return <Skeleton className="h-96 rounded-xl" />;
  }

  return (
    <form onSubmit={onSave} className="max-w-2xl space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Community rules
        </label>
        <textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          rows={6}
          className={fieldClass}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Announcement banner (optional)
        </label>
        <input
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
          placeholder="e.g. Welcome to LUO SOCIAL — share your culture!"
          className={fieldClass}
        />
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          Feature toggles
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {FEATURE_KEYS.map((f) => (
            <label
              key={f.key}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
            >
              <input
                type="checkbox"
                checked={features[f.key]}
                onChange={(e) =>
                  setFeatures((prev) => ({
                    ...prev,
                    [f.key]: e.target.checked,
                  }))
                }
                className="accent-primary"
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={saving} variant="luo">
        {saving ? "Saving…" : "Save settings"}
      </Button>
      {msg && (
        <p
          className={`text-sm ${msg.includes("saved") ? "text-accent-green" : "text-destructive"}`}
        >
          {msg}
        </p>
      )}
    </form>
  );
}
