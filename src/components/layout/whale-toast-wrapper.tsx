"use client";

import { useMarkets } from "@/lib/hooks/use-markets";
import { WhaleToastProvider } from "@/components/dashboard/whale-toast";

export function WhaleToastWrapper() {
  const { data } = useMarkets();
  const markets = data?.markets ?? [];

  if (markets.length === 0) return null;

  return <WhaleToastProvider markets={markets} />;
}
