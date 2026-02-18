"use client";

import { UnifiedMarket, Platform } from "@/types/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent, formatCurrency } from "@/lib/utils/format";
import { Sparkles } from "lucide-react";
import Link from "next/link";

const platformColors: Record<Platform, string> = {
  polymarket: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  kalshi: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  manifold: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  opinion: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

function getRelatedMarkets(
  current: UnifiedMarket,
  allMarkets: UnifiedMarket[],
  limit = 5
): UnifiedMarket[] {
  const keywords = current.question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["will", "what", "when", "does", "have", "been", "this", "that", "with", "from", "they", "their"].includes(w));

  const scored = allMarkets
    .filter((m) => m.id !== current.id)
    .map((m) => {
      let score = 0;
      // Category match
      if (m.category && current.category && m.category === current.category) {
        score += 3;
      }
      // Keyword overlap
      const mLower = m.question.toLowerCase();
      for (const kw of keywords) {
        if (mLower.includes(kw)) score += 1;
      }
      // Bonus for same platform (cross-reference value)
      if (m.platform !== current.platform) score += 0.5;
      // Bonus for active + has volume
      if (m.volume24h > 0) score += 0.5;
      return { market: m, score };
    })
    .filter((s) => s.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => s.market);
}

export function RelatedMarkets({
  current,
  allMarkets,
}: {
  current: UnifiedMarket;
  allMarkets: UnifiedMarket[];
}) {
  const related = getRelatedMarkets(current, allMarkets);

  if (related.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <CardTitle className="text-base">Related Markets</CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-1">
        {related.map((m, idx) => (
          <Link
            key={m.id}
            href={`/markets/${m.platform}/${m.platformId}`}
            className={`group flex items-center justify-between px-5 py-2.5 transition-colors hover:bg-muted/30 ${idx < related.length - 1 ? "border-b border-border/30" : ""}`}
          >
            <div className="min-w-0 flex-1">
              <p
                className="line-clamp-1 text-sm font-medium group-hover:text-primary transition-colors"
                title={m.question}
              >
                {m.question}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <Badge variant="outline" className={`${platformColors[m.platform]} text-[10px] px-1.5 py-0`}>
                  {m.platform}
                </Badge>
                {m.volume24h > 0 && (
                  <span className="text-xs text-muted-foreground/80">
                    Vol: {formatCurrency(m.volume24h)}
                  </span>
                )}
              </div>
            </div>
            <div className="ml-3 text-right shrink-0">
              <p className="text-lg font-bold tabular-nums">
                {formatPercent(m.yesPrice, 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">Yes</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
