'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RealTimeData from '@/components/dashboard/real-time-data';
import TrendingCoinsSummary from '@/components/dashboard/trending-coins-summary';
import TrendingCoinsAnalytics from '@/components/dashboard/trending-coins-analytics';
import ErrorBoundary from '@/components/dashboard/error-boundary';

export default function DashboardClient() {
  const [scraperStatus, setScraperStatus] = useState({
    tiktok: {
      status: 'active',
      isRunning: false,
      lastRun: null,
      totalVideos: 1247,
      videosToday: 45
    },
    telegram: {
      status: 'active',
      isRunning: false,
      lastRun: null,
      totalMessages: 15420,
      messagesToday: 234
    },
    patternAnalysis: {
      status: 'active',
      isRunning: false,
      lastRun: null,
      totalAnalyses: 89,
      analysesToday: 12
    },
    twitter: {
      status: 'active',
      isRunning: false,
      lastRun: null,
      totalAlerts: 156,
      alertsToday: 8
    }
  });

  // Set the dates on the client side to avoid hydration mismatch
  useEffect(() => {
    const now = Date.now();
    setScraperStatus(prev => ({
      ...prev,
      tiktok: { ...prev.tiktok, lastRun: new Date(now - 1000 * 60 * 30) },
      telegram: { ...prev.telegram, lastRun: new Date(now - 1000 * 60 * 15) },
      patternAnalysis: { ...prev.patternAnalysis, lastRun: new Date(now - 1000 * 60 * 60) },
      twitter: { ...prev.twitter, lastRun: new Date(now - 1000 * 60 * 45) }
    }));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Loading...';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const startScraper = (type: string) => {
    console.log(`Starting ${type} scraper...`);
    // TODO: Implement actual scraper start logic
  };

  const stopScraper = (type: string) => {
    console.log(`Stopping ${type} scraper...`);
    // TODO: Implement actual scraper stop logic
  };

  const runAnalysis = () => {
    console.log('Running pattern analysis...');
    // TODO: Implement actual analysis logic
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">ZoroX Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time memecoin analytics and TikTok trend monitoring
        </p>
      </div>

      {/* Real-time Data Overview */}
      <ErrorBoundary>
        <RealTimeData />
      </ErrorBoundary>

      {/* Trending Coins Analytics */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">🚀 Trending Coins Analytics</h2>
          <p className="text-muted-foreground">
            Monitor top trending coins with 24-hour trading volume, TikTok view counts, and volume/social correlation metrics
          </p>
        </div>
        
        {/* Summary Metrics */}
        <ErrorBoundary>
          <TrendingCoinsSummary />
        </ErrorBoundary>
        
        {/* Detailed Analytics */}
        <ErrorBoundary>
          <TrendingCoinsAnalytics />
        </ErrorBoundary>
      </div>

      {/* System Status Overview */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* TikTok Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📱 TikTok Integration
                <div className={`w-3 h-3 rounded-full ${getStatusColor(scraperStatus.tiktok.status)}`}></div>
              </CardTitle>
              <CardDescription>
                TikTok data collection and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Videos</p>
                  <p className="text-2xl font-bold">{scraperStatus.tiktok.totalVideos.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">{scraperStatus.tiktok.videosToday.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Last Run: {formatTimeAgo(scraperStatus.tiktok.lastRun)}
              </p>
              <div className="flex gap-2">
                {scraperStatus.tiktok.isRunning ? (
                  <Button onClick={() => stopScraper('tiktok')} variant="destructive" size="sm">
                    Stop
                  </Button>
                ) : (
                  <Button onClick={() => startScraper('tiktok')} size="sm">
                    Start
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Telegram Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💬 Telegram Integration
                <div className={`w-3 h-3 rounded-full ${getStatusColor(scraperStatus.telegram.status)}`}></div>
              </CardTitle>
              <CardDescription>
                Telegram channel monitoring and message analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Messages</p>
                  <p className="text-2xl font-bold">{scraperStatus.telegram.totalMessages.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">{scraperStatus.telegram.messagesToday.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Last Run: {formatTimeAgo(scraperStatus.telegram.lastRun)}
              </p>
              <div className="flex gap-2">
                {scraperStatus.telegram.isRunning ? (
                  <Button onClick={() => stopScraper('telegram')} variant="destructive" size="sm">
                    Stop
                  </Button>
                ) : (
                  <Button onClick={() => startScraper('telegram')} size="sm">
                    Start
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pattern Analysis Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧠 Pattern Analysis
                <div className={`w-3 h-3 rounded-full ${getStatusColor(scraperStatus.patternAnalysis.status)}`}></div>
              </CardTitle>
              <CardDescription>
                AI-powered trend analysis and correlation detection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Analyses</p>
                  <p className="text-2xl font-bold">{scraperStatus.patternAnalysis.totalAnalyses.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">{scraperStatus.patternAnalysis.analysesToday.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Last Run: {formatTimeAgo(scraperStatus.patternAnalysis.lastRun)}
              </p>
              <div className="flex gap-2">
                {scraperStatus.patternAnalysis.isRunning ? (
                  <Button onClick={() => stopScraper('pattern')} variant="destructive" size="sm">
                    Stop
                  </Button>
                ) : (
                  <Button onClick={() => startScraper('pattern')} size="sm">
                    Start
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Twitter Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🐦 Twitter Integration
                <div className={`w-3 h-3 rounded-full ${getStatusColor(scraperStatus.twitter.status)}`}></div>
              </CardTitle>
              <CardDescription>
                Market alerts and automated posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold">{scraperStatus.twitter.totalAlerts.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">{scraperStatus.twitter.alertsToday.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Last Run: {formatTimeAgo(scraperStatus.twitter.lastRun)}
              </p>
              <div className="flex gap-2">
                {scraperStatus.twitter.isRunning ? (
                  <Button onClick={() => stopScraper('twitter')} variant="destructive" size="sm">
                    Stop
                  </Button>
                ) : (
                  <Button onClick={() => startScraper('twitter')} size="sm">
                    Start
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Control */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">System Control</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bulk Operations */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
              <CardDescription>Control multiple scrapers at once</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => {
                  startScraper('tiktok');
                  startScraper('telegram');
                }} className="flex-1">
                  🚀 Start All Scrapers
                </Button>
                <Button onClick={() => {
                  stopScraper('tiktok');
                  stopScraper('telegram');
                }} variant="destructive" className="flex-1">
                  🛑 Stop All Scrapers
                </Button>
              </div>
              <Button onClick={runAnalysis} className="w-full">
                🧠 Run Pattern Analysis
              </Button>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Monitor system performance and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Status</span>
                  <span className="font-medium">
                    {Object.values(scraperStatus).every(s => s.status === 'active') ? 'Healthy' : 
                     Object.values(scraperStatus).some(s => s.status === 'error') ? 'Error' : 'Running'}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-4">
                  <div 
                    className="bg-primary h-4 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(Object.values(scraperStatus).filter(s => s.isRunning).length / 4) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Active Scrapers</p>
                  <p className="text-2xl font-bold">
                    {Object.values(scraperStatus).filter(s => s.isRunning).length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Total Data</p>
                  <p className="text-2xl font-bold">
                    {(scraperStatus.tiktok.totalVideos + scraperStatus.telegram.totalMessages).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Analyses</p>
                  <p className="text-2xl font-bold">
                    {scraperStatus.patternAnalysis.totalAnalyses.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Setup</CardTitle>
              <CardDescription>
                Set up required database tables for the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.open('/api/setup-database', '_blank')}
                className="w-full"
              >
                🗄️ Setup Database
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Raw Data</CardTitle>
              <CardDescription>
                Access raw data from TikTok and other sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.open('/api/supabase/get-tiktoks?limit=10', '_blank')}
                variant="outline"
                className="w-full"
              >
                📊 View TikTok Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
