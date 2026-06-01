const TAG_REGEX = /#([a-zA-Z0-9_\u00C0-\u024F]+)/g;

export function extractHashtags(text: string): string[] {
  const tags = new Set<string>();
  for (const match of text.matchAll(TAG_REGEX)) {
    const tag = match[1]?.toLowerCase();
    if (tag && tag.length <= 32) tags.add(tag);
  }
  return [...tags].slice(0, 12);
}

export const SUGGESTED_HASHTAGS = [
  "LuoKitchen",
  "LuoMusic",
  "LuoWeddings",
  "DholuoProverbs",
  "LuoCulture",
  "LuoDiaspora",
  "Nyatiti",
  "LuoBusiness",
] as const;
