import { PricePoint, UnifiedMarket } from "@/types/market";
import { VolatilityMetrics, SpreadAnalysis } from "@/types/analytics";

export function calculateRollingVolatility(
  prices: PricePoint[],
  windowDays = 7
): number {
  const cutoff = Date.now() - windowDays * 86400000;
  const recent = prices.filter((p) => p.timestamp * 1000 >= cutoff);
  if (recent.length < 2) return 0;

  const returns: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    if (recent[i - 1].price > 0) {
      returns.push(
        (recent[i].price - recent[i - 1].price) / recent[i - 1].price
      );
    }
  }

  if (returns.length === 0) return 0;
  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance =
    returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance);
}

export function calculateShannonEntropy(prices: PricePoint[]): number {
  if (prices.length === 0) return 0;

  const bins = 10;
  const counts = new Array(bins).fill(0);
  const total = prices.length;

  for (const p of prices) {
    const bin = Math.min(Math.floor(p.price * bins), bins - 1);
    counts[bin]++;
  }

  let entropy = 0;
  for (const count of counts) {
    if (count > 0) {
      const prob = count / total;
      entropy -= prob * Math.log2(prob);
    }
  }

  return entropy;
}

export function calculateMaxDrawdown(prices: PricePoint[]): number {
  if (prices.length < 2) return 0;

  let peak = prices[0].price;
  let maxDrawdown = 0;

  for (const p of prices) {
    if (p.price > peak) peak = p.price;
    const drawdown = peak > 0 ? (peak - p.price) / peak : 0;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  return maxDrawdown;
}

export function analyzeVolatility(
  market: UnifiedMarket,
  prices: PricePoint[]
): VolatilityMetrics {
  return {
    market,
    rolling7dVol: calculateRollingVolatility(prices, 7),
    shannonEntropy: calculateShannonEntropy(prices),
    maxDrawdown: calculateMaxDrawdown(prices),
  };
}

export function analyzeSpread(market: UnifiedMarket): SpreadAnalysis {
  // Use the complement gap as spread (1 - yes - no).
  // For Polymarket this is ~0 since yes+no=1.
  // As a more useful metric, estimate implied spread from price distance to extremes.
  // Markets near 50/50 have wider effective spreads; markets near 0/100 have tighter ones.
  const complementGap = Math.abs(1 - (market.yesPrice + market.noPrice));
  // Implied spread: use complement gap if non-zero, otherwise estimate from
  // the min of (yesPrice, noPrice) as a proxy for market tightness.
  // Markets with low liquidity relative to volume also have wider effective spreads.
  const liquidityRatio = market.volume > 0 ? market.liquidity / market.volume : 0;
  const impliedSpread = complementGap > 0.001
    ? complementGap
    : Math.min(market.yesPrice, market.noPrice) * (1 - Math.min(liquidityRatio, 1)) * 0.1;

  return {
    market,
    bidAskSpread: impliedSpread,
    spreadPercent:
      market.yesPrice > 0 ? impliedSpread / market.yesPrice : 0,
    rank: 0,
  };
}

export function rankBySpread(markets: UnifiedMarket[]): SpreadAnalysis[] {
  const analyses = markets.map(analyzeSpread);
  analyses.sort((a, b) => b.bidAskSpread - a.bidAskSpread);
  return analyses.map((a, i) => ({ ...a, rank: i + 1 }));
}
