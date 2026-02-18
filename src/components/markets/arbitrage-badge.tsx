"use client";

import { useState } from "react";
import { UnifiedMarket, Platform } from "@/types/market";
import { stringSimilarity } from "@/lib/utils/string-similarity";
import { formatPercent } from "@/lib/utils/format";
import { X, Zap } from "lucide-react";
import Link from "next/link";

const platformColors: Record<Platform, string> = {
  polymarket: "text-blue-400",
  kalshi: "text-emerald-400",
  manifold: "text-purple-400",
  opinion: "text-orange-400",
};

export function ArbitrageBadge({
  current,
  allMarkets,
}: {
  current: UnifiedMarket;
  allMarkets: UnifiedMarket[];
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Find cross-platform matches
  const matches = allMarkets.filter((m) => {
    if (m.id === current.id) return false;
    if (m.platform === current.platform) return false;
    return stringSimilarity(current.question, m.question) >= 0.6;
  });

  if (matches.length === 0) return null;

  // Find the best deal (cheapest YES price on another platform)
  const cheaperYes = matches.filter((m) => m.yesPrice < current.yesPrice);
  const cheaperNo = matches.filter((m) => m.noPrice < current.noPrice);

  // Pick the most significant opportunity
  let bestMatch: UnifiedMarket | null = null;
  let savings = 0;
  let side: "YES" | "NO" = "YES";

  if (cheaperYes.length > 0) {
    cheaperYes.sort((a, b) => a.yesPrice - b.yesPrice);
    bestMatch = cheaperYes[0];
    savings = current.yesPrice - bestMatch.yesPrice;
    side = "YES";
  }

  if (cheaperNo.length > 0) {
    cheaperNo.sort((a, b) => a.noPrice - b.noPrice);
    const noSavings = current.noPrice - cheaperNo[0].noPrice;
    if (noSavings > savings) {
      bestMatch = cheaperNo[0];
      savings = noSavings;
      side = "NO";
    }
  }

  if (!bestMatch || savings < 0.01) return null;

  const price = side === "YES" ? bestMatch.yesPrice : bestMatch.noPrice;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-2.5">
      <Zap className="h-4 w-4 text-amber-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium text-amber-400">
            Save {formatPercent(savings)}
          </span>{" "}
          <span className="text-muted-foreground">
            — Buy {side} at{" "}
            <span className={`font-medium ${platformColors[bestMatch.platform]}`}>
              {formatPercent(price)} on {bestMatch.platform}
            </span>
            {" "}vs {formatPercent(side === "YES" ? current.yesPrice : current.noPrice)} here
          </span>
        </p>
      </div>
      <Link
        href={`/markets/${bestMatch.platform}/${bestMatch.platformId}`}
        className="text-xs font-medium text-amber-400 hover:text-amber-300 shrink-0"
      >
        View
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
