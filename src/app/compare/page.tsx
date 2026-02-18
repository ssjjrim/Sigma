"use client";

import { useMemo } from "react";
import { useMarkets } from "@/lib/hooks/use-markets";
import { matchMarketsAcrossPlatforms, findArbitrageOpportunities } from "@/lib/api/unified/matcher";
import { MatchedMarketsView } from "@/components/compare/matched-markets";
import { Skeleton } from "@/components/ui/skeleton";

export default function ComparePage() {
  const { data, isLoading } = useMarkets();

  const { matches, arbitrage } = useMemo(() => {
    if (!data?.markets.length) return { matches: [], arbitrage: [] };
    const matched = matchMarketsAcrossPlatforms(data.markets);
    const arb = findArbitrageOpportunities(matched);
    return { matches: matched, arbitrage: arb };
  }, [data?.markets]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Cross-Platform Comparison</h1>
        <p className="text-sm text-muted-foreground">
          Find matching markets across platforms and detect price gaps
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <MatchedMarketsView matches={matches} arbitrageOps={arbitrage} />
      )}
    </div>
  );
}
