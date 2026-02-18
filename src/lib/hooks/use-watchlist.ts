"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  saveWatchlist,
} from "@/lib/watchlist/store";
import { useMarkets } from "./use-markets";
import { UnifiedMarket } from "@/types/market";

const WATCHLIST_EVENT = "predictboard-watchlist-change";

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(WATCHLIST_EVENT));
  }
}

let version = 0;

function subscribe(callback: () => void) {
  const handler = () => {
    version++;
    callback();
  };
  window.addEventListener(WATCHLIST_EVENT, handler);
  return () => window.removeEventListener(WATCHLIST_EVENT, handler);
}

function getSnapshot() {
  return version;
}

function getServerSnapshot() {
  return 0;
}

export function useWatchlist() {
  const ver = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [ids, setIds] = useState<string[]>([]);
  const { data } = useMarkets();

  useEffect(() => {
    setIds(getWatchlist());
  }, [ver]);

  const toggle = useCallback((marketId: string) => {
    const current = getWatchlist();
    if (current.includes(marketId)) {
      removeFromWatchlist(marketId);
    } else {
      addToWatchlist(marketId);
    }
    notifyChange();
  }, []);

  const isWatched = useCallback(
    (marketId: string) => ids.includes(marketId),
    [ids]
  );

  const watchedMarkets: UnifiedMarket[] = data?.markets
    ? ids
        .map((id) => data.markets.find((m) => m.id === id))
        .filter((m): m is UnifiedMarket => !!m)
    : [];

  return {
    ids,
    watchedMarkets,
    toggle,
    isWatched,
    count: ids.length,
  };
}
