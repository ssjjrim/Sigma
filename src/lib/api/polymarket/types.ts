export interface PolymarketGammaMarket {
  id: string;
  question: string;
  description: string;
  conditionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  liquidity: string;
  volume: string;
  volume24hr: string | number;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  groupItemTitle: string;
  groupItemThreshold: string;
  outcomePrices: string;
  clobTokenIds: string;
  image: string;
  icon: string;
  category: string;
  negRisk: boolean;
  spread: number;
  bestAsk: number;
  lastTradePrice: number;
  volume24hrClob: number;
}

export interface PolymarketGammaEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  markets: PolymarketGammaMarket[];
  volume: string;
  liquidity: string;
  volume24hr: number;
  endDate?: string;
  image?: string;
  icon?: string;
  negRisk: boolean;
  tags?: Array<{ slug: string; label: string }>;
  category?: string;
}

export interface PolymarketCLOBPriceHistory {
  history: Array<{
    t: number;
    p: number;
  }>;
}

export interface PolymarketCLOBBook {
  market: string;
  asset_id: string;
  bids: Array<{ price: string; size: string }>;
  asks: Array<{ price: string; size: string }>;
  hash: string;
  timestamp: string;
}

export interface PolymarketCLOBPrice {
  mid: string;
  bid: string;
  ask: string;
  spread: string;
  token_id: string;
}
