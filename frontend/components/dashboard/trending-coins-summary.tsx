'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { realTimeService } from '@/lib/real-time-service';

interface SummaryMetrics {
  totalCoins: number;
  totalViews24h: number;
  totalSupply: number;
  avgCorrelation: number;
  topPerformer: {
    symbol: string;
    correlation: number;
    volume: number;
  };
  volumeLeader: {
    symbol: string;
    volume: number;
    views: number;
  };
  socialLeader: {
    symbol: string;
    views: number;
    mentions: number;
  };
  marketCapLeader: {
    symbol: string;
    marketCap: number;
    supply: number;
  };
}

export default function TrendingCoinsSummary() {
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
  }, []);

  const fetchSummaryMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/trending-coins?limit=50');
      if (response.ok) {
        const data = await response.json();
        calculateSummaryMetrics(data.coins);
      }
    } catch (error) {
      console.error('Error fetching summary metrics:', error);
    }
  }, []);

  useEffect(() => {
    // Only fetch data after we're on the client side
    if (!isClient) return;
    
    fetchSummaryMetrics();
    
    // Subscribe to real-time trending updates only if service is available
    if (realTimeService) {
      const unsubscribeTrending = realTimeService.subscribe('trending_update', (newData) => {
        // Update metrics when new trending coin data arrives
        fetchSummaryMetrics();
      });

      // Cleanup subscription
      return () => {
        unsubscribeTrending();
      };
    }
  }, [isClient, fetchSummaryMetrics]);

  const calculateSummaryMetrics = (coins: any[]) => {
    if (!coins.length) return;

    const totalViews24h = coins.reduce((sum, coin) => sum + coin.tiktok_views_24h, 0);
    const avgCorrelation = coins.reduce((sum, coin) => sum + coin.correlation_score, 0) / coins.length;

    // Find top performer by correlation
    const topPerformer = coins.reduce((best, coin) => 
      coin.correlation_score > best.correlation_score ? coin : best
    );

    // Find volume leader
    const volumeLeader = coins.reduce((best, coin) => 
      coin.trading_volume_24h > best.trading_volume_24h ? coin : best
    );

    // Find social leader
    const socialLeader = coins.reduce((best, coin) => 
      coin.tiktok_views_24h > best.tiktok_views_24h ? coin : best
    );

    setMetrics({
      totalCoins: coins.length,
      totalViews24h,
      totalSupply: coins.reduce((sum, coin) => sum + (coin.total_supply || 0), 0),
      avgCorrelation,
      topPerformer: {
        symbol: topPerformer.symbol,
        correlation: topPerformer.correlation_score,
        volume: topPerformer.trading_volume_24h
      },
      volumeLeader: {
        symbol: volumeLeader.symbol,
        volume: volumeLeader.trading_volume_24h,
        views: volumeLeader.tiktok_views_24h
      },
      socialLeader: {
        symbol: socialLeader.symbol,
        views: socialLeader.tiktok_views_24h,
        mentions: socialLeader.total_mentions
      },
      marketCapLeader: coins.reduce((best, coin) => 
        (coin.market_cap || 0) > (best.market_cap || 0) ? coin : best
      , { symbol: 'N/A', marketCap: 0, supply: 0 })
    });
  };

  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0.00';
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatViews = (views: number | undefined | null): string => {
    if (views === undefined || views === null || isNaN(views)) {
      return '0';
    }
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatCorrelation = (score: number | undefined | null): string => {
    if (score === undefined || score === null || isNaN(score)) {
      return '0.0%';
    }
    return `${(score * 100).toFixed(1)}%`;
  };

  const formatSupply = (supply: number | undefined | null): string => {
    if (supply === undefined || supply === null || isNaN(supply)) {
      return '0';
    }
    if (supply >= 1000000) {
      return `${(supply / 1000000).toFixed(2)}M`;
    } else if (supply >= 1000) {
      return `${(supply / 1000).toFixed(2)}K`;
    }
    return supply.toString();
  };

  const getCorrelationColor = (score: number | undefined | null): string => {
    if (score === undefined || score === null || isNaN(score)) {
      return 'text-gray-500';
    }
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    if (score >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!metrics || !isClient) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading summary metrics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Coins */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Coins Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCoins}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active tokens in last 24h
            </p>
          </CardContent>
        </Card>



        {/* Total Views */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total TikTok Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatViews(metrics.totalViews24h)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined social reach
            </p>
          </CardContent>
        </Card>

        {/* Average Correlation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Correlation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getCorrelationColor(metrics.avgCorrelation)}`}>
              {formatCorrelation(metrics.avgCorrelation)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Volume ↔ Social activity
            </p>
          </CardContent>
        </Card>



        {/* Total Supply */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Supply
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatSupply(metrics.totalSupply)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined token supply
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Leaders */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {/* Top Performer */}
        {metrics.topPerformer && metrics.topPerformer.symbol && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                🏆 Top Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{metrics.topPerformer.symbol}</div>
                  <div className={`text-sm ${getCorrelationColor(metrics.topPerformer.correlation)}`}>
                    {formatCorrelation(metrics.topPerformer.correlation)} correlation
                  </div>
                </div>
                <Badge variant="default" className="text-xs">
                  Best Correlation
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Volume: {formatCurrency(metrics.topPerformer.volume)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Volume Leader */}
        {metrics.volumeLeader && metrics.volumeLeader.symbol && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                💰 Volume Leader
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{metrics.volumeLeader.symbol}</div>
                  <div className="text-sm text-green-600">
                    {formatCurrency(metrics.volumeLeader.volume)}
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Highest Volume
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Views: {formatViews(metrics.volumeLeader.views)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Social Leader */}
        {metrics.socialLeader && metrics.socialLeader.symbol && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                📱 Social Leader
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{metrics.socialLeader.symbol}</div>
                  <div className="text-sm text-blue-600">
                    {formatViews(metrics.socialLeader.views)} views
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Most Viral
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Mentions: {metrics.socialLeader.mentions}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Market Cap Leader */}
        {metrics.marketCapLeader && metrics.marketCapLeader.symbol !== 'N/A' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                📊 Market Cap Leader
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{metrics.marketCapLeader.symbol}</div>
                  <div className="text-sm text-purple-600">
                    {formatCurrency(metrics.marketCapLeader.marketCap)}
                  </div>
                </div>
                <Badge variant="destructive" className="text-xs">
                  Highest Value
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Supply: {formatSupply(metrics.marketCapLeader.supply)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
