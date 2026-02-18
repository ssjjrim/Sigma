"use client";

const STORAGE_KEY = "predictboard-watchlist";

export function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWatchlist(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function addToWatchlist(marketId: string) {
  const list = getWatchlist();
  if (!list.includes(marketId)) {
    list.push(marketId);
    saveWatchlist(list);
  }
}

export function removeFromWatchlist(marketId: string) {
  const list = getWatchlist().filter((id) => id !== marketId);
  saveWatchlist(list);
}

export function isInWatchlist(marketId: string): boolean {
  return getWatchlist().includes(marketId);
}
