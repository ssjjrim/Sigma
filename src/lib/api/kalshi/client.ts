import { KalshiMarketsResponse, KalshiEventsResponse, KalshiOrderbook, KalshiMarket } from "./types";

const KALSHI_PROXY = "/api/proxy/kalshi";

export async function fetchKalshiMarkets(
  params: Record<string, string> = {}
): Promise<KalshiMarketsResponse> {
  // Fetch multiple pages from Kalshi events API to get active markets
  // The API sorts by creation date by default, so active markets are scattered
  const eventMap = new Map<string, { event_title: string; category: string; markets: KalshiMarket[] }>();
  let cursor = "";
  const maxPages = 3;

  for (let page = 0; page < maxPages; page++) {
    const searchParams = new URLSearchParams({
      limit: "100",
      status: "open",
      with_nested_markets: "true",
      ...params,
    });
    if (cursor) searchParams.set("cursor", cursor);

    const res = await fetch(`${KALSHI_PROXY}?endpoint=events&${searchParams}`);
    if (!res.ok) throw new Error(`Kalshi markets: ${res.status}`);
    const data: KalshiEventsResponse = await res.json();

    for (const event of data.events || []) {
      const eventTicker = event.event_ticker;
      if (!eventMap.has(eventTicker)) {
        eventMap.set(eventTicker, {
          event_title: event.title,
          category: event.category || "",
          markets: [],
        });
      }
      const entry = eventMap.get(eventTicker)!;
      for (const market of event.markets || []) {
        entry.markets.push({
          ...market,
          category: event.category || market.category || "",
        });
      }
    }

    cursor = data.cursor || "";
    if (!cursor) break;
  }

  // For each event, pick the best representative market
  // (highest yes_bid between 5-95 cents, or highest volume if none in range)
  const representativeMarkets: KalshiMarket[] = [];

  for (const [, entry] of eventMap) {
    const markets = entry.markets;
    if (markets.length === 0) continue;

    // For single-market events, just use that market
    if (markets.length === 1) {
      representativeMarkets.push(markets[0]);
      continue;
    }

    // For multi-market events, pick the leading outcome
    let best: KalshiMarket | null = null;
    let bestPrice = -1;

    for (const m of markets) {
      const price = m.yes_bid > 0 ? m.yes_bid : m.last_price;
      if (price > 5 && price < 95 && price > bestPrice) {
        bestPrice = price;
        best = m;
      }
    }

    // Fallback: pick highest volume market
    if (!best) {
      let bestVol = -1;
      for (const m of markets) {
        if (m.volume > bestVol) {
          bestVol = m.volume;
          best = m;
        }
      }
    }

    if (best) {
      // Attach event title for better display
      const isMultiOutcome = markets.length > 2;
      if (isMultiOutcome) {
        best = { ...best, title: `${entry.event_title} → ${best.title}` };
      }
      representativeMarkets.push(best);
    }
  }

  return { markets: representativeMarkets, cursor };
}

export async function fetchKalshiEvents(
  params: Record<string, string> = {}
): Promise<KalshiEventsResponse> {
  const searchParams = new URLSearchParams({
    limit: "20",
    status: "open",
    ...params,
  });
  const res = await fetch(`${KALSHI_PROXY}?endpoint=events&${searchParams}`);
  if (!res.ok) throw new Error(`Kalshi events: ${res.status}`);
  return res.json();
}

export async function fetchKalshiOrderbook(
  ticker: string
): Promise<KalshiOrderbook> {
  const res = await fetch(
    `${KALSHI_PROXY}?endpoint=orderbook&ticker=${encodeURIComponent(ticker)}`
  );
  if (!res.ok) throw new Error(`Kalshi orderbook: ${res.status}`);
  return res.json();
}
