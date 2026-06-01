import type { Id } from "@/convex/_generated/dataModel";

export async function uploadImageToConvex(
  file: File,
  generateUploadUrl: () => Promise<string>,
): Promise<Id<"_storage">> {
  const uploadUrl = await generateUploadUrl();
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) {
    throw new Error(
      res.status === 401
        ? "Not authenticated — sign in again or check Clerk + Convex JWT setup."
        : `Photo upload failed (${res.status})`,
    );
  }
  const body = (await res.json()) as { storageId?: Id<"_storage"> };
  if (!body.storageId) {
    throw new Error("Upload succeeded but no file id returned. Retry or run npx convex dev.");
  }
  return body.storageId;
}
