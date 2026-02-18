import { NextRequest, NextResponse } from "next/server";

const KALSHI_BASE = "https://api.elections.kalshi.com/trade-api/v2";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const endpoint = searchParams.get("endpoint") || "markets";
  const ticker = searchParams.get("ticker");
  searchParams.delete("endpoint");
  searchParams.delete("ticker");

  let url: string;
  if (endpoint === "orderbook" && ticker) {
    url = `${KALSHI_BASE}/markets/${ticker}/orderbook`;
  } else if (endpoint === "events") {
    url = `${KALSHI_BASE}/events?${searchParams.toString()}`;
  } else {
    url = `${KALSHI_BASE}/markets?${searchParams.toString()}`;
  }

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "PredictionAnalytics/1.0",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Kalshi API returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Kalshi proxy error: ${error instanceof Error ? error.message : "unknown"}` },
      { status: 500 }
    );
  }
}
