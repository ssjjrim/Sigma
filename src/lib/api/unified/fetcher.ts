import { UnifiedMarket, Platform, PlatformStatus } from "@/types/market";
import { fetchGammaEvents } from "../polymarket/client";
import { normalizePolymarketEvent } from "../polymarket/normalize";
import { fetchKalshiMarkets } from "../kalshi/client";
import { normalizeKalshiMarket } from "../kalshi/normalize";
import { fetchManifoldMarkets } from "../manifold/client";
import { normalizeManifoldMarket } from "../manifold/normalize";
import { fetchOpinionTopics } from "../opinion/client";
import { normalizeOpinionTopics } from "../opinion/normalize";

export async function fetchAllMarkets(): Promise<{
  markets: UnifiedMarket[];
  statuses: PlatformStatus[];
}> {
  const results = await Promise.allSettled([
    fetchPolymarketNormalized(),
    fetchKalshiNormalized(),
    fetchManifoldNormalized(),
    fetchOpinionNormalized(),
  ]);

  const markets: UnifiedMarket[] = [];
  const statuses: PlatformStatus[] = [];

  const platforms: Platform[] = ["polymarket", "kalshi", "manifold", "opinion"];

  results.forEach((result, idx) => {
    const platform = platforms[idx];
    if (result.status === "fulfilled") {
      markets.push(...result.value);
      statuses.push({
        platform,
        connected: true,
        marketCount: result.value.length,
        totalVolume: result.value.reduce((sum, m) => sum + m.volume, 0),
        lastChecked: new Date().toISOString(),
      });
    } else {
      statuses.push({
        platform,
        connected: false,
        marketCount: 0,
        totalVolume: 0,
        lastChecked: new Date().toISOString(),
        error: result.reason?.message || "Unknown error",
      });
    }
  });

  return { markets, statuses };
}

async function fetchPolymarketNormalized(): Promise<UnifiedMarket[]> {
  const events = await fetchGammaEvents();
  return events
    .map(normalizePolymarketEvent)
    .filter((m): m is UnifiedMarket => m !== null && m.yesPrice > 0.02 && m.yesPrice < 0.98);
}

async function fetchKalshiNormalized(): Promise<UnifiedMarket[]> {
  const data = await fetchKalshiMarkets();
  return (data.markets || [])
    .map(normalizeKalshiMarket)
    .filter((m) => m.yesPrice > 0.02 && m.yesPrice < 0.98 && (m.volume > 0 || m.liquidity > 0));
}

async function fetchManifoldNormalized(): Promise<UnifiedMarket[]> {
  const markets = await fetchManifoldMarkets();
  return markets
    .map(normalizeManifoldMarket)
    .filter((m) => m.yesPrice > 0.02 && m.yesPrice < 0.98);
}

async function fetchOpinionNormalized(): Promise<UnifiedMarket[]> {
  const topics = await fetchOpinionTopics();
  return normalizeOpinionTopics(topics).filter(
    (m) => m.yesPrice > 0.02 && m.yesPrice < 0.98
  );
}

export function getHotMarkets(
  markets: UnifiedMarket[],
  platform?: Platform,
  limit = 5
): UnifiedMarket[] {
  let filtered = markets;
  if (platform) filtered = markets.filter((m) => m.platform === platform);
  return [...filtered]
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, limit);
}

/**
 * Get a diverse mix of markets across platforms, sorted by volume24h.
 * Ensures at least `minPerPlatform` markets from each active platform.
 */
export function getDiverseMarkets(
  markets: UnifiedMarket[],
  limit = 5,
  minPerPlatform = 1
): UnifiedMarket[] {
  const result: UnifiedMarket[] = [];
  const used = new Set<string>();

  // First pass: pick top market from each platform
  const platforms = [...new Set(markets.map((m) => m.platform))];
  for (const p of platforms) {
    const top = markets
      .filter((m) => m.platform === p && m.volume24h > 0)
      .sort((a, b) => b.volume24h - a.volume24h);
    for (let i = 0; i < Math.min(minPerPlatform, top.length); i++) {
      result.push(top[i]);
      used.add(top[i].id);
    }
  }

  // Fill remaining slots by volume24h
  const rest = [...markets]
    .filter((m) => !used.has(m.id) && m.volume24h > 0)
    .sort((a, b) => b.volume24h - a.volume24h);
  for (const m of rest) {
    if (result.length >= limit) break;
    result.push(m);
  }

  return result.sort((a, b) => b.volume24h - a.volume24h).slice(0, limit);
}

export function getMarketMovers(
  markets: UnifiedMarket[],
  limit = 10
): UnifiedMarket[] {
  return [...markets]
    .filter((m) => m.volume24h > 0)
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, limit);
}
