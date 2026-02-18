"use client";

import { UnifiedMarket } from "@/types/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent, formatCurrency } from "@/lib/utils/format";
import { rankBySpread } from "@/lib/analytics/volatility";
import Link from "next/link";

export function SpreadAnalysisView({ markets }: { markets: UnifiedMarket[] }) {
  const ranked = rankBySpread(markets).slice(0, 30);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Spread Ranking (Widest First)
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Estimated effective spread based on price complement gap and
          liquidity-to-volume ratio
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-3 pb-2 text-xs font-medium text-muted-foreground">
            <span>Market</span>
            <span className="w-20 text-right">Yes Price</span>
            <span className="w-20 text-right">Volume</span>
            <span className="w-28 text-right">Est. Spread</span>
          </div>
          {ranked.map((a) => (
            <Link
              key={a.market.id}
              href={`/markets/${a.market.platform}/${a.market.platformId}`}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:bg-muted/50 hover:border-border/50"
            >
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-medium">
                  {a.market.question}
                </p>
                <p className="text-xs text-muted-foreground">
                  {a.market.platform} &middot; Liq:{" "}
                  {formatCurrency(a.market.liquidity)}
                </p>
              </div>
              <span className="w-20 text-right text-sm tabular-nums">
                {formatPercent(a.market.yesPrice)}
              </span>
              <span className="w-20 text-right text-sm tabular-nums text-muted-foreground">
                {formatCurrency(a.market.volume24h)}
              </span>
              <div className="w-28 text-right">
                <Badge
                  variant="outline"
                  className={
                    a.bidAskSpread > 0.05
                      ? "bg-red-500/10 text-red-500"
                      : a.bidAskSpread > 0.02
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-emerald-500/10 text-emerald-500"
                  }
                >
                  {formatPercent(a.bidAskSpread)}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
