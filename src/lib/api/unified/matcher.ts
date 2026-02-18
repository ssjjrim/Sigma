import { UnifiedMarket } from "@/types/market";
import { MatchedMarket, ArbitrageOpportunity } from "@/types/analytics";
import { stringSimilarity } from "@/lib/utils/string-similarity";

const SIMILARITY_THRESHOLD = 0.6;

export function matchMarketsAcrossPlatforms(
  markets: UnifiedMarket[]
): MatchedMarket[] {
  const groups: Map<string, UnifiedMarket[]> = new Map();
  const assigned = new Set<string>();

  const sorted = [...markets].sort((a, b) => b.volume - a.volume);

  for (const market of sorted) {
    if (assigned.has(market.id)) continue;

    const group: UnifiedMarket[] = [market];
    assigned.add(market.id);

    for (const candidate of sorted) {
      if (assigned.has(candidate.id)) continue;
      if (candidate.platform === market.platform) continue;

      const sim = stringSimilarity(market.question, candidate.question);
      if (sim >= SIMILARITY_THRESHOLD) {
        group.push(candidate);
        assigned.add(candidate.id);
      }
    }

    if (group.length > 1) {
      const key = market.question.toLowerCase().slice(0, 50);
      groups.set(key, group);
    }
  }

  return Array.from(groups.entries()).map(([, mkts]) => {
    const prices = mkts.map((m) => m.yesPrice);
    const maxDiff = Math.max(...prices) - Math.min(...prices);
    return {
      question: mkts[0].question,
      markets: mkts,
      similarity: mkts.length > 1
        ? stringSimilarity(mkts[0].question, mkts[1].question)
        : 1,
      maxPriceDiff: maxDiff,
    };
  });
}

export function findArbitrageOpportunities(
  matched: MatchedMarket[]
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  for (const match of matched) {
    for (let i = 0; i < match.markets.length; i++) {
      for (let j = i + 1; j < match.markets.length; j++) {
        const a = match.markets[i];
        const b = match.markets[j];
        // Only compare across different platforms
        if (a.platform === b.platform) continue;
        const diff = Math.abs(a.yesPrice - b.yesPrice);
        const avgPrice = (a.yesPrice + b.yesPrice) / 2;
        const diffPercent = avgPrice > 0 ? diff / avgPrice : 0;

        if (diff > 0.02) {
          // Arbitrage: buy YES where cheaper, buy NO on the other platform
          // Use actual noPrice (not theoretical 1-yes) to account for spread
          const cheaperYes = a.yesPrice < b.yesPrice ? a : b;
          const otherMarket = cheaperYes === a ? b : a;
          const arbCost = cheaperYes.yesPrice + otherMarket.noPrice;
          const hasArb = arbCost < 1;
          const arbROI = hasArb ? (1 - arbCost) / arbCost : 0;

          opportunities.push({
            marketA: a,
            marketB: b,
            priceDiff: diff,
            priceDiffPercent: diffPercent,
            gapSize:
              diffPercent < 0.05
                ? "small"
                : diffPercent < 0.1
                  ? "medium"
                  : "large",
            direction:
              a.yesPrice > b.yesPrice
                ? `${b.platform} → ${a.platform}`
                : `${a.platform} → ${b.platform}`,
            arbCost,
            arbROI,
            hasArb,
          });
        }
      }
    }
  }

  return opportunities.sort((a, b) => b.priceDiff - a.priceDiff);
}
