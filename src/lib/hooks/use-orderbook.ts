"use client";

import { useQuery } from "@tanstack/react-query";
import { Orderbook, Platform } from "@/types/market";
import { fetchCLOBBook } from "@/lib/api/polymarket/clob";
import { fetchKalshiOrderbook } from "@/lib/api/kalshi/client";

export function useOrderbook(
  platform: Platform,
  tokenIdOrTicker: string | undefined
) {
  return useQuery<Orderbook>({
    queryKey: ["orderbook", platform, tokenIdOrTicker],
    queryFn: async () => {
      if (!tokenIdOrTicker)
        return { bids: [], asks: [], spread: 0, midPrice: 0 };

      if (platform === "polymarket") {
        const book = await fetchCLOBBook(tokenIdOrTicker);
        const bids = (book.bids || []).map((b) => ({
          price: parseFloat(b.price),
          size: parseFloat(b.size),
        }));
        const asks = (book.asks || []).map((a) => ({
          price: parseFloat(a.price),
          size: parseFloat(a.size),
        }));
        const bestBid = bids[0]?.price ?? 0;
        const bestAsk = asks[0]?.price ?? 1;
        return {
          bids,
          asks,
          spread: bestAsk - bestBid,
          midPrice: (bestBid + bestAsk) / 2,
        };
      }

      if (platform === "kalshi") {
        const data = await fetchKalshiOrderbook(tokenIdOrTicker);
        const bids = (data.orderbook?.yes || []).map(([price, size]) => ({
          price: price / 100,
          size,
        }));
        const asks = (data.orderbook?.no || []).map(([price, size]) => ({
          price: price / 100,
          size,
        }));
        const bestBid = bids[0]?.price ?? 0;
        const bestAsk = asks[0]?.price ?? 1;
        return {
          bids,
          asks,
          spread: bestAsk - bestBid,
          midPrice: (bestBid + bestAsk) / 2,
        };
      }

      return { bids: [], asks: [], spread: 0, midPrice: 0 };
    },
    enabled: !!tokenIdOrTicker,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
