"use client";

import { UnifiedMarket, Platform } from "@/types/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { Flame } from "lucide-react";
import Link from "next/link";

const platformBadge: Record<Platform, string> = {
  polymarket: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  kalshi: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  manifold: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  opinion: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

export function HotMarkets({ markets, title = "Hot Markets", viewAllHref }: { markets: UnifiedMarket[]; title?: string; viewAllHref?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-xs text-muted-foreground hover:text-primary transition-colors">
            View all →
          </Link>
        )}
      </CardHeader>
      <CardContent className="px-0 py-1">
        {markets.length === 0 && (
          <p className="px-6 py-4 text-sm text-muted-foreground">No markets available</p>
        )}
        {markets.map((m, idx) => (
          <Link
            key={m.id}
            href={`/markets/${m.platform}/${m.platformId}`}
            className={`group flex items-center justify-between px-5 py-2.5 transition-colors hover:bg-muted/30 ${idx < markets.length - 1 ? "border-b border-border/30" : ""}`}
          >
            <div className="min-w-0 flex-1">
              <p
                className="line-clamp-1 text-sm font-medium group-hover:text-primary transition-colors"
                title={m.question}
              >
                {m.question}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <Badge variant="outline" className={`${platformBadge[m.platform]} text-[10px] px-1.5 py-0`}>
                  {m.platform}
                </Badge>
                <span className="text-xs text-muted-foreground/80">
                  {m.volume24h > 0
                    ? `Vol: ${formatCurrency(m.volume24h)}`
                    : `Liq: ${formatCurrency(m.liquidity)}`}
                </span>
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
