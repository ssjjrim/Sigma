"use client";

import { PlatformStatus, Platform } from "@/types/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { Activity, AlertCircle } from "lucide-react";
import Link from "next/link";

const platformConfig: Record<Platform, { name: string; badge: string; glow: string; accent: string }> = {
  polymarket: {
    name: "Polymarket",
    badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    glow: "after:bg-blue-500/5",
    accent: "border-l-blue-500",
  },
  kalshi: {
    name: "Kalshi",
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    glow: "after:bg-emerald-500/5",
    accent: "border-l-emerald-500",
  },
  manifold: {
    name: "Manifold",
    badge: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    glow: "after:bg-purple-500/5",
    accent: "border-l-purple-500",
  },
  opinion: {
    name: "Opinion",
    badge: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    glow: "after:bg-orange-500/5",
    accent: "border-l-orange-500",
  },
};

export function PlatformStatusCards({
  statuses,
}: {
  statuses: PlatformStatus[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statuses.map((s) => {
        const config = platformConfig[s.platform];
        if (!config) return null;
        return (
          <Card
            key={s.platform}
            className={`relative overflow-hidden transition-all hover:border-border/80 cursor-default border-l-2 ${config.accent} ${!s.connected ? "opacity-60" : ""}`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {config.name}
              </CardTitle>
              {s.connected ? (
                <Badge variant="outline" className={config.badge}>
                  <span className="relative mr-1.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
                  </span>
                  Live
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Offline
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {s.connected ? (
                <div className="space-y-1">
                  <p className="text-3xl font-bold tracking-tight">
                    {formatNumber(s.marketCount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(s.totalVolume)} total volume
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Service unavailable
                  </p>
                  <Link href="/settings" className="text-xs text-primary/70 hover:text-primary transition-colors">
                    Configure API key in Settings →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
