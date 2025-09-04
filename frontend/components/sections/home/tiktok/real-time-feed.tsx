"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Eye, MessageCircle, TrendingUp, Clock, AlertCircle } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

  const fetchTikTokData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      console.log('🔄 Fetching TikTok data...');
      
      // Fetch TikTok data
      const tiktokResponse = await fetch('/api/supabase/get-tiktoks?limit=100');
      if (!tiktokResponse.ok) {
        throw new Error(`TikTok API error: ${tiktokResponse.status}`);
      }
        const tiktokData = await tiktokResponse.json();
      
      // Fetch mentions data
      const mentionsResponse = await fetch('/api/supabase/get-mentions?limit=1000');
      if (!mentionsResponse.ok) {
        throw new Error(`Mentions API error: ${mentionsResponse.status}`);
      }
      const mentionsData = await mentionsResponse.json();
      
      console.log('📊 TikTok data received:', tiktokData);
      console.log('🔗 Mentions data received:', mentionsData);
      
      if (tiktokData.data && Array.isArray(tiktokData.data)) {
        setTiktoks(tiktokData.data);
        console.log(`✅ Set ${tiktokData.data.length} TikTok videos`);
      } else {
        console.warn('⚠️ TikTok data is not an array:', tiktokData);
        setTiktoks([]);
      }
      
      if (mentionsData.data && Array.isArray(mentionsData.data)) {
        setMentions(mentionsData.data);
        console.log(`✅ Set ${mentionsData.data.length} mentions`);
      } else {
        console.warn('⚠️ Mentions data is not an array:', mentionsData);
        setMentions([]);
      }

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching TikTok data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
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

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-iris-primary/20 border-t-iris-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading TikTok feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 meme-title">📱 Real-Time TikTok Feed</h2>
          <p className="text-muted-foreground meme-body">
            Live memecoin mentions and trending videos from TikTok
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {lastUpdate && (
            <p className="text-sm text-muted-foreground">
              Last updated: {formatTimeAgo(lastUpdate.toISOString())}
            </p>
          )}
          
          <Button
            onClick={fetchTikTokData}
            disabled={refreshing}
            variant="outline"
            className="border-iris-primary/30 text-iris-primary hover:bg-iris-primary/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error loading data:</span>
            <span>{error}</span>
          </div>
          <Button
            onClick={fetchTikTokData}
            variant="outline"
            size="sm"
            className="mt-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-iris-primary/20 border-t-iris-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading TikTok data...</p>
      </div>
      )}

      {/* TikTok Videos Grid */}
      {!loading && tiktoks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tiktoks.slice(0, 12).map((tiktok) => {
          const tiktokMentions = getTokenMentions(tiktok.id);
          
          return (
              <Card
                key={tiktok.id}
                className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-iris-primary/50 transition-all duration-300 hover:scale-105"
              >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-iris-primary to-iris-secondary rounded-full flex items-center justify-center text-black font-bold text-sm">
                        {tiktok.username.charAt(0).toUpperCase()}
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
                  <TrendingUp className="h-4 w-4 text-iris-primary" />
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
                          className="bg-iris-primary/20 text-iris-primary border-iris-primary/30"
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
                  className="w-full bg-iris-primary hover:bg-iris-primary/80 text-black"
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
      )}

      {/* Load More */}
      {!loading && tiktoks.length > 12 && (
        <div className="text-center mt-8">
          <Button variant="outline" className="border-iris-primary/30 text-iris-primary">
            Load More Videos
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && tiktoks.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-iris-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-iris-primary" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2 meme-comic">No TikTok Data Yet</h3>
          <p className="text-muted-foreground mb-4 meme-body">
            Start your automated scraping to see real-time memecoin mentions here!
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Check if your scraper is running</p>
            <p>• Verify database connection</p>
            <p>• Run the setup scripts if needed</p>
          </div>
          <Button
            onClick={fetchTikTokData}
            className="mt-4 bg-iris-primary hover:bg-iris-primary/80 text-black"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-muted/20 rounded-lg text-xs text-muted-foreground">
          <p><strong>Debug Info:</strong></p>
          <p>TikTok count: {tiktoks.length}</p>
          <p>Mentions count: {mentions.length}</p>
          <p>Loading: {loading.toString()}</p>
          <p>Error: {error || 'None'}</p>
        </div>
      )}
    </div>
  );
}
