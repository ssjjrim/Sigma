import { UnifiedMarket } from "@/types/market";
import { KalshiMarket } from "./types";

export function normalizeKalshiMarket(m: KalshiMarket): UnifiedMarket {
  // Kalshi prices are in cents (0-100), convert to decimal (0-1)
  const yesPrice = m.yes_bid > 0 ? m.yes_bid / 100 : m.last_price / 100;
  const noPrice = m.no_bid > 0 ? m.no_bid / 100 : 1 - yesPrice;

  // Kalshi volume is in number of contracts (each contract = $1)
  // volume_24h is also in contracts
  const volume = m.volume || 0;
  const volume24h = m.volume_24h || 0;

  // Kalshi liquidity is in cents, convert to dollars
  const liquidity = (m.liquidity || 0) / 100;

  // Bid-ask spread in decimal
  const bidAskSpread = Math.abs((m.yes_ask - m.yes_bid) / 100);

  let status: "active" | "closed" | "resolved" = "active";
  if (m.status === "closed" || m.status === "settled") status = "closed";
  if (m.result) status = "resolved";

  return {
    id: `kalshi-${m.ticker}`,
    platform: "kalshi",
    platformId: m.ticker,
    question: m.title,
    description: m.subtitle || "",
    category: m.category || "Other",
    status,
    yesPrice,
    noPrice,
    spread: bidAskSpread,
    volume,
    volume24h,
    liquidity,
    endDate: m.close_time || m.expiration_time || null,
    imageUrl: null,
    url: `https://kalshi.com/browse?search=${encodeURIComponent(m.title)}`,
    lastUpdated: new Date().toISOString(),
    outcomes: [
      { name: "Yes", price: yesPrice },
      { name: "No", price: noPrice },
    ],
  };
}
