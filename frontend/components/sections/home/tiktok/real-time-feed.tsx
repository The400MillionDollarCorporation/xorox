"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Eye, MessageCircle, TrendingUp, Clock } from "lucide-react";

interface TikTokData {
  id: string;
  username: string;
  url: string;
  thumbnail: string;
  created_at: string;
  fetched_at: string;
  views: number;
  comments: number;
}

interface TokenMention {
  id: number;
  tiktok_id: string;
  token_id: number;
  count: number;
  mention_at: string;
  token?: {
    symbol: string;
    name: string;
  };
}

export default function RealTimeTikTokFeed() {
  const [tiktoks, setTiktoks] = useState<TikTokData[]>([]);
  const [mentions, setMentions] = useState<TokenMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  const fetchTikTokData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch TikTok data
      const tiktokResponse = await fetch('/api/supabase/get-tiktoks?limit=100');
      const tiktokData = await tiktokResponse.json();
      
      // Fetch mentions data
      const mentionsResponse = await fetch('/api/supabase/get-mentions?limit=1000');
      const mentionsData = await mentionsResponse.json();
      
      if (tiktokData.data) {
        setTiktoks(tiktokData.data);
      }
      
      if (mentionsData.data) {
        setMentions(mentionsData.data);
      }
      
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching TikTok data:', error);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only fetch data after we're on the client side
    if (!isClient) return;

    fetchTikTokData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchTikTokData, 30000);
    
    return () => clearInterval(interval);
  }, [isClient]);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getTokenMentions = (tiktokId: string) => {
    return mentions.filter(mention => mention.tiktok_id === tiktokId);
  };

  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F8D12E]"></div>
        <span className="ml-2 text-muted-foreground">Loading TikTok data...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Real-Time TikTok Feed</h2>
          <p className="text-muted-foreground">
            Live memecoin mentions from TikTok • Auto-refreshes every 30s
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Last updated</p>
            <p className="text-sm font-medium">
              {lastUpdate ? formatTimeAgo(lastUpdate.toISOString()) : 'Never'}
            </p>
          </div>
          <Button
            onClick={fetchTikTokData}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-black/20 border-[#F8D12E]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#F8D12E]">{tiktoks.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 border-[#F8D12E]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#F8D12E]">
              {formatViews(tiktoks.reduce((sum, tiktok) => sum + tiktok.views, 0))}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 border-[#F8D12E]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#F8D12E]">
              {tiktoks.reduce((sum, tiktok) => sum + tiktok.comments, 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 border-[#F8D12E]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Token Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#F8D12E]">{mentions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* TikTok Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiktoks.slice(0, 12).map((tiktok) => {
          const tiktokMentions = getTokenMentions(tiktok.id);
          
          return (
            <Card key={tiktok.id} className="bg-black/20 border-[#F8D12E]/20 hover:border-[#F8D12E]/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#F8D12E] rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-bold">
                        {tiktok.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">@{tiktok.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(tiktok.created_at)}
                      </p>
                    </div>
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Thumbnail */}
                {tiktok.thumbnail && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={tiktok.thumbnail}
                      alt={`TikTok by ${tiktok.username}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-white">{formatViews(tiktok.views)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-white">{tiktok.comments}</span>
                    </div>
                  </div>
                  <TrendingUp className="h-4 w-4 text-[#F8D12E]" />
                </div>
                
                {/* Token Mentions */}
                {tiktokMentions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Mentioned Tokens:</p>
                    <div className="flex flex-wrap gap-1">
                      {tiktokMentions.map((mention) => (
                        <Badge
                          key={mention.id}
                          variant="secondary"
                          className="bg-[#F8D12E]/20 text-[#F8D12E] border-[#F8D12E]/30"
                        >
                          {mention.token?.symbol || `Token ${mention.token_id}`}
                          <span className="ml-1 text-xs">({mention.count})</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* View Button */}
                <Button
                  asChild
                  className="w-full bg-[#F8D12E] hover:bg-[#F8D12E]/80 text-black"
                  size="sm"
                >
                  <a href={tiktok.url} target="_blank" rel="noopener noreferrer">
                    View on TikTok
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load More */}
      {tiktoks.length > 12 && (
        <div className="text-center mt-8">
          <Button variant="outline" className="border-[#F8D12E]/30 text-[#F8D12E]">
            Load More Videos
          </Button>
        </div>
      )}

      {/* Empty State */}
      {tiktoks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#F8D12E]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-[#F8D12E]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No TikTok Data Yet</h3>
          <p className="text-muted-foreground">
            Start your automated scraping to see real-time memecoin mentions here!
          </p>
        </div>
      )}
    </div>
  );
}
