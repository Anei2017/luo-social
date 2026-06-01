/** Default cover when user has not uploaded one (null = use CSS gradient in UI) */
export function coverImageSrc(user?: { coverUrl?: string } | null): string | null {
  return user?.coverUrl ?? null;
}
