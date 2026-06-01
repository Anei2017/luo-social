import type { Id } from "@/convex/_generated/dataModel";

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);

const MAX_VIDEO_BYTES = 80 * 1024 * 1024; // 80MB

export function validateVideoFile(file: File): string | null {
  if (!VIDEO_TYPES.has(file.type) && !file.type.startsWith("video/")) {
    return "Use MP4, WebM, or MOV video.";
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return "Video must be under 80MB.";
  }
  return null;
}

export async function uploadFileToConvex(
  file: File,
  generateUploadUrl: () => Promise<string>,
  label = "File",
): Promise<Id<"_storage">> {
  const uploadUrl = await generateUploadUrl();
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) {
    throw new Error(
      res.status === 401
        ? "Not authenticated — sign in again."
        : `${label} upload failed (${res.status})`,
    );
  }
  const body = (await res.json()) as { storageId?: Id<"_storage"> };
  if (!body.storageId) {
    throw new Error("Upload succeeded but no storage id returned.");
  }
  return body.storageId;
}

export async function uploadVideoToConvex(
  file: File,
  generateUploadUrl: () => Promise<string>,
): Promise<Id<"_storage">> {
  const err = validateVideoFile(file);
  if (err) throw new Error(err);
  return uploadFileToConvex(file, generateUploadUrl, "Video");
}
