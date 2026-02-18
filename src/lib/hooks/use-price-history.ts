"use client";

import { useQuery } from "@tanstack/react-query";
import { PricePoint } from "@/types/market";
import { fetchCLOBPriceHistory } from "@/lib/api/polymarket/clob";

export function usePriceHistory(tokenId: string | undefined) {
  return useQuery<PricePoint[]>({
    queryKey: ["price-history", tokenId],
    queryFn: async () => {
      if (!tokenId) return [];
      const data = await fetchCLOBPriceHistory(tokenId);
      return (data.history || []).map((p) => ({
        timestamp: p.t,
        price: p.p,
      }));
    },
    enabled: !!tokenId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
