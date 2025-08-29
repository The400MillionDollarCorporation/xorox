'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PatternCorrelation {
  keyword: string;
  token_name?: string;
  token_symbol?: string;
  correlation_score: number;
  risk_level?: string;
  recommendation_text?: string;
}

interface AnalysisResult {
  id: number;
  analysis_type: string;
  platform: string;
  timestamp: string;
  summary: any;
  pattern_correlations?: PatternCorrelation[];
}

interface TrendingKeyword {
  keyword: string;
  frequency: number;
  platform: string;
  last_seen: string;
  trend_direction: 'up' | 'down' | 'stable';
  related_tokens?: string[];
}

interface PatternAnalysisData {
  analysisResults: AnalysisResult[];
  trendingKeywords: TrendingKeyword[];
  totalAnalyses: number;
  totalCorrelations: number;
  lastAnalysisTime: string;
  platformBreakdown: {
    tiktok: number;
    telegram: number;
    combined: number;
  };
}

export default function PatternAnalysisDashboard() {
  const [data, setData] = useState<PatternAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [limit, setLimit] = useState<number>(20);

  useEffect(() => {
    fetchPatternAnalysisData();
    const interval = setInterval(fetchPatternAnalysisData, 120000); // Refresh every 2 minutes
    return () => clearInterval(interval);
  }, [selectedPlatform, limit]);

  const fetchPatternAnalysisData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch analysis results
      const analysisResponse = await fetch(`/api/dashboard/analysis-results?limit=${limit}&platform=${selectedPlatform === 'all' ? '' : selectedPlatform}`);
      const analysisData = analysisResponse.ok ? await analysisResponse.json() : [];
      
      // Fetch trending keywords
      const keywordsResponse = await fetch(`/api/dashboard/trending-keywords?limit=${limit}&platform=${selectedPlatform === 'all' ? '' : selectedPlatform}`);
      const keywordsData = keywordsResponse.ok ? await keywordsResponse.json() : [];
      
      // Fetch analysis summary
      const summaryResponse = await fetch('/api/dashboard/analysis-summary');
      const summaryData = summaryResponse.ok ? await summaryResponse.json() : {};
      
      // Process and combine data
      const processedData: PatternAnalysisData = {
        analysisResults: analysisData,
        trendingKeywords: keywordsData,
        totalAnalyses: summaryData.totalAnalyses || 0,
        totalCorrelations: summaryData.totalCorrelations || 0,
        lastAnalysisTime: summaryData.lastAnalysisTime || new Date().toISOString(),
        platformBreakdown: summaryData.platformBreakdown || { tiktok: 0, telegram: 0, combined: 0 }
      };
      
      setData(processedData);
    } catch (error) {
      console.error('Error fetching pattern analysis data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const analysisTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - analysisTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBadgeVariant = (riskLevel: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🧠 Pattern Analysis Dashboard</CardTitle>
          <CardDescription>Loading pattern analysis data...</CardDescription>
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

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🧠 Pattern Analysis Dashboard</CardTitle>
          <CardDescription>No pattern analysis data available</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchPatternAnalysisData} variant="outline">
            Refresh Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>🧠 Pattern Analysis Dashboard</CardTitle>
            <CardDescription>
              AI-powered pattern recognition and correlation analysis for memecoin trading
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="combined">Combined</SelectItem>
              </SelectContent>
            </Select>
            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Analyses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalAnalyses}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pattern analyses run
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Correlations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{data.totalCorrelations}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Identified patterns
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Last Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-green-600">
                    {formatTimeAgo(data.lastAnalysisTime)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Most recent run
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Trending Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{data.trendingKeywords.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active keywords
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-3">📊 Platform Analysis Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      TikTok Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-pink-600">{data.platformBreakdown.tiktok}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Social media patterns
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Telegram Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{data.platformBreakdown.telegram}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Community patterns
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Combined Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{data.platformBreakdown.combined}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cross-platform insights
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Analysis Results */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🔍 Recent Analysis Results</h3>
              <div className="space-y-3">
                {data.analysisResults.slice(0, 5).map((result) => (
                  <div key={result.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{result.analysis_type}</div>
                        <div className="text-sm text-muted-foreground">
                          Platform: {result.platform} • {formatTimeAgo(result.timestamp)}
                        </div>
                      </div>
                      <Badge variant="outline">{result.platform}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Correlations Tab */}
          <TabsContent value="correlations" className="space-y-4">
            <div className="grid gap-4">
              {data.analysisResults.flatMap(result => 
                result.pattern_correlations?.map((correlation, index) => (
                  <div key={`${result.id}-${index}`} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="text-sm">
                          #{index + 1}
                        </Badge>
                        <div>
                          <h3 className="font-semibold">#{correlation.keyword}</h3>
                          <p className="text-sm text-muted-foreground">
                            {correlation.token_name || correlation.token_symbol || 'Unknown Token'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {(correlation.correlation_score * 100).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">correlation</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-2">Risk Level:</p>
                      <Badge variant={getRiskBadgeVariant(correlation.risk_level)}>
                        {correlation.risk_level || 'Unknown'}
                      </Badge>
                    </div>
                    
                    {correlation.recommendation_text && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">💡 Recommendation:</p>
                        <p className="text-sm">{correlation.recommendation_text}</p>
                      </div>
                    )}
                  </div>
                )) || []
              )}
            </div>
          </TabsContent>

          {/* Keywords Tab */}
          <TabsContent value="keywords" className="space-y-4">
            <div className="grid gap-4">
              {data.trendingKeywords.map((keyword, index) => (
                <div key={keyword.keyword} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-sm">
                        #{index + 1}
                      </Badge>
                      <div>
                        <h3 className="font-semibold text-lg">#{keyword.keyword}</h3>
                        <p className="text-sm text-muted-foreground">
                          Platform: {keyword.platform}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {keyword.frequency}
                      </div>
                      <p className="text-xs text-muted-foreground">mentions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`text-lg ${getTrendColor(keyword.trend_direction)}`}>
                      {getTrendIcon(keyword.trend_direction)}
                    </span>
                    <span className={`text-sm font-medium ${getTrendColor(keyword.trend_direction)}`}>
                      Trend: {keyword.trend_direction.charAt(0).toUpperCase() + keyword.trend_direction.slice(1)}
                    </span>
                  </div>
                  
                  {keyword.related_tokens && keyword.related_tokens.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-2">Related Tokens:</p>
                      <div className="flex flex-wrap gap-2">
                        {keyword.related_tokens.map((token, tokenIndex) => (
                          <Badge key={tokenIndex} variant="secondary" className="text-xs">
                            {token}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 text-xs text-muted-foreground">
                    Last seen: {formatTimeAgo(keyword.last_seen)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {/* AI Insights */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🤖 AI-Generated Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">🚀 High Potential Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Tokens with high correlation scores and growing social activity
                    </p>
                    <div className="mt-3">
                      <Badge variant="default">Strong Buy Signal</Badge>
                      <Badge variant="secondary" className="ml-2">High Correlation</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">⚠️ Risk Warnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Patterns indicating potential market manipulation or decline
                    </p>
                    <div className="mt-3">
                      <Badge variant="destructive">High Risk</Badge>
                      <Badge variant="outline" className="ml-2">Declining Activity</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Trading Signals */}
            <div>
              <h3 className="text-lg font-semibold mb-3">📊 Trading Signal Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🚀</span>
                    <div>
                      <div className="font-semibold">Strong Buy Signals</div>
                      <div className="text-sm text-muted-foreground">High correlation + volume growth</div>
                    </div>
                  </div>
                  <Badge variant="default">Strong</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <div className="font-semibold">Watch List</div>
                      <div className="text-sm text-muted-foreground">Growing social activity</div>
                    </div>
                  </div>
                  <Badge variant="secondary">Moderate</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <div className="font-semibold">Risk Alerts</div>
                      <div className="text-sm text-muted-foreground">Declining patterns</div>
                    </div>
                  </div>
                  <Badge variant="destructive">High Risk</Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <Button onClick={fetchPatternAnalysisData} variant="outline" size="sm">
              🔄 Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
