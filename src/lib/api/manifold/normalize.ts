import { UnifiedMarket } from "@/types/market";
import { ManifoldMarket } from "./types";

export function normalizeManifoldMarket(m: ManifoldMarket): UnifiedMarket {
  const yesPrice = m.probability ?? 0.5;
  const noPrice = 1 - yesPrice;

  let status: "active" | "closed" | "resolved" = "active";
  if (m.isResolved) {
    status = "resolved";
  } else if (m.closeTime && m.closeTime < Date.now()) {
    status = "closed";
  }

  return {
    id: `manifold-${m.id}`,
    platform: "manifold",
    platformId: m.id,
    question: m.question,
    description: m.textDescription || "",
    category: "Other",
    status,
    yesPrice,
    noPrice,
    spread: Math.abs(yesPrice - noPrice),
    volume: m.volume || 0,
    volume24h: m.volume24Hours || 0,
    liquidity: m.totalLiquidity || 0,
    endDate: m.closeTime ? new Date(m.closeTime).toISOString() : null,
    imageUrl: m.coverImageUrl || null,
    url: m.url,
    lastUpdated: new Date(m.lastUpdatedTime).toISOString(),
    outcomes: [
      { name: "Yes", price: yesPrice },
      { name: "No", price: noPrice },
    ],
  };
}
