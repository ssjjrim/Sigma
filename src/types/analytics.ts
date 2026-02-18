import { Platform, UnifiedMarket } from "./market";

export interface ArbitrageOpportunity {
  marketA: UnifiedMarket;
  marketB: UnifiedMarket;
  priceDiff: number;
  priceDiffPercent: number;
  gapSize: "small" | "medium" | "large";
  direction: string;
  arbCost: number; // cost to execute arb (buy YES cheap + buy NO cheap)
  arbROI: number; // potential ROI if cost < 1
  hasArb: boolean; // true if arbCost < 1
}

export interface MatchedMarket {
  question: string;
  markets: UnifiedMarket[];
  similarity: number;
  maxPriceDiff: number;
}

export interface StabilizationResult {
  isStabilized: boolean;
  confidence: number;
  volatility: number;
  proximity: number;
  factors: {
    lowVolatility: boolean;
    highConfidence: boolean;
    nearBoundary: boolean;
  };
}

export interface TimeBucket {
  label: string;
  days: number;
  avgPrice: number;
  volatility: number;
  priceChange: number;
  sampleCount: number;
}

export interface EconomicEvent {
  date: string;
  type: "CPI" | "NFP" | "PCE" | "FOMC" | "GDP" | "OTHER";
  label: string;
  impact: "high" | "medium" | "low";
}

export interface LeadingIndicator {
  platform: Platform;
  avgLeadTime: number;
  sampleSize: number;
  correlation: number;
}

export interface SpreadAnalysis {
  market: UnifiedMarket;
  bidAskSpread: number;
  spreadPercent: number;
  rank: number;
}

export interface VolatilityMetrics {
  market: UnifiedMarket;
  rolling7dVol: number;
  shannonEntropy: number;
  maxDrawdown: number;
}

export interface HedgePosition {
  market: UnifiedMarket;
  platform: Platform;
  side: "yes" | "no";
  weight: number;
  amount: number;
}

export interface HedgeResult {
  positions: HedgePosition[];
  totalCost: number;
  expectedPayout: number;
  maxLoss: number;
  profitIfYes: number;
  profitIfNo: number;
}
