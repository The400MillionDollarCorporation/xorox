'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Activity, Target, Zap } from 'lucide-react';
import { realTimeService } from '@/lib/real-time-service';

interface TrendingCoinsData {
  coins: any[];
  total: number;
  sortBy: string;
  limit: number;
}

export default function TrendingCoinsAnalytics() {
  const [data, setData] = useState<TrendingCoinsData>({ coins: [], total: 0, sortBy: 'correlation', limit: 20 });
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('correlation');
  const [limit, setLimit] = useState(20);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [lastUpdated, setLastUpdated] = useState<string>('--');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
  }, []);

  const fetchTrendingCoins = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dashboard/trending-coins?sortBy=${sortBy}&limit=${limit}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        // Update time on client side only
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Error fetching trending coins:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, limit]);

  useEffect(() => {
    // Only fetch data after we're on the client side
    if (!isClient) return;
    
    fetchTrendingCoins();
    
    // Subscribe to real-time trending updates only if service is available
    if (realTimeService) {
      const unsubscribeTrending = realTimeService.subscribe('trending_update', (newData) => {
        // Update data when new trending coin data arrives
        fetchTrendingCoins();
        // Update time on client side only
        setLastUpdated(new Date().toLocaleTimeString());
      });

      // Cleanup subscription
      return () => {
        unsubscribeTrending();
      };
    }
  }, [isClient, sortBy, limit, fetchTrendingCoins]);

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

  if (isLoading || !isClient) {
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

  const formatSupply = (supply: number): string => {
    if (supply >= 1000000000) {
      return `${(supply / 1000000000).toFixed(2)}B`;
    } else if (supply >= 1000000) {
      return `${(supply / 1000000).toFixed(2)}M`;
    } else if (supply >= 1000) {
      return `${(supply / 1000).toFixed(2)}K`;
    }
    return supply.toString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Trending Coins Analytics</CardTitle>
            <CardDescription>
              Real-time analysis of trending memecoins with live updates
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="correlation">Correlation</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="mentions">Mentions</SelectItem>
                <SelectItem value="market_cap">Market Cap</SelectItem>
              </SelectContent>
            </Select>
            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {data.coins.length} of {data.total} coins</span>
          <span>Last updated: {lastUpdated}</span>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="market">Market Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4">
              {data.coins.slice(0, 10).map((coin, index) => (
                <div key={coin.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                        <h3 className="font-semibold">{coin.symbol}</h3>
                      <p className="text-sm text-muted-foreground">
                        Volume: {formatCurrency(coin.trading_volume_24h)}
                      </p>
                      {coin.market_cap && (
                        <p className="text-xs text-muted-foreground">
                          Market Cap: {formatCurrency(coin.market_cap)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Correlation</p>
                      <p className={`text-lg font-bold ${getCorrelationColor(coin.correlation_score)}`}>
                        {formatCorrelation(coin.correlation_score)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Views</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatViews(coin.tiktok_views_24h)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="correlation" className="space-y-4">
            <div className="grid gap-4">
              {data.coins
                .sort((a, b) => b.correlation_score - a.correlation_score)
                .slice(0, 10)
                .map((coin, index) => (
                  <div key={coin.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                        <div>
                          <h3 className="font-semibold">{coin.symbol}</h3>
                        <p className="text-sm text-muted-foreground">
                          Volume: {formatCurrency(coin.trading_volume_24h)}
                        </p>
                        {coin.market_cap && (
                          <p className="text-xs text-muted-foreground">
                            Market Cap: {formatCurrency(coin.market_cap)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={getCorrelationBadgeVariant(coin.correlation_score)}>
                        {formatCorrelation(coin.correlation_score)}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">Views</p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatViews(coin.tiktok_views_24h)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="grid gap-4">
              {data.coins
                .sort((a, b) => b.tiktok_views_24h - a.tiktok_views_24h)
                .slice(0, 10)
                .map((coin, index) => (
                  <div key={coin.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                        <div>
                          <h3 className="font-semibold">{coin.symbol}</h3>
                        <p className="text-sm text-muted-foreground">
                          Correlation: {formatCorrelation(coin.correlation_score)}
                        </p>
                        {coin.market_cap && (
                          <p className="text-xs text-muted-foreground">
                            Market Cap: {formatCurrency(coin.market_cap)}
                          </p>
                        )}
                      </div>
                        </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Views</p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatViews(coin.tiktok_views_24h)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Mentions</p>
                        <p className="text-lg font-bold text-purple-600">
                          {coin.total_mentions || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            <div className="grid gap-4">
              {data.coins
                .filter(coin => coin.market_cap || coin.total_supply)
                .sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
                .slice(0, 10)
                .map((coin, index) => (
                  <div key={coin.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{coin.symbol}</h3>
                        <p className="text-sm text-muted-foreground">
                          {coin.name || 'Unknown Token'}
                        </p>
                        {coin.address && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {coin.address.slice(0, 8)}...{coin.address.slice(-8)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {coin.market_cap && (
                        <div className="text-right">
                          <p className="text-sm font-medium">Market Cap</p>
                          <p className="text-lg font-bold text-purple-600">
                            {formatCurrency(coin.market_cap)}
                          </p>
                        </div>
                      )}
                      {coin.total_supply && (
                        <div className="text-right">
                          <p className="text-sm font-medium">Total Supply</p>
                          <p className="text-lg font-bold text-orange-600">
                            {formatSupply(coin.total_supply)}
                          </p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-xs text-muted-foreground">
                          {coin.last_updated ? new Date(coin.last_updated).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
