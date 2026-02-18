export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  previous_price: number;
  volume: number;
  volume_24h: number;
  volume_fp: number;
  volume_24h_fp: number;
  liquidity: number;
  open_interest: number;
  open_interest_fp: number;
  status: string;
  result: string;
  close_time: string;
  expiration_time: string;
  expected_expiration_time: string;
  category: string;
  rules_primary: string;
  rules_secondary: string;
  response_price_units: string;
  notional_value: number;
  tick_size: number;
}

export interface KalshiMarketsResponse {
  markets: KalshiMarket[];
  cursor: string;
}

export interface KalshiEvent {
  event_ticker: string;
  series_ticker: string;
  title: string;
  subtitle: string;
  sub_title: string;
  category: string;
  markets: KalshiMarket[];
  status: string;
}

export interface KalshiEventsResponse {
  events: KalshiEvent[];
  cursor: string;
}

export interface KalshiOrderbook {
  orderbook: {
    yes: Array<[number, number]>;
    no: Array<[number, number]>;
  };
}
