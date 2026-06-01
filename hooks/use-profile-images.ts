"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatConvexError } from "@/lib/convex-errors";
import { uploadImageToConvex } from "@/lib/upload-image";

/**
 * Cover + avatar upload state for the profile hero.
 * Previews update immediately; Convex stores the final URLs.
 */
export function useProfileImages(isOwnProfile: boolean) {
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (
      file: File,
      kind: "cover" | "avatar",
    ) => {
      if (!isOwnProfile) return;
      const setUploading =
        kind === "cover" ? setUploadingCover : setUploadingAvatar;
      const setPreview =
        kind === "cover" ? setCoverPreview : setAvatarPreview;

      setUploading(true);
      setError(null);
      const preview = URL.createObjectURL(file);
      setPreview(preview);

      try {
        const storageId = await uploadImageToConvex(file, () =>
          generateUploadUrl(),
        );
        await updateProfile(
          kind === "cover"
            ? { coverStorageId: storageId }
            : { avatarStorageId: storageId },
        );
      } catch (err) {
        setPreview(null);
        URL.revokeObjectURL(preview);
        setError(formatConvexError(err));
      } finally {
        setUploading(false);
      }
    },
    [generateUploadUrl, isOwnProfile, updateProfile],
  );

  const onCoverChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file?.type.startsWith("image/")) void uploadImage(file, "cover");
      e.target.value = "";
    },
    [uploadImage],
  );

  const onAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file?.type.startsWith("image/")) void uploadImage(file, "avatar");
      e.target.value = "";
    },
    [uploadImage],
  );

  return {
    coverInputRef,
    avatarInputRef,
    coverPreview,
    avatarPreview,
    uploadingCover,
    uploadingAvatar,
    error,
    setError,
    onCoverChange,
    onAvatarChange,
    openCoverPicker: () => coverInputRef.current?.click(),
    openAvatarPicker: () => avatarInputRef.current?.click(),
  };
}
