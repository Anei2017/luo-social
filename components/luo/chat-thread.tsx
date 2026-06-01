"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { avatarUrl } from "@/lib/avatar";
import { formatConvexError } from "@/lib/convex-errors";
import { uploadImageToConvex } from "@/lib/upload-image";
import { Icon } from "./icon";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ChatThread({
  conversationId,
  otherName,
  otherUsername,
  otherAvatar,
}: {
  conversationId: Id<"conversations">;
  otherName: string;
  otherUsername: string;
  otherAvatar?: string;
}) {
  const me = useQuery(api.users.current);
  const messages = useQuery(api.messages.listMessages, { conversationId });
  const send = useMutation(api.messages.send);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!text.trim() && !pendingFile) || sending) return;
    setSending(true);
    setError(null);
    try {
      let imageStorageId: Id<"_storage"> | undefined;
      if (pendingFile) {
        imageStorageId = await uploadImageToConvex(pendingFile, () =>
          generateUploadUrl(),
        );
      }
      await send({
        conversationId,
        content: text.trim() || " ",
        imageStorageId,
      });
      setText("");
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPendingFile(null);
    } catch (err) {
      setError(formatConvexError(err));
    } finally {
      setSending(false);
    }
  }

  function onFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <div className="card-dark flex h-[min(70vh,640px)] flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-outline-soft px-4 py-3">
        <Link
          href={`/profile/${otherUsername}`}
          className="relative h-10 w-10 overflow-hidden rounded-full"
        >
          <Image
            src={avatarUrl({ avatarUrl: otherAvatar, username: otherUsername })}
            alt=""
            fill
            unoptimized
            sizes="40px"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-on-surface">{otherName}</p>
          <p className="text-xs text-on-surface-dim">@{otherUsername}</p>
        </div>
        <Link
          href="/messages"
          className="text-sm font-medium text-primary hover:underline md:hidden"
        >
          Back
        </Link>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages === undefined && (
          <p className="text-center text-sm text-on-surface-muted">Loading…</p>
        )}
        {messages?.length === 0 && (
          <p className="text-center text-sm text-on-surface-muted">
            Say hello — your messages are private between you two.
          </p>
        )}
        {messages?.map((m) => {
          const mine = m.senderId === me?._id;
          return (
            <div
              key={m._id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  mine
                    ? "rounded-br-sm bg-primary text-on-primary"
                    : "rounded-bl-sm bg-surface-elevated text-on-surface"
                }`}
              >
                {m.imageUrl && (
                  <div className="relative mb-2 aspect-video w-full min-w-[200px] overflow-hidden rounded-lg">
                    <Image
                      src={m.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="280px"
                    />
                  </div>
                )}
                {m.content.trim() && m.content.trim() !== " " && (
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                )}
                <p
                  className={`mt-1 text-[10px] ${
                    mine ? "text-on-primary/70" : "text-on-surface-dim"
                  }`}
                >
                  {formatTime(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {previewUrl && (
        <div className="relative mx-4 mb-2 h-24 overflow-hidden rounded-lg">
          <Image src={previewUrl} alt="" fill className="object-cover" unoptimized />
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
              setPendingFile(null);
            }}
            className="absolute top-1 right-1 rounded-full bg-background/80 p-1"
          >
            <Icon name="close" />
          </button>
        </div>
      )}

      <form
        onSubmit={onSend}
        className="flex items-center gap-2 border-t border-outline-soft px-4 py-3"
      >
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-on-surface-muted hover:text-primary"
          aria-label="Attach photo"
        >
          <Icon name="image" className="text-xl" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="font-body flex-1 rounded-full bg-surface-elevated px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={sending || (!text.trim() && !pendingFile)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary disabled:opacity-40"
          aria-label="Send"
        >
          <Icon name="send" className="text-xl" />
        </button>
      </form>
      {error && (
        <p className="px-4 pb-2 text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
