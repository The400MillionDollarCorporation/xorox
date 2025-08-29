'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RealTimeData {
  tiktok: {
    recentVideos: number;
    totalViews: number;
    trendingTokens: string[];
  };
  telegram: {
    recentMessages: number;
    activeChannels: number;
    trendingKeywords: string[];
  };
  patternAnalysis: {
    lastAnalysis: string;
    correlations: number;
    recommendations: number;
  };
}

export default function RealTimeData() {
  const [data, setData] = useState<RealTimeData>({
    tiktok: { recentVideos: 0, totalViews: 0, trendingTokens: [] },
    telegram: { recentMessages: 0, activeChannels: 0, trendingKeywords: [] },
    patternAnalysis: { lastAnalysis: 'Never', correlations: 0, recommendations: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRealTimeData = async () => {
    try {
      // Fetch recent TikTok data
      const tiktokResponse = await fetch('/api/supabase/get-tiktoks?limit=5');
      if (tiktokResponse.ok) {
        const tiktokData = await tiktokResponse.json();
        setData(prev => ({
          ...prev,
          tiktok: {
            recentVideos: tiktokData.length,
            totalViews: tiktokData.reduce((sum: number, video: any) => sum + (video.views || 0), 0),
            trendingTokens: tiktokData
              .filter((video: any) => video.mentions && video.mentions.length > 0)
              .flatMap((video: any) => video.mentions.map((m: any) => m.tokens?.symbol || 'Unknown'))
              .slice(0, 5)
          }
        }));
      }

      // Fetch recent Telegram data
      const telegramResponse = await fetch('/api/dashboard/telegram-recent');
      if (telegramResponse.ok) {
        const telegramData = await telegramResponse.json();
        setData(prev => ({
          ...prev,
          telegram: {
            recentMessages: telegramData.messages?.length || 0,
            activeChannels: telegramData.channels?.length || 0,
            trendingKeywords: telegramData.keywords?.slice(0, 5) || []
          }
        }));
      }

      // Fetch pattern analysis summary
      const analysisResponse = await fetch('/api/dashboard/analysis-summary');
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setData(prev => ({
          ...prev,
          patternAnalysis: {
            lastAnalysis: analysisData.lastAnalysis || 'Never',
            correlations: analysisData.totalCorrelations || 0,
            recommendations: analysisData.totalRecommendations || 0
          }
        }));
      }

    } catch (error) {
      console.error('Error fetching real-time data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    if (timestamp === 'Never') return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return '1d+ ago';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse"></div>
              <div className="h-4 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* TikTok Real-time Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📱 TikTok Live
            <Badge variant="secondary">Live</Badge>
          </CardTitle>
          <CardDescription>Real-time TikTok scraping activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{data.tiktok.recentVideos}</p>
              <p className="text-sm text-muted-foreground">Recent Videos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{data.tiktok.totalViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </div>
          
          {data.tiktok.trendingTokens.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Trending Tokens:</p>
              <div className="flex flex-wrap gap-1">
                {data.tiktok.trendingTokens.map((token, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {token}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Button onClick={fetchRealTimeData} variant="outline" size="sm" className="w-full">
            🔄 Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Telegram Real-time Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📡 Telegram Live
            <Badge variant="secondary">Live</Badge>
          </CardTitle>
          <CardDescription>Real-time Telegram scraping activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{data.telegram.recentMessages}</p>
              <p className="text-sm text-muted-foreground">Recent Messages</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{data.telegram.activeChannels}</p>
              <p className="text-sm text-muted-foreground">Active Channels</p>
            </div>
          </div>
          
          {data.telegram.trendingKeywords.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Trending Keywords:</p>
              <div className="flex flex-wrap gap-1">
                {data.telegram.trendingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Button onClick={fetchRealTimeData} variant="outline" size="sm" className="w-full">
            🔄 Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Pattern Analysis Real-time Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧠 Analysis Live
            <Badge variant="secondary">Live</Badge>
          </CardTitle>
          <CardDescription>Real-time pattern analysis activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{data.patternAnalysis.correlations}</p>
              <p className="text-sm text-muted-foreground">Correlations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{data.patternAnalysis.recommendations}</p>
              <p className="text-sm text-muted-foreground">Recommendations</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Last Analysis</p>
            <p className="font-medium">{formatTimeAgo(data.patternAnalysis.lastAnalysis)}</p>
          </div>
          
          <Button onClick={fetchRealTimeData} variant="outline" size="sm" className="w-full">
            🔄 Refresh
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
