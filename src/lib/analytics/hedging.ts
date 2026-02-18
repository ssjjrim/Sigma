import { UnifiedMarket, Platform } from "@/types/market";
import { HedgePosition, HedgeResult } from "@/types/analytics";

export function calculateEqualWeightHedge(
  markets: UnifiedMarket[],
  totalBudget: number
): HedgeResult {
  if (markets.length === 0) {
    return emptyResult();
  }

  const perMarket = totalBudget / markets.length;
  const positions: HedgePosition[] = markets.map((m) => ({
    market: m,
    platform: m.platform,
    side: "yes" as const,
    weight: 1 / markets.length,
    amount: perMarket,
  }));

  return computeResult(positions, totalBudget);
}

export function calculateProbWeightedHedge(
  markets: UnifiedMarket[],
  totalBudget: number
): HedgeResult {
  if (markets.length === 0) {
    return emptyResult();
  }

  const totalInverseProb = markets.reduce(
    (sum, m) => sum + (1 - m.yesPrice),
    0
  );

  const positions: HedgePosition[] = markets.map((m) => {
    const weight =
      totalInverseProb > 0 ? (1 - m.yesPrice) / totalInverseProb : 1 / markets.length;
    return {
      market: m,
      platform: m.platform as Platform,
      side: "yes" as const,
      weight,
      amount: totalBudget * weight,
    };
  });

  return computeResult(positions, totalBudget);
}

function computeResult(
  positions: HedgePosition[],
  totalCost: number
): HedgeResult {
  const expectedPayout = positions.reduce(
    (sum, p) => sum + (p.amount / p.market.yesPrice) * p.market.yesPrice,
    0
  );

  const profitIfYes = positions.reduce(
    (sum, p) =>
      sum + (p.side === "yes" ? p.amount / p.market.yesPrice - p.amount : -p.amount),
    0
  );

  const profitIfNo = positions.reduce(
    (sum, p) =>
      sum + (p.side === "yes" ? -p.amount : p.amount / p.market.noPrice - p.amount),
    0
  );

  return {
    positions,
    totalCost,
    expectedPayout,
    maxLoss: Math.min(profitIfYes, profitIfNo),
    profitIfYes,
    profitIfNo,
  };
}

function emptyResult(): HedgeResult {
  return {
    positions: [],
    totalCost: 0,
    expectedPayout: 0,
    maxLoss: 0,
    profitIfYes: 0,
    profitIfNo: 0,
  };
}
