export function avatarUrl(user?: {
  avatarUrl?: string;
  username?: string;
} | null) {
  if (user?.avatarUrl) return user.avatarUrl;
  const seed = user?.username ?? "luo";
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}
