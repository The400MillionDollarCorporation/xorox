'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Activity, Target, Zap, Search, Filter, X } from 'lucide-react';
import { realTimeService } from '@/lib/real-time-service';

interface TrendingCoinsData {
  coins: any[];
  total: number;
  sortBy: string;
  limit: number;
}

export default function TrendingCoinsAnalytics() {
  const [data, setData] = useState<TrendingCoinsData>({ coins: [], total: 0, sortBy: 'mentions', limit: 20 });
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('mentions');
  const [limit, setLimit] = useState(20);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [lastUpdated, setLastUpdated] = useState<string>('--');
  const [isClient, setIsClient] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMarketCap, setFilterMarketCap] = useState<string>('all');
  const [filterMessages, setFilterMessages] = useState<string>('all');

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

  // Filtered and searched data
  const filteredCoins = useMemo(() => {
    let filtered = [...data.coins];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(coin => 
        coin.symbol?.toLowerCase().includes(query) ||
        coin.name?.toLowerCase().includes(query) ||
        coin.address?.toLowerCase().includes(query)
      );
    }

    // Market cap filter
    if (filterMarketCap !== 'all') {
      switch (filterMarketCap) {
        case 'high':
          filtered = filtered.filter(coin => (coin.market_cap || 0) >= 1000000);
          break;
        case 'medium':
          filtered = filtered.filter(coin => (coin.market_cap || 0) >= 100000 && (coin.market_cap || 0) < 1000000);
          break;
        case 'low':
          filtered = filtered.filter(coin => (coin.market_cap || 0) < 100000);
          break;
      }
    }

    // Messages filter
    if (filterMessages !== 'all') {
      switch (filterMessages) {
        case 'high':
          filtered = filtered.filter(coin => (coin.total_mentions || 0) >= 1000);
          break;
        case 'medium':
          filtered = filtered.filter(coin => (coin.total_mentions || 0) >= 100 && (coin.total_mentions || 0) < 1000);
          break;
        case 'low':
          filtered = filtered.filter(coin => (coin.total_mentions || 0) < 100);
          break;
      }
    }

    return filtered;
  }, [data.coins, searchQuery, filterMarketCap, filterMessages]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterMarketCap('all');
    setFilterMessages('all');
  };

  const formatSupply = (supply: number): string => {
    if (supply >= 1000000000) {
      return `${(supply / 1000000000).toFixed(2)}B`;
    } else if (supply >= 1000000) {
      return `${(supply / 1000000000).toFixed(2)}M`;
    } else if (supply >= 1000) {
      return `${(supply / 1000).toFixed(2)}K`;
    }
    return supply.toString();
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
                <SelectItem value="mentions">Messages</SelectItem>
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
          <span>Showing {filteredCoins.length} of {data.total} coins</span>
          <span>Last updated: {lastUpdated}</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by symbol, name, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={filterMarketCap} onValueChange={setFilterMarketCap}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Market Cap" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Market Caps</SelectItem>
                <SelectItem value="high">High (≥$1M)</SelectItem>
                <SelectItem value="medium">Medium ($100K-$1M)</SelectItem>
                <SelectItem value="low">Low (&lt;$100K)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterMessages} onValueChange={setFilterMessages}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Messages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="high">High (≥1K)</SelectItem>
                <SelectItem value="medium">Medium (100-1K)</SelectItem>
                <SelectItem value="low">Low (&lt;100)</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || filterMarketCap !== 'all' || filterMessages !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchQuery || filterMarketCap !== 'all' || filterMessages !== 'all') && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: &quot;{searchQuery}&quot;
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </Badge>
              )}
              {filterMarketCap !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Market Cap: {filterMarketCap}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setFilterMarketCap('all')}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </Badge>
              )}
              {filterMessages !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Messages: {filterMessages}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setFilterMessages('all')}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          {/* No Results Message */}
          {filteredCoins.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">
                {searchQuery ? `No coins found matching "${searchQuery}"` : 'No coins match the current filters'}
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4">
              {filteredCoins.slice(0, 10).map((coin, index) => (
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
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Messages</p>
                      <p className="text-lg font-bold text-blue-600">
                        {(coin.total_mentions || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="correlation" className="space-y-4">
            <div className="grid gap-4">
              {filteredCoins
                .sort((a, b) => (b.total_mentions || 0) - (a.total_mentions || 0))
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
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Messages</p>
                        <p className="text-lg font-bold text-blue-600">
                          {(coin.total_mentions || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="grid gap-4">
              {filteredCoins
                .sort((a, b) => (b.total_mentions || 0) - (a.total_mentions || 0))
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
                        </div>
                        </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Messages</p>
                        <p className="text-lg font-bold text-blue-600">
                          {(coin.total_mentions || 0).toLocaleString()}
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
