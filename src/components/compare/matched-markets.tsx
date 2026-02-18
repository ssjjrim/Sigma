"use client";

import { useState, useMemo } from "react";
import { MatchedMarket, ArbitrageOpportunity } from "@/types/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPercent, formatCurrency } from "@/lib/utils/format";
import { GitCompareArrows, AlertTriangle, ArrowDownUp, Filter } from "lucide-react";
import Link from "next/link";
import { Platform } from "@/types/market";

const gapColors = {
  small: "bg-sky-500/10 text-sky-400",
  medium: "bg-amber-500/10 text-amber-400",
  large: "bg-orange-500/10 text-orange-400",
};

const platformColors: Record<Platform, string> = {
  polymarket: "text-blue-400",
  kalshi: "text-emerald-400",
  manifold: "text-purple-400",
  opinion: "text-orange-400",
};

type SortBy = "gap" | "roi" | "volume" | "name";
type GapFilter = "all" | "1" | "3" | "5" | "10";

const gapFilterThresholds: Record<GapFilter, number> = {
  all: 0,
  "1": 0.01,
  "3": 0.03,
  "5": 0.05,
  "10": 0.10,
};

export function MatchedMarketsView({
  matches,
  arbitrageOps,
}: {
  matches: MatchedMarket[];
  arbitrageOps: ArbitrageOpportunity[];
}) {
  const [sortBy, setSortBy] = useState<SortBy>("gap");
  const [gapFilter, setGapFilter] = useState<GapFilter>("all");

  const filteredArbitrageOps = useMemo(() => {
    const threshold = gapFilterThresholds[gapFilter];
    return arbitrageOps
      .filter((op) => op.priceDiff >= threshold)
      .sort((a, b) => {
        switch (sortBy) {
          case "gap":
            return b.priceDiff - a.priceDiff;
          case "roi":
            return b.arbROI - a.arbROI;
          case "volume":
            return Math.max(b.marketA.volume24h, b.marketB.volume24h) -
              Math.max(a.marketA.volume24h, a.marketB.volume24h);
          case "name":
            return a.marketA.question.localeCompare(b.marketA.question);
          default:
            return 0;
        }
      });
  }, [arbitrageOps, sortBy, gapFilter]);

  const filteredMatches = useMemo(() => {
    const threshold = gapFilterThresholds[gapFilter];
    return [...matches]
      .filter((m) => m.maxPriceDiff >= threshold)
      .sort((a, b) => {
        switch (sortBy) {
          case "gap":
            return b.maxPriceDiff - a.maxPriceDiff;
          case "volume":
            return Math.max(...b.markets.map((m) => m.volume24h)) -
              Math.max(...a.markets.map((m) => m.volume24h));
          case "name":
            return a.question.localeCompare(b.question);
          default:
            return 0;
        }
      });
  }, [matches, sortBy, gapFilter]);

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: "gap", label: "Gap" },
    { value: "roi", label: "ROI" },
    { value: "volume", label: "Volume" },
    { value: "name", label: "A-Z" },
  ];

  const gapOptions: { value: GapFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "1", label: ">1%" },
    { value: "3", label: ">3%" },
    { value: "5", label: ">5%" },
    { value: "10", label: ">10%" },
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Sort:</span>
          {sortOptions.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={sortBy === opt.value ? "default" : "outline"}
              onClick={() => setSortBy(opt.value)}
              className="h-7 px-2.5 text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Min gap:</span>
          {gapOptions.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={gapFilter === opt.value ? "default" : "outline"}
              onClick={() => setGapFilter(opt.value)}
              className="h-7 px-2.5 text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {filteredArbitrageOps.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">
              Price Gaps ({filteredArbitrageOps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredArbitrageOps.slice(0, 20).map((op, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-foreground">
                    {op.marketA.question}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={platformColors[op.marketA.platform]}>
                      {op.marketA.platform}: {formatPercent(op.marketA.yesPrice)}
                    </span>
                    <GitCompareArrows className="h-3 w-3" />
                    <span className={platformColors[op.marketB.platform]}>
                      {op.marketB.platform}: {formatPercent(op.marketB.yesPrice)}
                    </span>
                  </div>
                </div>
                <div className="ml-3 text-right space-y-1">
                  <div className="flex items-center justify-end gap-1 flex-wrap">
                    <Badge variant="outline" className={gapColors[op.gapSize]}>
                      {formatPercent(op.priceDiff)} gap
                    </Badge>
                    {op.hasArb && (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        {(op.arbROI * 100).toFixed(1)}% ROI
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
                    <span className={platformColors[op.marketA.platform]}>
                      {formatCurrency(op.marketA.volume24h)}
                    </span>
                    <span>/</span>
                    <span className={platformColors[op.marketB.platform]}>
                      {formatCurrency(op.marketB.volume24h)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {op.direction}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Matched Markets ({filteredMatches.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredMatches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <GitCompareArrows className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                {gapFilter !== "all"
                  ? `No matches with gap >${gapFilterThresholds[gapFilter] * 100}%`
                  : "No cross-platform matches found"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70 max-w-md">
                {gapFilter !== "all"
                  ? "Try lowering the minimum gap filter to see more results."
                  : "Markets are matched using fuzzy string similarity across platforms. Matches appear when the same question is listed on multiple platforms (e.g. Polymarket + Kalshi)."}
              </p>
            </div>
          )}
          {filteredMatches.map((match, i) => (
            <div key={i} className="rounded-lg border p-4 transition-colors hover:bg-muted/30">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="font-semibold text-sm text-foreground">{match.question}</p>
                {match.maxPriceDiff > 0.02 && (
                  <Badge variant="outline" className="shrink-0 bg-amber-500/10 text-amber-500 text-xs">
                    {formatPercent(match.maxPriceDiff)} gap
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {match.markets.map((m) => (
                  <Link
                    key={m.id}
                    href={`/markets/${m.platform}/${m.platformId}`}
                    className="inline-flex items-center gap-2.5 rounded-md border px-3 py-2 text-xs transition-colors hover:bg-muted/50 cursor-pointer"
                  >
                    <span className={`font-medium ${platformColors[m.platform]}`}>{m.platform}</span>
                    <span className="font-mono font-bold text-sm">
                      {formatPercent(m.yesPrice)}
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(m.volume24h)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
