import { ManifoldMarket } from "./types";

const MANIFOLD_API = "https://api.manifold.markets/v0";

export async function fetchManifoldMarkets(): Promise<ManifoldMarket[]> {
  // Use search endpoint to get active binary markets sorted by liquidity
  const res = await fetch(
    `${MANIFOLD_API}/search-markets?sort=liquidity&filter=open&limit=50&contractType=BINARY`
  );
  if (!res.ok) throw new Error(`Manifold markets: ${res.status}`);
  return res.json();
}

export async function fetchManifoldMarket(
  id: string
): Promise<ManifoldMarket> {
  const res = await fetch(`${MANIFOLD_API}/market/${id}`);
  if (!res.ok) throw new Error(`Manifold market ${id}: ${res.status}`);
  return res.json();
}

export async function searchManifoldMarkets(
  term: string,
  limit = 20
): Promise<ManifoldMarket[]> {
  const res = await fetch(
    `${MANIFOLD_API}/search-markets?term=${encodeURIComponent(term)}&sort=liquidity&filter=open&limit=${limit}&contractType=BINARY`
  );
  if (!res.ok) throw new Error(`Manifold search: ${res.status}`);
  return res.json();
}
