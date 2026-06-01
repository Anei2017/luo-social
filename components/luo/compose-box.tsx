"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatConvexError } from "@/lib/convex-errors";
import { uploadImageToConvex } from "@/lib/upload-image";
import { SUGGESTED_HASHTAGS } from "@/lib/hashtags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "./icon";

const TOPICS = ["Community", "Culture", "Music", "Business", "Diaspora"];
const LANGUAGES = [
  { id: "both" as const, label: "Both" },
  { id: "english" as const, label: "English" },
  { id: "dholuo" as const, label: "Dholuo" },
];

export function ComposeBox({ onPosted }: { onPosted?: () => void } = {}) {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.users.current);
  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("Community");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [language, setLanguage] = useState<"english" | "dholuo" | "both">("both");
  const [pollMode, setPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const profileReady = profile !== undefined && profile !== null;
  const validPoll =
    pollMode && pollOptions.filter((o) => o.trim()).length >= 2;
  const canSubmit =
    !!convexUrl &&
    isAuthenticated &&
    !authLoading &&
    profileReady &&
    !loading &&
    !uploading &&
    (validPoll || content.trim().length > 0 || !!pendingFile);

  function applyFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please choose a JPG, PNG, or GIF image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setSuccess(false);
  }

  function onPickPhoto() {
    fileRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
    e.target.value = "";
  }

  function clearPhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSuccess(false);

    if (!convexUrl) {
      setError("Convex is not configured. Run npx convex dev.");
      return;
    }
    if (authLoading) return;
    if (!isAuthenticated) {
      setError("Sign in to post.");
      router.push("/sign-in");
      return;
    }
    if (profile === null) {
      setError("Complete your profile before posting.");
      router.push("/onboarding");
      return;
    }
    if (!content.trim() && !pendingFile) {
      setError("Write something or add a photo.");
      return;
    }
    if (loading || uploading) return;

    setLoading(true);
    setError(null);
    try {
      let imageStorageId: Id<"_storage"> | undefined;
      if (pendingFile) {
        setUploading(true);
        imageStorageId = await uploadImageToConvex(pendingFile, () =>
          generateUploadUrl(),
        );
        setUploading(false);
      }
      await createPost({
        content: content.trim(),
        topic,
        imageStorageId,
        language,
        pollOptions: validPoll
          ? pollOptions.map((o) => o.trim()).filter(Boolean)
          : undefined,
      });
      setContent("");
      clearPhoto();
      setShowTopics(false);
      setSuccess(true);
      onPosted?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(formatConvexError(err));
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  function onTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  const busy = loading || uploading;

  if (!convexUrl) {
    return (
      <section className="card-dark border border-primary/30 p-5 text-sm text-on-surface-muted">
        Connect Convex to post: set <code>NEXT_PUBLIC_CONVEX_URL</code> and run{" "}
        <code>npx convex dev</code>.
      </section>
    );
  }

  if (profile === null) {
    return (
      <section className="card-dark border border-primary/30 p-5 text-center">
        <p className="text-sm text-on-surface-muted">Create your profile to post.</p>
        <Link
          href="/onboarding"
          className="mt-3 inline-block rounded-full bg-primary px-5 py-2 text-sm font-bold text-on-primary"
        >
          Finish setup
        </Link>
      </section>
    );
  }

  return (
    <form
      id="compose"
      onSubmit={handleSubmit}
      className={`card-dark p-4 transition-colors sm:p-5 ${dragOver ? "ring-2 ring-primary/50" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <Textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setError(null);
        }}
        onKeyDown={onTextareaKeyDown}
        placeholder="What's on your mind?"
        rows={3}
        disabled={busy}
        className="min-h-0 resize-none border-0 bg-transparent px-0 py-0 text-sm leading-relaxed text-on-surface shadow-none ring-0 placeholder:text-on-surface-dim focus-visible:ring-0 disabled:opacity-50"
      />

      {previewUrl && (
        <div className="relative mt-3 overflow-hidden rounded-xl bg-surface-elevated">
          <div className="relative aspect-[4/3] max-h-64 w-full">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
              sizes="640px"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={clearPhoto}
            className="absolute top-2 right-2 bg-background/90 text-on-surface hover:bg-background"
            aria-label="Remove photo"
          >
            <Icon name="close" className="text-lg" />
          </Button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="mt-4 flex flex-col gap-3 border-t border-outline-soft pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button
            type="button"
            variant="luoGhost"
            onClick={onPickPhoto}
            disabled={busy}
            className="min-h-11 gap-2 bg-surface-elevated px-3 py-2.5 hover:bg-surface-input"
          >
            <Icon name="image" className="text-xl text-accent-green" />
            Photo
          </Button>
          <Button
            type="button"
            variant="luoGhost"
            onClick={() => setShowTopics((v) => !v)}
            disabled={busy}
            className="min-h-11 gap-2 bg-surface-elevated px-3 py-2.5 hover:bg-surface-input"
          >
            <Icon name="sell" className="text-xl text-primary" />
            {topic}
          </Button>
        </div>
        <Button
          type="submit"
          variant="luo"
          disabled={!canSubmit}
          className="min-h-11 w-full px-6 sm:w-auto"
        >
          {uploading ? "Uploading…" : loading ? "Posting…" : "Post"}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {LANGUAGES.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLanguage(l.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              language === l.id
                ? "bg-primary text-on-primary"
                : "bg-surface-elevated text-on-surface-muted"
            }`}
          >
            {l.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPollMode((v) => !v)}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            pollMode ? "bg-primary text-on-primary" : "bg-surface-elevated text-on-surface-muted"
          }`}
        >
          Poll
        </button>
      </div>

      {pollMode && (
        <div className="mt-3 space-y-2">
          {pollOptions.map((opt, i) => (
            <Input
              key={i}
              value={opt}
              onChange={(e) => {
                const next = [...pollOptions];
                next[i] = e.target.value;
                setPollOptions(next);
              }}
              placeholder={`Option ${i + 1}`}
              className="h-10 rounded-xl border-outline bg-surface-elevated"
            />
          ))}
          {pollOptions.length < 4 && (
            <button
              type="button"
              onClick={() => setPollOptions([...pollOptions, ""])}
              className="text-xs font-semibold text-primary"
            >
              + Add option
            </button>
          )}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-1">
        {SUGGESTED_HASHTAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() =>
              setContent((c) => (c.includes(`#${tag}`) ? c : `${c} #${tag} `.trim()))
            }
            className="text-[10px] font-medium text-primary hover:underline"
          >
            #{tag}
          </button>
        ))}
      </div>

      {showTopics && (
        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTopic(t);
                setShowTopics(false);
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                topic === t
                  ? "bg-primary text-on-primary"
                  : "bg-surface-elevated text-on-surface-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <p className="mt-2 text-[11px] text-on-surface-dim">
        <span className="sm:hidden">Tap Photo to attach · </span>
        <span className="hidden sm:inline">Drag a photo here or tap Photo · Ctrl+Enter to post</span>
        <span className="sm:hidden">Post when ready</span>
      </p>
      {success && (
        <p className="font-body mt-2 text-sm font-medium text-primary">Posted!</p>
      )}
      {error && (
        <p className="font-body mt-2 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
