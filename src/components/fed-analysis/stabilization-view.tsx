"use client";

import { StabilizationResult, TimeBucket, EconomicEvent } from "@/types/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/utils/format";
import { CheckCircle2, XCircle, Clock, TrendingDown, TrendingUp, Minus } from "lucide-react";

export function StabilizationView({
  result,
}: {
  result: StabilizationResult | null;
}) {
  if (!result) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Stabilization Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a Fed rate market to analyze stabilization
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        {result.isStabilized ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <XCircle className="h-4 w-4 text-amber-500" />
        )}
        <CardTitle className="text-base">
          Stabilization Detection
        </CardTitle>
        <Badge
          variant="outline"
          className={
            result.isStabilized
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-amber-500/10 text-amber-500"
          }
        >
          {result.isStabilized ? "Stabilized" : "Volatile"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Volatility</p>
            <p className="text-lg font-bold">{formatPercent(result.volatility)}</p>
            <Badge
              variant="outline"
              className={`mt-1 text-xs ${result.factors.lowVolatility ? "text-emerald-500" : "text-red-500"}`}
            >
              {result.factors.lowVolatility ? "Low" : "High"}
            </Badge>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="text-lg font-bold">{formatPercent(result.confidence)}</p>
            <Badge
              variant="outline"
              className={`mt-1 text-xs ${result.factors.highConfidence ? "text-emerald-500" : "text-amber-500"}`}
            >
              {result.factors.highConfidence ? "High" : "Moderate"}
            </Badge>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Proximity</p>
            <p className="text-lg font-bold">{formatPercent(result.proximity)}</p>
            <Badge
              variant="outline"
              className={`mt-1 text-xs ${result.factors.nearBoundary ? "text-emerald-500" : "text-muted-foreground"}`}
            >
              {result.factors.nearBoundary ? "Near boundary" : "Mid-range"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TimeBucketsView({ buckets }: { buckets: TimeBucket[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Time Bucket Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {buckets.map((b) => (
            <div key={b.label} className="rounded-lg border p-3 text-center">
              <p className="text-xs font-medium text-muted-foreground">{b.label}</p>
              <p className="mt-1 text-lg font-bold">{formatPercent(b.avgPrice)}</p>
              <div className="mt-1 flex items-center justify-center gap-1">
                {b.priceChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : b.priceChange < 0 ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : (
                  <Minus className="h-3 w-3 text-muted-foreground" />
                )}
                <span
                  className={`text-xs ${b.priceChange > 0 ? "text-emerald-500" : b.priceChange < 0 ? "text-red-500" : "text-muted-foreground"}`}
                >
                  {b.priceChange > 0 ? "+" : ""}{formatPercent(b.priceChange)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Vol: {formatPercent(b.volatility)}
              </p>
              <p className="text-xs text-muted-foreground">
                n={b.sampleCount}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function EconomicEventsView({ events }: { events: EconomicEvent[] }) {
  const impactColors = {
    high: "bg-red-500/10 text-red-500",
    medium: "bg-amber-500/10 text-amber-500",
    low: "bg-emerald-500/10 text-emerald-500",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Upcoming Economic Events</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming events</p>
        ) : (
          <div className="space-y-2">
            {events.map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{e.label}</p>
                  <p className="text-xs text-muted-foreground">{e.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {e.type}
                  </Badge>
                  <Badge variant="outline" className={impactColors[e.impact]}>
                    {e.impact}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
