"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllMarkets } from "@/lib/api/unified/fetcher";
import { UnifiedMarket, Platform, PlatformStatus } from "@/types/market";

export function useMarkets() {
  return useQuery({
    queryKey: ["markets"],
    queryFn: fetchAllMarkets,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useFilteredMarkets(filters: {
  platforms?: Platform[];
  status?: string;
  category?: string;
  search?: string;
}) {
  const { data, ...rest } = useMarkets();

  const filtered =
    data?.markets.filter((m) => {
      if (filters.platforms?.length && !filters.platforms.includes(m.platform))
        return false;
      if (filters.status && m.status !== filters.status) return false;
      if (filters.category && m.category !== filters.category) return false;
      if (
        filters.search &&
        !m.question.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    }) ?? [];

  return { ...rest, markets: filtered, statuses: data?.statuses ?? [] };
}

export function usePlatformStatuses(): PlatformStatus[] {
  const { data } = useMarkets();
  return data?.statuses ?? [];
}

export function useMarketById(id: string): UnifiedMarket | undefined {
  const { data } = useMarkets();
  return data?.markets.find((m) => m.id === id);
}
