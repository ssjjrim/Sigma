export type Platform = "polymarket" | "kalshi" | "manifold" | "opinion";

export interface UnifiedMarket {
  id: string;
  platform: Platform;
  platformId: string;
  question: string;
  description: string;
  category: string;
  status: "active" | "closed" | "resolved";
  yesPrice: number;
  noPrice: number;
  spread: number;
  volume: number;
  volume24h: number;
  liquidity: number;
  endDate: string | null;
  imageUrl: string | null;
  url: string;
  lastUpdated: string;
  outcomes: MarketOutcome[];
}

export interface MarketOutcome {
  name: string;
  price: number;
  tokenId?: string;
}

export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface OrderbookLevel {
  price: number;
  size: number;
}

export interface Orderbook {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  spread: number;
  midPrice: number;
}

export interface PlatformStatus {
  platform: Platform;
  connected: boolean;
  marketCount: number;
  totalVolume: number;
  lastChecked: string;
  error?: string;
}

export interface MarketMover {
  market: UnifiedMarket;
  priceChange24h: number;
  previousPrice: number;
}

export interface AggregateStats {
  totalMarkets: number;
  totalVolume: number;
  avgSpread: number;
  platformBreakdown: Record<Platform, number>;
}
