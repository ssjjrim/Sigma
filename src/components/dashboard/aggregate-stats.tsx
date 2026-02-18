"use client";

import { UnifiedMarket, Platform } from "@/types/market";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import { BarChart3, DollarSign, Layers, TrendingUp } from "lucide-react";

function computeStats(markets: UnifiedMarket[]) {
  const totalMarkets = markets.length;
  const totalVolume = markets.reduce((s, m) => s + m.volume, 0);
  const totalLiquidity = markets.reduce((s, m) => s + m.liquidity, 0);
  const breakdown: Record<Platform, number> = {
    polymarket: 0,
    kalshi: 0,
    manifold: 0,
    opinion: 0,
  };
  for (const m of markets) breakdown[m.platform]++;

  return { totalMarkets, totalVolume, totalLiquidity, breakdown };
}

export function AggregateStats({ markets }: { markets: UnifiedMarket[] }) {
  const stats = computeStats(markets);

  const cards = [
    {
      label: "Total Markets",
      value: formatNumber(stats.totalMarkets),
      icon: Layers,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Combined Volume",
      value: formatCurrency(stats.totalVolume),
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Liquidity",
      value: formatCurrency(stats.totalLiquidity),
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Platforms Active",
      value: String(
        Object.values(stats.breakdown).filter((v) => v > 0).length
      ),
      icon: BarChart3,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="group transition-colors hover:border-border/80">
          <CardContent className="flex items-center gap-4 pt-6">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.bg} ${c.color} transition-transform group-hover:scale-105`}
            >
              <c.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tracking-tight">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
