"use client";

import { useEffect, useState, useCallback } from "react";
import { UnifiedMarket, Platform } from "@/types/market";
import { fetchCLOBBook } from "@/lib/api/polymarket/clob";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { TrendingUp, TrendingDown, X, Waves } from "lucide-react";
import Link from "next/link";

interface WhaleToast {
  id: string;
  market: UnifiedMarket;
  side: "bid" | "ask";
  price: number;
  notional: number;
  timestamp: number;
}

const platformColors: Record<Platform, string> = {
  polymarket: "text-blue-400",
  kalshi: "text-emerald-400",
  manifold: "text-purple-400",
  opinion: "text-orange-400",
};

export function WhaleToastProvider({ markets }: { markets: UnifiedMarket[] }) {
  const [toasts, setToasts] = useState<WhaleToast[]>([]);
  const [seenKeys, setSeenKeys] = useState<Set<string>>(new Set());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 8000);
    return () => clearTimeout(timer);
  }, [toasts]);

  // Scan orderbooks periodically for new whale orders
  useEffect(() => {
    if (!markets.length) return;

    const topPoly = markets
      .filter((m) => m.platform === "polymarket" && m.outcomes[0]?.tokenId)
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 4); // Scan top 4 for toasts (lighter than whale tracker)

    let cancelled = false;

    async function scan() {
      for (const market of topPoly) {
        if (cancelled) break;
        try {
          const tokenId = market.outcomes[0]?.tokenId;
          if (!tokenId) continue;
          const book = await fetchCLOBBook(tokenId);

          const entries = [
            ...(book.bids || []).map((b) => ({ side: "bid" as const, price: parseFloat(b.price), size: parseFloat(b.size) })),
            ...(book.asks || []).map((a) => ({ side: "ask" as const, price: parseFloat(a.price), size: parseFloat(a.size) })),
          ];

          for (const entry of entries) {
            const notional = entry.price * entry.size;
            if (notional < 50000) continue; // Only show $50K+ as toasts

            const key = `${market.id}-${entry.side}-${entry.price}-${Math.floor(notional / 1000)}`;
            if (seenKeys.has(key)) continue;

            setSeenKeys((prev) => new Set([...prev, key]));
            setToasts((prev) => [
              ...prev.slice(-2), // Max 3 toasts
              {
                id: `${Date.now()}-${key}`,
                market,
                side: entry.side,
                price: entry.price,
                notional,
                timestamp: Date.now(),
              },
            ]);
          }
        } catch {
          // Skip failed fetches
        }
      }
    }

    // Initial scan after 15s (let main data load first)
    const initialTimer = setTimeout(scan, 15000);
    // Rescan every 60s
    const interval = setInterval(scan, 60000);

    return () => {
      cancelled = true;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [markets, seenKeys]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Link
          key={toast.id}
          href={`/markets/${toast.market.platform}/${toast.market.platformId}`}
          className="group flex items-center gap-3 rounded-lg border border-cyan-500/30 bg-background/95 backdrop-blur-sm px-4 py-3 shadow-lg shadow-cyan-500/5 transition-all hover:border-cyan-500/50 cursor-pointer animate-in slide-in-from-right-5"
        >
          <Waves className="h-4 w-4 text-cyan-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium line-clamp-1">
              {toast.market.question}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {toast.side === "bid" ? (
                <TrendingUp className="h-3 w-3 text-emerald-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-400" />
              )}
              <span className="text-[10px] text-muted-foreground">
                {toast.side === "bid" ? "Buy" : "Sell"}{" "}
                <span className="font-bold text-foreground">{formatCurrency(toast.notional)}</span>
                {" "}@ {formatPercent(toast.price)}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dismissToast(toast.id);
            }}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        </Link>
      ))}
    </div>
  );
}
