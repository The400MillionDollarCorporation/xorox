'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SummaryMetrics {
  totalCoins: number;
  totalVolume24h: number;
  totalViews24h: number;
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
}

export default function TrendingCoinsSummary() {
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSummaryMetrics();
    const interval = setInterval(fetchSummaryMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSummaryMetrics = async () => {
    try {
      const response = await fetch('/api/dashboard/trending-coins?limit=50');
      if (response.ok) {
        const data = await response.json();
        calculateSummaryMetrics(data.coins);
      }
    } catch (error) {
      console.error('Error fetching summary metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSummaryMetrics = (coins: any[]) => {
    if (!coins.length) return;

    const totalVolume24h = coins.reduce((sum, coin) => sum + coin.trading_volume_24h, 0);
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
      totalVolume24h,
      totalViews24h,
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
      }
    });
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No summary metrics available</p>
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

        {/* Total Volume */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total 24h Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.totalVolume24h)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined trading volume
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
      </div>

      {/* Performance Leaders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Top Performer */}
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

        {/* Volume Leader */}
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

        {/* Social Leader */}
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
      </div>
    </>
  );
}
