import { UnifiedMarket } from "@/types/market";
import { PolymarketGammaMarket, PolymarketGammaEvent } from "./types";

function parseMarketPrices(m: PolymarketGammaMarket): {
  yesPrice: number;
  noPrice: number;
  tokenIds: string[];
} {
  let prices: number[] = [];
  try {
    const raw = JSON.parse(m.outcomePrices || "[]");
    prices = raw.map(Number);
  } catch {
    prices = [];
  }

  let tokenIds: string[] = [];
  try {
    tokenIds = JSON.parse(m.clobTokenIds || "[]");
  } catch {
    tokenIds = [];
  }

  const yesPrice = prices[0] ?? 0.5;
  const noPrice = prices[1] ?? 1 - yesPrice;
  return { yesPrice, noPrice, tokenIds };
}

export function normalizePolymarketMarket(
  m: PolymarketGammaMarket
): UnifiedMarket {
  const { yesPrice, noPrice, tokenIds } = parseMarketPrices(m);

  return {
    id: `polymarket-${m.id}`,
    platform: "polymarket",
    platformId: m.id,
    question: m.question,
    description: m.description || "",
    category: m.category || "Other",
    status: m.closed ? "closed" : m.active ? "active" : "resolved",
    yesPrice,
    noPrice,
    spread: m.spread > 0 ? m.spread / 100 : Math.abs(1 - (yesPrice + noPrice)),
    volume: parseFloat(m.volume) || 0,
    volume24h: Number(m.volume24hr) || 0,
    liquidity: parseFloat(m.liquidity) || 0,
    endDate: m.endDate || null,
    imageUrl: m.image || null,
    url: `https://polymarket.com/event/${m.slug}`,
    lastUpdated: new Date().toISOString(),
    outcomes: [
      { name: "Yes", price: yesPrice, tokenId: tokenIds[0] },
      { name: "No", price: noPrice, tokenId: tokenIds[1] },
    ],
  };
}

/**
 * Normalize a Polymarket event into a UnifiedMarket.
 * For multi-outcome (negRisk) events, picks the leading outcome.
 * For single-market events, uses that market directly.
 */
export function normalizePolymarketEvent(
  event: PolymarketGammaEvent
): UnifiedMarket | null {
  const markets = event.markets || [];
  if (markets.length === 0) return null;

  // For single-market events, just use that market
  if (markets.length === 1) {
    const m = markets[0];
    const result = normalizePolymarketMarket(m);
    // Use event-level data for better URL and image
    result.url = `https://polymarket.com/event/${event.slug}`;
    result.imageUrl = event.image || m.image || null;
    result.volume24h = event.volume24hr || result.volume24h;
    return result;
  }

  // For multi-outcome events (negRisk), pick the leading outcome
  // The "leading" market is the one with the highest yes price (most likely outcome)
  let bestMarket: PolymarketGammaMarket | null = null;
  let bestYesPrice = -1;

  for (const m of markets) {
    // Skip archived/closed/inactive markets
    if (m.archived || m.closed || !m.active) continue;
    const { yesPrice } = parseMarketPrices(m);
    // Skip extreme prices (resolved or near-zero legs)
    if (yesPrice > 0.02 && yesPrice < 0.99 && yesPrice > bestYesPrice) {
      bestYesPrice = yesPrice;
      bestMarket = m;
    }
  }

  // If no market in reasonable range, try the one with highest volume (still active)
  if (!bestMarket) {
    let bestVol = -1;
    for (const m of markets) {
      if (m.archived || m.closed) continue;
      const vol = parseFloat(m.volume) || 0;
      if (vol > bestVol) {
        bestVol = vol;
        bestMarket = m;
      }
    }
  }

  if (!bestMarket) return null;

  const { yesPrice, noPrice, tokenIds } = parseMarketPrices(bestMarket);

  // Use event title for multi-outcome events, market question for the subtitle
  const isMultiOutcome = event.negRisk && markets.length > 2;
  const question = isMultiOutcome
    ? `${event.title} → ${bestMarket.groupItemTitle || bestMarket.question}`
    : bestMarket.question;

  return {
    id: `polymarket-${bestMarket.id}`,
    platform: "polymarket",
    platformId: bestMarket.id,
    question,
    description: event.description || bestMarket.description || "",
    category: bestMarket.category || "Other",
    status: bestMarket.closed ? "closed" : bestMarket.active ? "active" : "resolved",
    yesPrice,
    noPrice,
    spread: bestMarket.spread > 0 ? bestMarket.spread / 100 : Math.abs(1 - (yesPrice + noPrice)),
    volume: parseFloat(event.volume) || 0,
    volume24h: event.volume24hr || Number(bestMarket.volume24hr) || 0,
    liquidity: parseFloat(event.liquidity) || 0,
    endDate: event.endDate || bestMarket.endDate || null,
    imageUrl: event.image || bestMarket.image || null,
    url: `https://polymarket.com/event/${event.slug}`,
    lastUpdated: new Date().toISOString(),
    outcomes: [
      { name: "Yes", price: yesPrice, tokenId: tokenIds[0] },
      { name: "No", price: noPrice, tokenId: tokenIds[1] },
    ],
  };
}
