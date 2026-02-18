"use client";

import { useState, useMemo } from "react";
import { useMarkets } from "@/lib/hooks/use-markets";
import { usePriceHistory } from "@/lib/hooks/use-price-history";
import { detectStabilization, calculateTimeBuckets } from "@/lib/analytics/stabilization";
import {
  StabilizationView,
  TimeBucketsView,
  EconomicEventsView,
} from "@/components/fed-analysis/stabilization-view";
import { PriceChart } from "@/components/markets/price-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent } from "@/lib/utils/format";
import { EconomicEvent } from "@/types/analytics";

const FED_KEYWORDS = ["fed", "federal reserve", "interest rate", "fomc", "rate cut", "rate hike"];

const UPCOMING_EVENTS: EconomicEvent[] = [
  { date: "2026-03-07", type: "NFP", label: "Non-Farm Payrolls (Feb)", impact: "high" },
  { date: "2026-03-12", type: "CPI", label: "CPI Report (Feb)", impact: "high" },
  { date: "2026-03-19", type: "FOMC", label: "FOMC Meeting", impact: "high" },
  { date: "2026-03-28", type: "PCE", label: "PCE Price Index (Feb)", impact: "medium" },
  { date: "2026-04-04", type: "NFP", label: "Non-Farm Payrolls (Mar)", impact: "high" },
  { date: "2026-04-10", type: "CPI", label: "CPI Report (Mar)", impact: "high" },
];

export default function FedAnalysisPage() {
  const { data, isLoading } = useMarkets();
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);

  const fedMarkets = useMemo(() => {
    if (!data?.markets) return [];
    return data.markets.filter((m) =>
      FED_KEYWORDS.some((kw) => m.question.toLowerCase().includes(kw))
    );
  }, [data?.markets]);

  const selectedMarket = fedMarkets.find((m) => m.id === selectedMarketId);
  const tokenId = selectedMarket?.outcomes[0]?.tokenId;

  const { data: priceHistory, isLoading: priceLoading } = usePriceHistory(
    selectedMarket?.platform === "polymarket" ? tokenId : undefined
  );

  const stabilization = useMemo(() => {
    if (!priceHistory?.length) return null;
    return detectStabilization(priceHistory);
  }, [priceHistory]);

  const timeBuckets = useMemo(() => {
    if (!priceHistory?.length) return [];
    return calculateTimeBuckets(priceHistory);
  }, [priceHistory]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Fed Rate Analysis</h1>
        <p className="text-sm text-muted-foreground">
          Analyze Fed rate prediction markets with stabilization detection and economic event overlay
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Fed-Related Markets ({fedMarkets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fedMarkets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No Fed-related markets found. They may appear when available on connected platforms.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {fedMarkets.map((m) => (
                    <Button
                      key={m.id}
                      variant={selectedMarketId === m.id ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setSelectedMarketId(m.id)}
                    >
                      {m.question.slice(0, 60)}
                      {m.question.length > 60 ? "..." : ""}
                      <Badge variant="secondary" className="ml-2">
                        {formatPercent(m.yesPrice, 0)}
                      </Badge>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedMarket && (
            <>
              <PriceChart
                data={priceHistory ?? []}
                isLoading={priceLoading}
                title={`Price History: ${selectedMarket.question}`}
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <StabilizationView result={stabilization} />
                {timeBuckets.length > 0 && (
                  <TimeBucketsView buckets={timeBuckets} />
                )}
              </div>
            </>
          )}

          <EconomicEventsView events={UPCOMING_EVENTS} />
        </>
      )}
    </div>
  );
}
