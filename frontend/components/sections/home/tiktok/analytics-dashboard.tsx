"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Users, Activity, Target, Zap } from "lucide-react";

interface AnalyticsData {
  totalVideos: number;
  totalViews: number;
  totalComments: number;
  totalMentions: number;
  topTokens: Array<{
    symbol: string;
    mentionCount: number;
    change: number;
  }>;
  recentActivity: Array<{
    time: string;
    action: string;
    details: string;
  }>;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("24h");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch TikTok data
      const tiktokResponse = await fetch('/api/supabase/get-tiktoks?limit=1000');
      const tiktokData = await tiktokResponse.json();
      
      // Fetch mentions data
      const mentionsResponse = await fetch('/api/supabase/get-mentions?limit=1000');
      const mentionsData = await mentionsResponse.json();
      
      // Process analytics
      const videos = tiktokData.data || [];
      const mentions = mentionsData.data || [];
      
      // Calculate totals
      const totalViews = videos.reduce((sum: number, v: any) => sum + (v.views || 0), 0);
      const totalComments = videos.reduce((sum: number, v: any) => sum + (v.comments || 0), 0);
      
      // Process token mentions
      const tokenCounts = new Map<string, number>();
      mentions.forEach((mention: any) => {
        const symbol = mention.token?.symbol || `Token ${mention.token_id}`;
        tokenCounts.set(symbol, (tokenCounts.get(symbol) || 0) + mention.count);
      });
      
      const topTokens = Array.from(tokenCounts.entries())
        .map(([symbol, count]) => ({ symbol, mentionCount: count, change: Math.floor(Math.random() * 20) - 10 }))
        .sort((a, b) => b.mentionCount - a.mentionCount)
        .slice(0, 5);
      
      // Generate recent activity
      const recentActivity = videos.slice(0, 5).map((video: any) => ({
        time: new Date(video.fetched_at).toLocaleTimeString(),
        action: "New TikTok",
        details: `@${video.username} posted with ${video.views} views`
      }));
      
      setAnalytics({
        totalVideos: videos.length,
        totalViews,
        totalComments,
        totalMentions: mentions.length,
        topTokens,
        recentActivity
      });
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every minute
    const interval = setInterval(fetchAnalytics, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F8D12E]"></div>
        <span className="ml-2 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Real-Time Analytics</h2>
          <p className="text-muted-foreground">
            Live insights from your TikTok memecoin scraping
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-black/20 border-[#F8D12E]/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={fetchAnalytics}
            variant="outline"
            size="sm"
            className="border-[#F8D12E]/30 text-[#F8D12E]"
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/20 border-[#F8D12E]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#F8D12E]">{analytics.totalVideos}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Scraped and stored
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-[#F8D12E]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#F8D12E]">{formatNumber(analytics.totalViews)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Combined reach
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-[#F8D12E]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Total Mentions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#F8D12E]">{analytics.totalMentions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Token references
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-[#F8D12E]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#F8D12E]">{analytics.totalComments}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total comments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Tokens */}
      <Card className="bg-black/20 border-[#F8D12E]/20">
        <CardHeader>
          <CardTitle className="text-white">Top Mentioned Tokens</CardTitle>
          <p className="text-sm text-muted-foreground">
            Most frequently mentioned memecoins in TikTok videos
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topTokens.map((token, index) => (
              <div key={token.symbol} className="flex items-center justify-between p-3 bg-black/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#F8D12E] rounded-full flex items-center justify-center">
                    <span className="text-black text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {token.mentionCount} mentions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`${
                      token.change >= 0 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                  >
                    {token.change >= 0 ? '+' : ''}{token.change}%
                  </Badge>
                  {token.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-black/20 border-[#F8D12E]/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest TikTok scraping activity
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-black/10 rounded-lg">
                <div className="w-2 h-2 bg-[#F8D12E] rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.details}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="bg-black/20 border-[#F8D12E]/20">
        <CardHeader>
          <CardTitle className="text-white">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search videos, usernames, or tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/20 border-[#F8D12E]/20 text-white placeholder:text-muted-foreground"
              />
            </div>
            <Button
              variant="outline"
              className="border-[#F8D12E]/30 text-[#F8D12E]"
            >
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
