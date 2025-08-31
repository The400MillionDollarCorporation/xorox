type Price = {
  price_usd: number;
  price_sol: number;
  trade_at: string;
  is_latest: boolean;
};

type SearchTokenResponse = {
  id: number;
  name: string;
  symbol: string;
  uri: string;
  image: any;
};

type TokenData = {
  id: number;
  name: string;
  symbol: string;
  uri: string;
  image: any;
  created_at: string;
  address: string;
  prices: Price[];
  latest_price_usd: number | null;
  latest_price_sol: number | null;
  latest_market_cap: number | null;
  views: number;
  mentions: number;
  tweets: Tweet[];
  tiktoks: any[];
  // New market data fields
  market_cap?: number;
  total_supply?: number;
  last_updated?: string;
};

// New interface for trending coins with enhanced market data
interface TrendingCoin {
  uri: string;
  symbol: string;
  name: string;
  trading_volume_24h: number;
  tiktok_views_24h: number;
  correlation_score: number;
  price_change_24h: number;
  total_mentions: number;
  // Enhanced market data fields
  market_cap?: number;
  total_supply?: number;
  last_updated: string;
  // Additional metadata
  address?: string;
  decimals?: number;
}

type LeaderboardData = {
  id: number;
  name: string;
  symbol: string;
  uri: string;
  image: any;
  created_at: string;
  latest_price_usd: number | null;
  latest_market_cap: number | null;
  latest_price_sol: number | null;
  views: number;
  mentions: number;
  // New market data fields
  total_supply?: number;
  last_updated?: string;
};
type SortKey = keyof TokenData;
type SortDirection = "asc" | "desc";

interface SortConfig {
  key: SortKey | null;
  direction: SortDirection;
}

interface SortableTableHeaderProps {
  children: React.ReactNode;
  onClick: () => void;
  sorted: boolean;
  direction: SortDirection;
}

export interface DocsConfig {
  mainNav: any[];
  sidebarNav: any[];
  chartsNav: any[];
}

interface TradeData {
  price_usd: number;
  price_sol: number;
  trade_at: string;
}

interface DataPoint {
  timestamp: string;
  rawTimestamp: number;
  price: number;
  popularity: number;
}

type TimeframeType = "30m" | "1h" | "3h" | "24h" | "7d";

type Tweet = {
  id: number;
  created_at: string;
  tweet: string;
  tweet_id: string;
};

export type {
  TokenData,
  TrendingCoin,
  Price,
  SortKey,
  SortDirection,
  SortConfig,
  SortableTableHeaderProps,
  SearchTokenResponse,
  LeaderboardData,
  TradeData,
  DataPoint,
  TimeframeType,
  Tweet,
};
