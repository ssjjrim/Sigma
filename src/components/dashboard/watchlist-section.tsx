"use client";

import { useWatchlist } from "@/lib/hooks/use-watchlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent, formatCurrency } from "@/lib/utils/format";
import { Eye, Star } from "lucide-react";
import { StarButton } from "@/components/watchlist/star-button";
import Link from "next/link";
import { Platform } from "@/types/market";

const platformColors: Record<Platform, string> = {
  polymarket: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  kalshi: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  manifold: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  opinion: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

export function WatchlistSection() {
  const { watchedMarkets, count } = useWatchlist();

  if (count === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Eye className="h-4 w-4 text-amber-500" />
        <CardTitle className="text-base">My Watchlist</CardTitle>
        <Badge variant="outline" className="ml-auto text-[10px]">
          {count}
        </Badge>
      </CardHeader>
      <CardContent className="px-0 py-1">
        {watchedMarkets.map((m, idx) => (
          <Link
            key={m.id}
            href={`/markets/${m.platform}/${m.platformId}`}
            className={`group flex items-center justify-between px-5 py-2.5 transition-colors hover:bg-muted/30 ${
              idx < watchedMarkets.length - 1 ? "border-b border-border/30" : ""
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <StarButton marketId={m.id} />
              <div className="min-w-0">
                <p
                  className="line-clamp-1 text-sm font-medium group-hover:text-primary transition-colors"
                  title={m.question}
                >
                  {m.question}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${platformColors[m.platform]} text-[10px] px-1.5 py-0`}
                  >
                    {m.platform}
                  </Badge>
                  {m.volume24h > 0 && (
                    <span className="text-xs text-muted-foreground/80">
                      Vol: {formatCurrency(m.volume24h)}
                    </span>
                  )}
                </div>
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
