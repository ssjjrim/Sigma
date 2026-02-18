import { PricePoint } from "@/types/market";
import { StabilizationResult, TimeBucket } from "@/types/analytics";

export function detectStabilization(
  prices: PricePoint[],
  windowSize = 20
): StabilizationResult {
  if (prices.length < windowSize) {
    return {
      isStabilized: false,
      confidence: 0,
      volatility: 1,
      proximity: 0,
      factors: { lowVolatility: false, highConfidence: false, nearBoundary: false },
    };
  }

  const recent = prices.slice(-windowSize);
  const recentPrices = recent.map((p) => p.price);

  const volatility = calculateVolatility(recentPrices);
  const lastPrice = recentPrices[recentPrices.length - 1];
  const confidence = Math.max(lastPrice, 1 - lastPrice);
  const proximity = Math.min(Math.abs(lastPrice - 0), Math.abs(lastPrice - 1));

  const lowVolatility = volatility < 0.02;
  const highConfidence = confidence > 0.85;
  const nearBoundary = proximity < 0.15;

  const factorCount = [lowVolatility, highConfidence, nearBoundary].filter(Boolean).length;
  const isStabilized = factorCount >= 2;

  return {
    isStabilized,
    confidence,
    volatility,
    proximity,
    factors: { lowVolatility, highConfidence, nearBoundary },
  };
}

export function calculateTimeBuckets(prices: PricePoint[]): TimeBucket[] {
  const buckets: { label: string; days: number }[] = [
    { label: "1D", days: 1 },
    { label: "3D", days: 3 },
    { label: "1W", days: 7 },
    { label: "2W", days: 14 },
    { label: "1M", days: 30 },
  ];

  const now = Date.now();

  return buckets.map(({ label, days }) => {
    const cutoff = now - days * 86400000;
    const filtered = prices.filter((p) => p.timestamp * 1000 >= cutoff);
    const priceValues = filtered.map((p) => p.price);

    if (priceValues.length === 0) {
      return { label, days, avgPrice: 0, volatility: 0, priceChange: 0, sampleCount: 0 };
    }

    const avg = priceValues.reduce((s, p) => s + p, 0) / priceValues.length;
    const vol = calculateVolatility(priceValues);
    const change = priceValues.length > 1
      ? priceValues[priceValues.length - 1] - priceValues[0]
      : 0;

    return { label, days, avgPrice: avg, volatility: vol, priceChange: change, sampleCount: priceValues.length };
  });
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }
  if (returns.length === 0) return 0;
  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance);
}
