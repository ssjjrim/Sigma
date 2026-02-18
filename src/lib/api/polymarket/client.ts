import { PolymarketGammaMarket, PolymarketGammaEvent } from "./types";

const GAMMA_PROXY = "/api/proxy/polymarket";

export async function fetchGammaMarkets(
  params: Record<string, string> = {}
): Promise<PolymarketGammaMarket[]> {
  const searchParams = new URLSearchParams({
    active: "true",
    closed: "false",
    archived: "false",
    order: "volumeNum",
    ascending: "false",
    limit: "100",
    ...params,
  });
  const res = await fetch(`${GAMMA_PROXY}?endpoint=markets&${searchParams}`);
  if (!res.ok) throw new Error(`Gamma markets: ${res.status}`);
  return res.json();
}

export async function fetchGammaEvents(
  params: Record<string, string> = {}
): Promise<PolymarketGammaEvent[]> {
  const searchParams = new URLSearchParams({
    active: "true",
    closed: "false",
    archived: "false",
    order: "volume24hr",
    ascending: "false",
    limit: "50",
    ...params,
  });
  const res = await fetch(`${GAMMA_PROXY}?endpoint=events&${searchParams}`);
  if (!res.ok) throw new Error(`Gamma events: ${res.status}`);
  return res.json();
}

export async function searchGammaMarkets(
  query: string
): Promise<PolymarketGammaMarket[]> {
  return fetchGammaMarkets({ _q: query });
}
