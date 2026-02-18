"use client";

import { useMarkets } from "@/lib/hooks/use-markets";
import { PlatformStatusCards } from "@/components/dashboard/platform-status";
import { HotMarkets } from "@/components/dashboard/hot-markets";
import { AggregateStats } from "@/components/dashboard/aggregate-stats";
import { WhaleTracker } from "@/components/dashboard/whale-tracker";
import { PortfolioWatcher } from "@/components/dashboard/portfolio-watcher";
import { WatchlistSection } from "@/components/dashboard/watchlist-section";
import { getHotMarkets, getDiverseMarkets } from "@/lib/api/unified/fetcher";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data, isLoading } = useMarkets();

  const markets = data?.markets ?? [];
  const statuses = data?.statuses ?? [];
  const trendingMarkets = getHotMarkets(markets, undefined, 5);
  const trendingIds = new Set(trendingMarkets.map((m) => m.id));
  const remainingMarkets = markets.filter((m) => !trendingIds.has(m.id));
  const diverseMarkets = getDiverseMarkets(remainingMarkets, 5, 2);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Cross-platform prediction market analytics
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <PlatformStatusCards statuses={statuses} />
          <AggregateStats markets={markets} />
          <div className="grid gap-6 lg:grid-cols-2">
            <HotMarkets markets={trendingMarkets} title="Trending Markets" viewAllHref="/markets" />
            <HotMarkets markets={diverseMarkets} title="Cross-Platform Picks" viewAllHref="/compare" />
          </div>
          <WatchlistSection />
          <div className="grid gap-6 lg:grid-cols-2">
            <WhaleTracker markets={markets} />
            <PortfolioWatcher />
          </div>
        </>
      )}
    </div>
  );
}
