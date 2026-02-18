"use client";

import { useState } from "react";
import { Platform } from "@/types/market";
import { useFilteredMarkets } from "@/lib/hooks/use-markets";
import { MarketTable } from "@/components/markets/market-table";
import { Skeleton } from "@/components/ui/skeleton";

export type ViewMode = "list" | "grid";

export default function MarketsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([
    "polymarket",
    "kalshi",
    "manifold",
    "opinion",
  ]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const { markets, isLoading } = useFilteredMarkets({ platforms, search });

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Market Explorer</h1>
        <p className="text-sm text-muted-foreground">
          Browse and search prediction markets across all platforms
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <MarketTable
          markets={markets}
          platforms={platforms}
          onTogglePlatform={togglePlatform}
          search={search}
          onSearchChange={setSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}
    </div>
  );
}
