'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TrendingCoin {
  uri: string;
  symbol: string;
  name: string;
  trading_volume_24h: number;
  tiktok_views_24h: number;
  correlation_score: number;
  price_change_24h: number;
  total_mentions: number;
  market_cap?: number;
  last_updated: string;
}

interface TrendingCoinsData {
  coins: TrendingCoin[];
  total: number;
  sortBy: string;
  limit: number;
}

export default function TrendingCoinsAnalytics() {
  const [data, setData] = useState<TrendingCoinsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('correlation');
  const [limit, setLimit] = useState<number>(20);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    fetchTrendingCoins();
    const interval = setInterval(fetchTrendingCoins, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [sortBy, limit]);

  const fetchTrendingCoins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dashboard/trending-coins?sortBy=${sortBy}&limit=${limit}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching trending coins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatCorrelation = (score: number): string => {
    return `${(score * 100).toFixed(1)}%`;
  };

  const getCorrelationColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    if (score >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPriceChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getCorrelationBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 0.8) return 'default';
    if (score >= 0.6) return 'secondary';
    if (score >= 0.4) return 'outline';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending Coins Analytics</CardTitle>
          <CardDescription>Loading trending coins data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-muted rounded animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.coins.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending Coins Analytics</CardTitle>
          <CardDescription>No trending coins data available</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchTrendingCoins} variant="outline">
            Refresh Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>🚀 Trending Coins Analytics</CardTitle>
            <CardDescription>
              Top {data.limit} trending coins with 24h trading volume, TikTok views, and correlation metrics
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="correlation">Correlation</SelectItem>
                <SelectItem value="volume">Trading Volume</SelectItem>
                <SelectItem value="views">TikTok Views</SelectItem>
              </SelectContent>
            </Select>
            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4">
              {data.coins.slice(0, 10).map((coin, index) => (
                <div key={coin.uri} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="text-sm">
                      #{index + 1}
                    </Badge>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{coin.symbol}</h3>
                        <Badge variant={getCorrelationBadgeVariant(coin.correlation_score)}>
                          {formatCorrelation(coin.correlation_score)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{coin.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">24h Volume</p>
                      <p className="font-semibold">{formatCurrency(coin.trading_volume_24h)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">TikTok Views</p>
                      <p className="font-semibold">{formatViews(coin.tiktok_views_24h)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Price Change</p>
                      <p className={`font-semibold ${getPriceChangeColor(coin.price_change_24h)}`}>
                        {coin.price_change_24h > 0 ? '+' : ''}{coin.price_change_24h.toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Mentions</p>
                      <p className="font-semibold">{coin.total_mentions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Correlation Tab */}
          <TabsContent value="correlation" className="space-y-4">
            <div className="grid gap-4">
              {data.coins
                .filter(coin => coin.correlation_score > 0.5)
                .sort((a, b) => b.correlation_score - a.correlation_score)
                .map((coin, index) => (
                  <div key={coin.uri} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <h3 className="font-semibold">{coin.symbol}</h3>
                          <p className="text-sm text-muted-foreground">{coin.name}</p>
                        </div>
                      </div>
                      <Badge variant={getCorrelationBadgeVariant(coin.correlation_score)} className="text-lg">
                        {formatCorrelation(coin.correlation_score)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Volume/Views Ratio</p>
                        <p className="font-semibold">
                          {coin.tiktok_views_24h > 0 ? (coin.trading_volume_24h / coin.tiktok_views_24h).toFixed(4) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Social Activity</p>
                        <p className="font-semibold">{coin.total_mentions} mentions</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          {/* Volume Tab */}
          <TabsContent value="volume" className="space-y-4">
            <div className="grid gap-4">
              {data.coins
                .sort((a, b) => b.trading_volume_24h - a.trading_volume_24h)
                .map((coin, index) => (
                  <div key={coin.uri} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <h3 className="font-semibold">{coin.symbol}</h3>
                          <p className="text-sm text-muted-foreground">{coin.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(coin.trading_volume_24h)}
                        </p>
                        <p className="text-sm text-muted-foreground">24h Volume</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Price Change</p>
                        <p className={`font-semibold ${getPriceChangeColor(coin.price_change_24h)}`}>
                          {coin.price_change_24h > 0 ? '+' : ''}{coin.price_change_24h.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Correlation</p>
                        <p className={`font-semibold ${getCorrelationColor(coin.correlation_score)}`}>
                          {formatCorrelation(coin.correlation_score)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Market Cap</p>
                        <p className="font-semibold">
                          {coin.market_cap ? formatCurrency(coin.market_cap) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Total coins analyzed: {data.total}</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
