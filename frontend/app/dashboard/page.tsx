'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RealTimeData from '@/components/dashboard/real-time-data';

interface ScraperStatus {
  tiktok: {
    isRunning: boolean;
    lastRun: string;
    totalVideos: number;
    videosToday: number;
    status: 'idle' | 'running' | 'error';
  };
  telegram: {
    isRunning: boolean;
    lastRun: string;
    totalMessages: number;
    messagesToday: number;
    status: 'idle' | 'running' | 'error';
  };
  patternAnalysis: {
    isRunning: boolean;
    lastRun: string;
    totalAnalyses: number;
    analysesToday: number;
    status: 'idle' | 'running' | 'error';
  };
}

interface AnalysisResult {
  id: number;
  analysis_type: string;
  platform: string;
  timestamp: string;
  summary: any;
  correlations: any[];
  recommendations: any[];
}

interface TrendingKeyword {
  keyword: string;
  platform: string;
  frequency: number;
  last_seen: string;
}

export default function DashboardPage() {
  const [scraperStatus, setScraperStatus] = useState<ScraperStatus>({
    tiktok: { isRunning: false, lastRun: 'Never', totalVideos: 0, videosToday: 0, status: 'idle' },
    telegram: { isRunning: false, lastRun: 'Never', totalMessages: 0, messagesToday: 0, status: 'idle' },
    patternAnalysis: { isRunning: false, lastRun: 'Never', totalAnalyses: 0, analysesToday: 0, status: 'idle' }
  });
  
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch scraper status
      const statusResponse = await fetch('/api/dashboard/scraper-status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setScraperStatus(statusData);
      }
      
      // Fetch analysis results
      const analysisResponse = await fetch('/api/dashboard/analysis-results');
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setAnalysisResults(analysisData);
      }
      
      // Fetch trending keywords
      const keywordsResponse = await fetch('/api/dashboard/trending-keywords');
      if (keywordsResponse.ok) {
        const keywordsData = await keywordsResponse.json();
        setTrendingKeywords(keywordsData);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startScraper = async (type: 'tiktok' | 'telegram' | 'pattern') => {
    try {
      const response = await fetch('/api/dashboard/start-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      
      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error(`Error starting ${type} scraper:`, error);
    }
  };

  const stopScraper = async (type: 'tiktok' | 'telegram' | 'pattern') => {
    try {
      const response = await fetch('/api/dashboard/stop-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      
      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error(`Error stopping ${type} scraper:`, error);
    }
  };

  const runAnalysis = async () => {
    try {
      const response = await fetch('/api/dashboard/run-analysis', {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error running analysis:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Running';
      case 'error': return 'Error';
      default: return 'Idle';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    if (timestamp === 'Never') return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">ZoroX Dashboard</h1>
        <Button onClick={fetchDashboardData} variant="outline">
          🔄 Refresh
        </Button>
      </div>

      {/* Real-time Data Overview */}
      <RealTimeData />

      {/* Scraper Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TikTok Scraper Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📱 TikTok Scraper
              <div className={`w-3 h-3 rounded-full ${getStatusColor(scraperStatus.tiktok.status)}`}></div>
            </CardTitle>
            <CardDescription>
              Status: {getStatusText(scraperStatus.tiktok.status)}
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

        {/* Telegram Scraper Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📡 Telegram Scraper
              <div className={`w-3 h-3 rounded-full ${getStatusColor(scraperStatus.telegram.status)}`}></div>
            </CardTitle>
            <CardDescription>
              Status: {getStatusText(scraperStatus.telegram.status)}
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
              Status: {getStatusText(scraperStatus.patternAnalysis.status)}
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
                <Button onClick={runAnalysis} size="sm">
                  Run Analysis
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
          <TabsTrigger value="trending">Trending Keywords</TabsTrigger>
          <TabsTrigger value="control">System Control</TabsTrigger>
        </TabsList>

        {/* Analysis Results Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Pattern Analysis Results</h2>
            <div className="flex gap-2">
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6">
            {analysisResults
              .filter(result => selectedPlatform === 'all' || result.platform === selectedPlatform)
              .map((result) => (
                <Card key={result.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {result.platform === 'tiktok' ? '📱' : 
                           result.platform === 'telegram' ? '📡' : '🧠'} 
                          {result.analysis_type.charAt(0).toUpperCase() + result.analysis_type.slice(1)} Analysis
                        </CardTitle>
                        <CardDescription>
                          {new Date(result.timestamp).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge variant={result.platform === 'comprehensive' ? 'default' : 'secondary'}>
                        {result.platform}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {result.summary && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {Object.entries(result.summary).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <p className="text-sm text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-lg font-semibold">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {result.recommendations && result.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Top Recommendations:</h4>
                        <div className="space-y-2">
                          {result.recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">#{index + 1}</Badge>
                                <span className="font-medium">{rec.token}</span>
                                <Badge variant={rec.risk === 'Low' ? 'default' : rec.risk === 'Medium' ? 'secondary' : 'destructive'}>
                                  {rec.risk} Risk
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            
            {analysisResults.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No analysis results found</p>
                  <Button onClick={runAnalysis} className="mt-4">
                    Run First Analysis
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Trending Keywords Tab */}
        <TabsContent value="trending" className="space-y-6">
          <h2 className="text-2xl font-bold">Trending Keywords</h2>
          
          <div className="grid gap-4">
            {trendingKeywords.map((keyword, index) => (
              <Card key={keyword.keyword + keyword.platform}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-semibold">{keyword.keyword}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {keyword.platform} • {formatTimeAgo(keyword.last_seen)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{keyword.frequency}</p>
                      <p className="text-sm text-muted-foreground">mentions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {trendingKeywords.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No trending keywords found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* System Control Tab */}
        <TabsContent value="control" className="space-y-6">
          <h2 className="text-2xl font-bold">System Control</h2>
          
          <div className="grid gap-6">
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
                      {Object.values(scraperStatus).every(s => s.status === 'idle') ? 'Idle' : 
                       Object.values(scraperStatus).some(s => s.status === 'error') ? 'Error' : 'Running'}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-4">
                    <div 
                      className="bg-primary h-4 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(Object.values(scraperStatus).filter(s => s.status === 'running').length / 3) * 100}%` 
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
