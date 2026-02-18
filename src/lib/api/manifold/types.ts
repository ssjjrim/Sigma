export interface ManifoldMarket {
  id: string;
  creatorUsername: string;
  creatorName: string;
  createdTime: number;
  closeTime?: number;
  question: string;
  slug: string;
  url: string;
  pool?: { YES: number; NO: number };
  probability?: number;
  p?: number;
  totalLiquidity: number;
  outcomeType: string;
  mechanism: string;
  volume: number;
  volume24Hours: number;
  isResolved: boolean;
  resolution?: string;
  uniqueBettorCount: number;
  lastUpdatedTime: number;
  lastBetTime?: number;
  creatorAvatarUrl?: string;
  coverImageUrl?: string;
  textDescription?: string;
}
