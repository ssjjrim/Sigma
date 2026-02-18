"use client";

import { useMarkets } from "@/lib/hooks/use-markets";
import { SpreadAnalysisView } from "@/components/risk/spread-analysis";
import { HedgingCalculator } from "@/components/risk/hedging-calculator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RiskPage() {
  const { data, isLoading } = useMarkets();
  const markets = data?.markets ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Risk Assessment</h1>
        <p className="text-sm text-muted-foreground">
          Analyze spreads, volatility, and calculate hedging strategies
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <Tabs defaultValue="spread">
          <TabsList>
            <TabsTrigger value="spread">Spread Analysis</TabsTrigger>
            <TabsTrigger value="hedging">Hedging Calculator</TabsTrigger>
          </TabsList>

          <TabsContent value="spread" className="mt-4">
            <SpreadAnalysisView markets={markets} />
          </TabsContent>

          <TabsContent value="hedging" className="mt-4">
            <HedgingCalculator markets={markets} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
