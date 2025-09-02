'use client';


import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { realTimeService } from '@/lib/real-time-service';
import { tiktokViewsService, TikTokViewsData } from '@/lib/tiktok-views-service';

interface SummaryMetrics {
  totalCoins: number;
  totalViews24h: number;
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
  const [isLoadingViews, setIsLoadingViews] = useState(false);
  const [lastViewsUpdate, setLastViewsUpdate] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    isConnecting: boolean;
    reconnectAttempts: number;
  } | null>(null);

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
  }, []);

  const fetchTotalTikTokViews = useCallback(async () => {
    try {
      setIsLoadingViews(true);
      const response = await fetch('/api/dashboard/total-tiktok-views?timeRange=24h');
      if (response.ok) {
        const data = await response.json();
        setLastViewsUpdate(new Date().toLocaleTimeString());
        return data.totalViews;
      }
    } catch (error) {
      console.error('Error fetching total TikTok views:', error);
    } finally {
      setIsLoadingViews(false);
    }
    return 0;
  }, []);

  const fetchData = useCallback(async () => {
    // Fetch both trending coins and total TikTok views
    const [trendingResponse, totalViews] = await Promise.all([
      fetch('/api/dashboard/trending-coins?limit=50'),
      fetchTotalTikTokViews()
    ]);

    if (trendingResponse.ok) {
      const trendingData = await trendingResponse.json();
      calculateSummaryMetrics(trendingData.coins, totalViews);
    }
  }, [fetchTotalTikTokViews]);

  const refreshTikTokViews = useCallback(async () => {
    console.log('🔄 Manually refreshing TikTok views...');
    setIsLoadingViews(true);
    
    try {
      const totalViews = await fetchTotalTikTokViews();
      if (metrics) {
        setMetrics(prev => prev ? { ...prev, totalViews24h: totalViews } : null);
      }
      setLastViewsUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('❌ Error refreshing TikTok views:', error);
    } finally {
      setIsLoadingViews(false);
    }
  }, [fetchTotalTikTokViews, metrics]);

  const reconnectTikTokViews = useCallback(() => {
    console.log('🔄 Manually reconnecting TikTok views service...');
    tiktokViewsService.disconnect();
    tiktokViewsService.connect('24h');
  }, []);

  useEffect(() => {
    // Only fetch data after we're on the client side
    if (!isClient) return;
    
    fetchData();
    
    // Subscribe to real-time TikTok views updates
    const unsubscribeTikTokViews = tiktokViewsService.subscribe((data: TikTokViewsData) => {
      console.log('🔄 Real-time TikTok views update received:', data);
      
      // Update the metrics immediately with new TikTok views data
      setMetrics(prev => {
        if (prev) {
          setLastViewsUpdate(new Date().toLocaleTimeString());
          return { ...prev, totalViews24h: data.totalViews };
        }
        return null;
      });
      
      // Also update loading state
      setIsLoadingViews(false);
    });
    
    // Subscribe to real-time trending updates only if service is available
    if (realTimeService) {
      const unsubscribeTrending = realTimeService.subscribe('trending_update', (newData) => {
        // Update metrics when new trending coin data arrives
        fetchData();
      });

      // Cleanup subscription
      return () => {
        unsubscribeTrending();
        unsubscribeTikTokViews();
      };
    }

    // Cleanup TikTok views subscription
    return () => {
      unsubscribeTikTokViews();
    };
  }, [isClient, fetchData]);

  // Monitor connection status
  useEffect(() => {
    if (!isClient) return;

    const updateConnectionStatus = () => {
      setConnectionStatus(tiktokViewsService.getConnectionStatus());
    };

    // Update status immediately
    updateConnectionStatus();

    // Update status every second
    const statusInterval = setInterval(updateConnectionStatus, 1000);

    return () => clearInterval(statusInterval);
  }, [isClient]);

  // Initialize connection status
  useEffect(() => {
    if (isClient && connectionStatus === null) {
      setConnectionStatus({ isConnected: false, isConnecting: false, reconnectAttempts: 0 });
    }
  }, [isClient, connectionStatus]);

  // Error boundary for real-time service failures
  useEffect(() => {
    if (isClient && connectionStatus && connectionStatus.reconnectAttempts >= 5) {
      console.warn('⚠️ Real-time service failed to connect after multiple attempts');
      // Fallback to polling mode
      const fallbackInterval = setInterval(() => {
        fetchTotalTikTokViews().then(totalViews => {
          if (metrics) {
            setMetrics(prev => prev ? { ...prev, totalViews24h: totalViews } : null);
          }
        });
      }, 30000); // Poll every 30 seconds as fallback

      return () => clearInterval(fallbackInterval);
    }
  }, [isClient, connectionStatus, metrics, fetchTotalTikTokViews]);

  const calculateSummaryMetrics = (coins: any[], totalViews: number) => {
    if (!coins.length) return;

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
      totalViews24h: totalViews,
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



  const getCorrelationColor = (score: number | undefined | null): string => {
    if (score === undefined || score === null || isNaN(score)) {
      return 'text-gray-500';
    }
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    if (score >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!isClient) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Initializing...</p>
            </CardContent>
          </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <p className="text-muted-foreground">Loading summary metrics...</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Safety check to ensure all required metrics are available
  if (!metrics.totalCoins || !metrics.topPerformer || !metrics.volumeLeader || !metrics.socialLeader || !metrics.marketCapLeader) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <p className="text-muted-foreground">Preparing dashboard data...</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-xs text-muted-foreground">
              Loading trending coins and market data...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Additional safety check for real-time service initialization
  if (!connectionStatus) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <p className="text-muted-foreground">Initializing real-time service...</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Total Coins */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Coins Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalCoins || 0}</div>
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
              <div className="flex items-center gap-2 mt-1">
                {!connectionStatus ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Initializing...</span>
                  </div>
                ) : connectionStatus.isConnected ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600">Live</span>
                  </div>
                ) : connectionStatus.isConnecting ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-yellow-600">Connecting...</span>
                  </div>
                ) : connectionStatus.reconnectAttempts >= 5 ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-orange-600">Fallback Mode</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-red-600">Offline</span>
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoadingViews ? (
                <span className="animate-pulse">...</span>
              ) : (
                formatViews(metrics?.totalViews24h || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined social reach
              {lastViewsUpdate && (
                <span className="block text-xs text-blue-500">
                  Updated: {lastViewsUpdate}
                </span>
              )}
              {connectionStatus?.reconnectAttempts && connectionStatus.reconnectAttempts > 0 && (
                <span className="block text-xs text-orange-500">
                  Reconnect attempts: {connectionStatus.reconnectAttempts}
                </span>
              )}
              {connectionStatus?.reconnectAttempts && connectionStatus.reconnectAttempts >= 5 && (
                <span className="block text-xs text-orange-600">
                  Using fallback polling mode
                </span>
              )}
              <button 
                onClick={refreshTikTokViews}
                className="block text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                disabled={isLoadingViews}
              >
                {isLoadingViews ? 'Refreshing...' : 'Refresh manually'}
              </button>
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
                Supply: {metrics.marketCapLeader.supply?.toLocaleString() || '0'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
