import {
  PolymarketCLOBPriceHistory,
  PolymarketCLOBBook,
  PolymarketCLOBPrice,
} from "./types";

const CLOB_BASE = "https://clob.polymarket.com";

export async function fetchCLOBPriceHistory(
  tokenId: string,
  fidelity = 60
): Promise<PolymarketCLOBPriceHistory> {
  const res = await fetch(
    `${CLOB_BASE}/prices-history?market=${tokenId}&interval=max&fidelity=${fidelity}`
  );
  if (!res.ok) throw new Error(`CLOB price history: ${res.status}`);
  return res.json();
}

export async function fetchCLOBBook(tokenId: string): Promise<PolymarketCLOBBook> {
  const res = await fetch(`${CLOB_BASE}/book?token_id=${tokenId}`);
  if (!res.ok) throw new Error(`CLOB book: ${res.status}`);
  return res.json();
}

export async function fetchCLOBPrice(tokenId: string): Promise<PolymarketCLOBPrice> {
  const res = await fetch(`${CLOB_BASE}/price?token_id=${tokenId}&side=buy`);
  if (!res.ok) throw new Error(`CLOB price: ${res.status}`);
  return res.json();
}

export async function fetchCLOBMarkets(
  nextCursor?: string
): Promise<{ data: Array<{ condition_id: string; tokens: Array<{ token_id: string; outcome: string }> }>; next_cursor: string }> {
  const url = nextCursor
    ? `${CLOB_BASE}/markets?next_cursor=${nextCursor}`
    : `${CLOB_BASE}/markets`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CLOB markets: ${res.status}`);
  return res.json();
}
