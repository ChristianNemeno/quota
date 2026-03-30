const KEY = "quota_favorites";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

export function toggleFavorite(id: string): boolean {
  const current = getFavorites();
  const exists = current.includes(id);
  const updated = exists ? current.filter((x) => x !== id) : [...current, id];

  localStorage.setItem(KEY, JSON.stringify(updated));

  return !exists;
}
