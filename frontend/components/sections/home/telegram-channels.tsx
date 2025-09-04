"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Users, 
  Clock, 
  Activity, 
  Search, 
  ExternalLink,
  Play,
  Pause,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { telegramChannelsService, TelegramChannelsData, TelegramChannel } from '@/lib/telegram-channels-service';

export default function TelegramChannelsHome() {
  const [data, setData] = useState<TelegramChannelsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0
  });

  const fetchTelegramData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      console.log('🔄 Fetching Telegram channels data...');
      
      const channelsData = await telegramChannelsService.fetchChannels();
      if (channelsData) {
        setData(channelsData);
        setLastUpdate(new Date());
        console.log(`✅ Set ${channelsData.channels.length} Telegram channels`);
      } else {
        throw new Error('Failed to fetch channels data');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching Telegram channels data:', error);
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

    let unsubscribe: (() => void) | null = null;

    const initializeService = async () => {
      try {
        setLoading(true);
        setError(null);

        // Subscribe to real-time updates
        unsubscribe = telegramChannelsService.subscribe((newData) => {
          setData(newData);
          setLoading(false);
          setLastUpdate(new Date());
        });

        // Update connection status
        const updateConnectionStatus = () => {
          setConnectionStatus(telegramChannelsService.getConnectionStatus());
        };

        updateConnectionStatus();
        const statusInterval = setInterval(updateConnectionStatus, 1000);

        // Initial fetch
        await fetchTelegramData();

        return () => {
          clearInterval(statusInterval);
        };
      } catch (err) {
        console.error('Error initializing Telegram channels service:', err);
        setError('Failed to load Telegram channels');
        setLoading(false);
      }
    };

    const cleanup = initializeService();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [isClient]);

  const handleToggleChannel = async (channel: TelegramChannel) => {
    try {
      const updatedChannel = await telegramChannelsService.updateChannel(channel.id, {
        enabled: !channel.enabled
      });
      
      if (updatedChannel) {
        // Update local state optimistically
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            channels: prev.channels.map(c => 
              c.id === channel.id ? { ...c, enabled: updatedChannel.enabled } : c
            ),
            summary: {
              ...prev.summary,
              enabledChannels: prev.summary.enabledChannels + (updatedChannel.enabled ? 1 : -1),
              disabledChannels: prev.summary.disabledChannels + (updatedChannel.enabled ? -1 : 1)
            }
          };
        });
      }
    } catch (error) {
      console.error('Error toggling channel:', error);
    }
  };

  const filteredChannels = data?.channels.filter(channel => {
    const matchesSearch = channel.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         channel.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'enabled' && channel.enabled) ||
                         (statusFilter === 'disabled' && !channel.enabled);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const formatLastMessage = (lastMessageAt: string | null) => {
    if (!lastMessageAt) return 'No messages';
    
    const date = new Date(lastMessageAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatMessages = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getConnectionStatusColor = () => {
    if (connectionStatus.isConnected) return 'text-green-500';
    if (connectionStatus.isConnecting) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConnectionStatusText = () => {
    if (connectionStatus.isConnected) return '● Live';
    if (connectionStatus.isConnecting) return '● Connecting';
    return '● Disconnected';
  };

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-iris-primary/20 border-t-iris-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Telegram channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 sm:py-6 lg:py-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full lg:w-auto">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 meme-title">
            <span>💬 Telegram Channels</span>
            <span className={`text-xs sm:text-sm font-normal ${getConnectionStatusColor()}`}>
              {getConnectionStatusText()}
            </span>
          </h2>
          <p className="text-muted-foreground meme-body text-sm sm:text-base">
            Monitor and manage Telegram channels for memecoin data collection
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full lg:w-auto">
          {lastUpdate && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              Last updated: {formatLastMessage(lastUpdate.toISOString())}
            </p>
          )}
          
          <Button
            onClick={fetchTelegramData}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="border-iris-primary/30 text-iris-primary hover:bg-iris-primary/10 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-iris-primary">{data.summary.totalChannels}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Channels</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-500">{data.summary.enabledChannels}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-500">{formatMessages(data.summary.totalMessages)}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Messages</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-500">{formatMessages(data.summary.recentMessages)}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Recent (24h)</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card/50 backdrop-blur-sm border-border/50 h-10 sm:h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-card/50 backdrop-blur-sm border-border/50 h-10 sm:h-11">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="enabled">Enabled Only</SelectItem>
            <SelectItem value="disabled">Disabled Only</SelectItem>
          </SelectContent>
        </Select>
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
            onClick={fetchTelegramData}
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
          <p className="text-muted-foreground">Loading Telegram channels...</p>
        </div>
      )}

      {/* Channels Grid */}
      {!loading && filteredChannels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 w-full">
          {filteredChannels.slice(0, 12).map((channel) => (
            <Card
              key={channel.id}
              className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-iris-primary/50 transition-all duration-300 hover:scale-105 w-full min-w-0"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {channel.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate">@{channel.username}</p>
                      {channel.display_name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {channel.display_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={channel.enabled ? "default" : "secondary"} className="text-xs flex-shrink-0">
                    {channel.enabled ? (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <Pause className="h-3 w-3 mr-1" />
                        Paused
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{formatMessages(channel.stats.totalMessages)}</p>
                      <p className="text-xs text-muted-foreground">messages</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{formatLastMessage(channel.stats.lastMessageAt)}</p>
                      <p className="text-xs text-muted-foreground">last activity</p>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                  <div className="flex items-center gap-1 min-w-0">
                    <Settings className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Every {channel.scrape_interval_minutes}m</span>
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    {channel.scrape_media ? (
                      <Eye className="h-3 w-3 flex-shrink-0" />
                    ) : (
                      <EyeOff className="h-3 w-3 flex-shrink-0" />
                    )}
                    <span className="truncate">{channel.scrape_media ? 'Media' : 'Text only'}</span>
                  </div>
                </div>

                {/* Last Message Preview */}
                {channel.stats.lastMessagePreview && (
                  <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                    <strong>Last message:</strong> 
                    <div className="truncate mt-1">{channel.stats.lastMessagePreview}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={channel.enabled}
                    onCheckedChange={() => handleToggleChannel(channel)}
                    className="data-[state=checked]:bg-iris-primary flex-shrink-0"
                  />
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 border-iris-primary/30 text-iris-primary hover:bg-iris-primary/10 min-w-0"
                  >
                    <a href={`https://t.me/${channel.username}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1">
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">View Channel</span>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {!loading && filteredChannels.length > 12 && (
        <div className="text-center mt-8">
          <Button variant="outline" className="border-iris-primary/30 text-iris-primary">
            Load More Channels
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredChannels.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-iris-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-iris-primary" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2 meme-comic">No Telegram Channels Found</h3>
          <p className="text-muted-foreground mb-4 meme-body">
            {searchTerm ? 'Try adjusting your search terms' : 'Start adding Telegram channels to monitor memecoin activity!'}
          </p>
          {!searchTerm && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Add channels to your scraper configuration</p>
              <p>• Check if your scraper is running</p>
              <p>• Verify database connection</p>
            </div>
          )}
          <Button
            onClick={fetchTelegramData}
            className="mt-4 bg-iris-primary hover:bg-iris-primary/80 text-black"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
