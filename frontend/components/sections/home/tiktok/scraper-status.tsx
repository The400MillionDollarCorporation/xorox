"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Activity, Clock, Zap } from "lucide-react";

interface ScraperStatus {
  isRunning: boolean;
  lastRun: string | null;
  totalVideos: number;
  videosToday: number;
  nextRun: string | null;
}

export default function ScraperStatus() {
  const [status, setStatus] = useState<ScraperStatus>({
    isRunning: false,
    lastRun: null,
    totalVideos: 0,
    videosToday: 0,
    nextRun: null
  });
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      
      // Fetch TikTok data to determine status
      const response = await fetch('/api/supabase/get-tiktoks?limit=1000');
      const data = await response.json();
      
      const videos = data.data || [];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Calculate videos from today
      const videosToday = videos.filter((video: any) => {
        const videoDate = new Date(video.fetched_at);
        return videoDate >= today;
      }).length;
      
      // Estimate if scraper is running based on recent activity
      const recentVideos = videos.filter((video: any) => {
        const videoDate = new Date(video.fetched_at);
        const diffMinutes = (now.getTime() - videoDate.getTime()) / (1000 * 60);
        return diffMinutes < 10; // Consider scraper running if videos in last 10 minutes
      });
      
      const isRunning = recentVideos.length > 0;
      const lastRun = videos.length > 0 ? videos[0].fetched_at : null;
      
      setStatus({
        isRunning,
        lastRun,
        totalVideos: videos.length,
        videosToday,
        nextRun: isRunning ? null : new Date(now.getTime() + 5 * 60 * 1000).toISOString() // 5 minutes from now
      });
      
    } catch (error) {
      console.error('Error fetching scraper status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data after we're on the client side
    if (!isClient) return;
    
    fetchStatus();
    
    // Update status every minute
    const interval = setInterval(fetchStatus, 60000);
    
    return () => clearInterval(interval);
  }, [isClient]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatNextRun = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Starting now';
    if (diffInMinutes < 60) return `in ${diffInMinutes}m`;
    return `in ${Math.floor(diffInMinutes / 60)}h`;
  };

  if (loading) {
    return (
      <Card className="bg-black/20 border-iris-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-iris-primary"></div>
            <span className="ml-2 text-muted-foreground">Checking status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 border-iris-primary/20">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
          <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">TikTok & Telegram Scraper Status</span>
          <span className="sm:hidden">Scraper Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Status:</span>
          <Badge
            variant="secondary"
            className={`${
              status.isRunning 
                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            }`}
          >
            {status.isRunning ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                Running
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 mr-2" />
                Idle
              </>
            )}
          </Badge>
        </div>

        {/* Last Run */}
        {status.lastRun && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Run:</span>
            <span className="text-sm text-white flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(status.lastRun)}
            </span>
          </div>
        )}

        {/* Next Run */}
        {status.nextRun && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Next Run:</span>
            <span className="text-sm text-white flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {formatNextRun(status.nextRun)}
            </span>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
          <div className="text-center p-2 sm:p-3 bg-black/10 rounded-lg">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-iris-primary">{status.totalVideos}</p>
            <p className="text-xs text-muted-foreground">Total Videos</p>
          </div>
          <div className="text-center p-2 sm:p-3 bg-black/10 rounded-lg">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-iris-primary">{status.videosToday}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-iris-primary/30 text-iris-primary h-9 sm:h-10"
            onClick={fetchStatus}
          >
            <Activity className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Refresh Status</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-iris-primary/30 text-iris-primary h-9 sm:h-10"
            onClick={() => window.open('/dashboard', '_blank')}
          >
            <Play className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">View Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
