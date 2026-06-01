"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatConvexError } from "@/lib/convex-errors";
import { uploadVideoToConvex, validateVideoFile } from "@/lib/upload-media";
import { Icon } from "./icon";

export function ReelCompose({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const createReel = useMutation(api.reels.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
    setCaption("");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateVideoFile(file);
    if (err) {
      setError(err);
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingFile || loading) return;
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const videoStorageId = await uploadVideoToConvex(pendingFile, () =>
        generateUploadUrl(),
      );
      await createReel({
        videoStorageId,
        caption: caption.trim() || undefined,
      });
      handleClose();
      router.refresh();
    } catch (err) {
      setError(formatConvexError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-label="Create reel"
      onClick={handleClose}
    >
      <form
        onSubmit={handleSubmit}
        className="card-dark max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">New reel</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-on-surface-muted"
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/*"
          className="hidden"
          onChange={onFileChange}
        />

        {!previewUrl ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex min-h-[200px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-surface-elevated/50 text-on-surface-muted"
          >
            <Icon name="videocam" className="text-5xl text-primary" />
            <span className="text-sm font-semibold">Tap to select video</span>
            <span className="text-xs">MP4, WebM, MOV · max 80MB</span>
          </button>
        ) : (
          <div className="relative overflow-hidden rounded-xl bg-black">
            <video
              src={previewUrl}
              controls
              playsInline
              className="max-h-[50vh] w-full object-contain"
            />
            <button
              type="button"
              onClick={() => {
                reset();
                fileRef.current?.click();
              }}
              className="absolute top-2 right-2 rounded-full bg-background/90 px-3 py-1 text-xs font-bold"
            >
              Change
            </button>
          </div>
        )}

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption…"
          rows={2}
          className="mt-4 w-full resize-none rounded-xl border border-outline bg-surface-elevated px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/40"
        />

        <button
          type="submit"
          disabled={!pendingFile || loading}
          className="mt-4 min-h-11 w-full rounded-full bg-primary py-2.5 text-sm font-bold text-on-primary disabled:opacity-40"
        >
          {loading ? "Uploading video…" : "Post reel"}
        </button>

        {error && (
          <p className="mt-2 text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
