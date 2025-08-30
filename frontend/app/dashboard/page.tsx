'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RealTimeData from '@/components/dashboard/real-time-data';
import TrendingCoinsSummary from '@/components/dashboard/trending-coins-summary';
import TrendingCoinsAnalytics from '@/components/dashboard/trending-coins-analytics';
import ErrorBoundary from '@/components/dashboard/error-boundary';
import ClientOnly from '@/components/ui/client-only';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);

  // Remove the problematic useEffect and API calls that don't exist
  // The dashboard will work with the existing components that have their own data fetching

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
        <ClientOnly fallback={
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Loading real-time data...</p>
            </CardContent>
          </Card>
        }>
      <RealTimeData />
        </ClientOnly>
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
          <ClientOnly fallback={
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Loading summary metrics...</p>
              </CardContent>
            </Card>
          }>
        <TrendingCoinsSummary />
          </ClientOnly>
        </ErrorBoundary>
        
        {/* Detailed Analytics */}
        <ErrorBoundary>
          <ClientOnly fallback={
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Loading analytics data...</p>
              </CardContent>
            </Card>
          }>
        <TrendingCoinsAnalytics />
          </ClientOnly>
        </ErrorBoundary>
      </div>

      {/* System Status Overview */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">System Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TikTok Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                📱 TikTok Integration
            </CardTitle>
            <CardDescription>
                TikTok data collection and analysis
            </CardDescription>
          </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <span className="font-medium text-green-600">Active</span>
              </div>
                <div className="flex justify-between text-sm">
                  <span>Data Source</span>
                  <span className="font-medium">TikTok API</span>
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Telegram Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                📡 Telegram Integration
            </CardTitle>
            <CardDescription>
                Telegram channel monitoring
            </CardDescription>
          </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <span className="font-medium text-green-600">Active</span>
              </div>
                <div className="flex justify-between text-sm">
                  <span>Data Source</span>
                  <span className="font-medium">Telegram API</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pattern Analysis Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧠 Pattern Analysis
            </CardTitle>
            <CardDescription>
                AI-powered trend analysis
            </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <span className="font-medium text-green-600">Active</span>
                              </div>
                <div className="flex justify-between text-sm">
                  <span>Data Source</span>
                  <span className="font-medium">AI Analysis</span>
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


