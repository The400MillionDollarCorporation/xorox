'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TrendingCoinsSummary from '@/components/dashboard/trending-coins-summary';
import TrendingCoinsAnalytics from '@/components/dashboard/trending-coins-analytics';

export default function TrendingCoinsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🚀 Trending Coins Analytics</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Comprehensive analysis of trending memecoins with social and trading metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="4h">4 Hours</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            📊 Export Data
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Search & Filters</CardTitle>
          <CardDescription>
            Find specific coins or filter by various metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by coin symbol, name, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              🔄 Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📊 Market Overview</h2>
        <TrendingCoinsSummary />
      </div>

      {/* Detailed Analytics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📈 Detailed Analytics</h2>
        <TrendingCoinsAnalytics />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Correlation Insights */}
        <Card>
          <CardHeader>
            <CardTitle>🧠 Correlation Insights</CardTitle>
            <CardDescription>
              Understanding the relationship between social activity and trading volume
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">High Correlation (80%+)</span>
                <Badge variant="default">Strong Signal</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Medium Correlation (60-80%)</span>
                <Badge variant="secondary">Moderate Signal</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Low Correlation (Below 60%)</span>
                <Badge variant="outline">Weak Signal</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Higher correlation suggests stronger alignment between social buzz and trading activity
            </p>
          </CardContent>
        </Card>

        {/* Trading Signals */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Trading Signals</CardTitle>
            <CardDescription>
              Key indicators for potential trading opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Volume Spike + High Views</span>
                <Badge variant="default">🚀 Strong Buy</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">High Views + Low Volume</span>
                <Badge variant="secondary">📱 Watch</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">High Volume + Low Views</span>
                <Badge variant="outline">💰 Institutional</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Combine multiple metrics for stronger trading signals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Market Trends</CardTitle>
          <CardDescription>
            Current market patterns and emerging trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trends">Trending Patterns</TabsTrigger>
              <TabsTrigger value="sectors">Sector Analysis</TabsTrigger>
              <TabsTrigger value="timing">Timing Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">🚀 Momentum Coins</h4>
                  <p className="text-sm text-muted-foreground">
                    Coins with rapidly increasing social activity and volume
                  </p>
                  <div className="mt-2">
                    <Badge variant="default">High Growth</Badge>
                    <Badge variant="secondary" className="ml-2">Viral Potential</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">💎 Hidden Gems</h4>
                  <p className="text-sm text-muted-foreground">
                    Coins with high correlation but low market attention
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline">Undervalued</Badge>
                    <Badge variant="secondary" className="ml-2">Discovery Phase</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sectors" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <h4 className="font-semibold mb-2">🐕 Memecoins</h4>
                  <p className="text-sm text-muted-foreground">Highest social engagement</p>
                  <Badge variant="default" className="mt-2">Trending</Badge>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <h4 className="font-semibold mb-2">🎮 Gaming</h4>
                  <p className="text-sm text-muted-foreground">Growing community interest</p>
                  <Badge variant="secondary" className="mt-2">Emerging</Badge>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <h4 className="font-semibold mb-2">🔗 DeFi</h4>
                  <p className="text-sm text-muted-foreground">High volume, low social</p>
                  <Badge variant="outline" className="mt-2">Established</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timing" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">⏰ Best Entry Points</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• High correlation + volume spike</li>
                    <li>• Social momentum building</li>
                    <li>• Low market cap + high potential</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">⚠️ Risk Factors</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Low correlation scores</li>
                    <li>• Declining social activity</li>
                    <li>• Volume without social support</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
