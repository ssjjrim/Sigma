"use client";

import { useEffect, useState } from "react";
import { UnifiedMarket, Platform } from "@/types/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { Waves, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { fetchCLOBBook } from "@/lib/api/polymarket/clob";
import { fetchKalshiOrderbook } from "@/lib/api/kalshi/client";

interface WhaleOrder {
  market: UnifiedMarket;
  side: "bid" | "ask";
  price: number;
  size: number;
  notional: number;
}

const platformColors: Record<Platform, string> = {
  polymarket: "text-blue-400",
  kalshi: "text-emerald-400",
  manifold: "text-purple-400",
  opinion: "text-orange-400",
};

type WhaleFilter = "all" | "bid" | "ask";
type MinValue = 5000 | 10000 | 50000 | 100000;

const minValueOptions: { value: MinValue; label: string }[] = [
  { value: 5000, label: "$5K" },
  { value: 10000, label: "$10K" },
  { value: 50000, label: "$50K" },
  { value: 100000, label: "$100K" },
];

export function WhaleTracker({ markets }: { markets: UnifiedMarket[] }) {
  const [whaleOrders, setWhaleOrders] = useState<WhaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<WhaleFilter>("all");
  const [minValue, setMinValue] = useState<MinValue>(5000);

  useEffect(() => {
    if (!markets.length) return;

    // Top Polymarket markets by volume (they have accessible orderbooks)
    const topPoly = markets
      .filter((m) => m.platform === "polymarket" && m.outcomes[0]?.tokenId)
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 8);

    // Top Kalshi markets by total volume (use platformId as ticker for orderbook)
    // Kalshi volume24h can be low, so sort by total volume for deeper orderbooks
    const topKalshi = markets
      .filter((m) => m.platform === "kalshi" && m.platformId)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 8);

    let cancelled = false;

    async function scanOrderbooks() {
      const orders: WhaleOrder[] = [];

      // Scan Polymarket orderbooks
      for (const market of topPoly) {
        try {
          const tokenId = market.outcomes[0]?.tokenId;
          if (!tokenId) continue;

          const book = await fetchCLOBBook(tokenId);

          const bids = (book.bids || []).map((b) => ({
            price: parseFloat(b.price),
            size: parseFloat(b.size),
          }));
          const asks = (book.asks || []).map((a) => ({
            price: parseFloat(a.price),
            size: parseFloat(a.size),
          }));

          for (const bid of bids) {
            const notional = bid.price * bid.size;
            if (notional >= 5000) {
              orders.push({ market, side: "bid", price: bid.price, size: bid.size, notional });
            }
          }
          for (const ask of asks) {
            const notional = ask.price * ask.size;
            if (notional >= 5000) {
              orders.push({ market, side: "ask", price: ask.price, size: ask.size, notional });
            }
          }
        } catch {
          // Skip failed orderbook fetches
        }
      }

      // Scan Kalshi orderbooks (prices in cents: 1-99)
      for (const market of topKalshi) {
        try {
          const book = await fetchKalshiOrderbook(market.platformId);
          const yesOrders = book.orderbook?.yes || [];
          const noOrders = book.orderbook?.no || [];

          for (const [priceCents, size] of yesOrders) {
            const price = priceCents / 100;
            const notional = price * size;
            if (notional >= 5000) {
              orders.push({ market, side: "bid", price, size, notional });
            }
          }
          for (const [priceCents, size] of noOrders) {
            const price = priceCents / 100;
            const notional = price * size;
            if (notional >= 5000) {
              orders.push({ market, side: "ask", price, size, notional });
            }
          }
        } catch {
          // Skip failed orderbook fetches
        }
      }

      if (!cancelled) {
        orders.sort((a, b) => b.notional - a.notional);
        setWhaleOrders(orders.slice(0, 12));
        setLoading(false);
      }
    }

    scanOrderbooks();
    return () => { cancelled = true; };
  }, [markets]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Waves className="h-4 w-4 text-cyan-500" />
          <CardTitle className="text-base">Whale Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted/30" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (whaleOrders.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Waves className="h-4 w-4 text-cyan-500" />
          <CardTitle className="text-base">Whale Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No large orders detected
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Waves className="h-4 w-4 text-cyan-500" />
        <CardTitle className="text-base">Whale Orders</CardTitle>
        <div className="ml-auto flex items-center gap-1 flex-wrap justify-end">
          {(["all", "bid", "ask"] as WhaleFilter[]).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "ghost"}
              onClick={() => setFilter(f)}
              className="h-6 px-2 text-[10px]"
            >
              {f === "all" ? "All" : f === "bid" ? "Buy" : "Sell"}
            </Button>
          ))}
          <span className="mx-0.5 h-4 w-px bg-border" />
          {minValueOptions.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={minValue === opt.value ? "secondary" : "ghost"}
              onClick={() => setMinValue(opt.value)}
              className="h-6 px-2 text-[10px]"
            >
              {opt.label}
            </Button>
          ))}
          <Badge variant="outline" className="ml-1 text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-0 py-1">
        {whaleOrders.filter((wo) => (filter === "all" || wo.side === filter) && wo.notional >= minValue).map((wo, i) => (
          <Link
            key={`${wo.market.id}-${wo.side}-${wo.price}-${i}`}
            href={`/markets/${wo.market.platform}/${wo.market.platformId}`}
            className={`group flex items-center justify-between px-5 py-2.5 transition-colors hover:bg-muted/30 cursor-pointer ${
              i < whaleOrders.length - 1 ? "border-b border-border/30" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <p
                className="line-clamp-1 text-sm font-medium group-hover:text-primary transition-colors"
                title={wo.market.question}
              >
                {wo.market.question}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className={`text-[10px] font-medium ${platformColors[wo.market.platform]}`}>
                  {wo.market.platform}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  @ {formatPercent(wo.price)}
                </span>
              </div>
            </div>
            <div className="ml-3 flex items-center gap-2 shrink-0">
              {wo.side === "bid" ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              )}
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums">
                  {formatCurrency(wo.notional)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {wo.side === "bid" ? "Buy" : "Sell"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
