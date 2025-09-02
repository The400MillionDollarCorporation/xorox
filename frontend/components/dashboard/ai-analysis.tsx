'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Users,
  Target,
  Clock,
  RefreshCw,
  BarChart3,
  Zap,
  Eye
} from 'lucide-react';
import { 
  aiAnalysisService, 
  AIAnalysisResult, 
  TikTokData, 
  TokenData, 
  KeywordMatch 
} from '@/lib/ai-analysis-service';

interface AIAnalysisProps {
  className?: string;
}

export default function AIAnalysis({ className }: AIAnalysisProps) {
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  // Mock data for demonstration - in production, this would come from your data sources
  const mockTikTokData: TikTokData[] = [
    {
      url: "https://tiktok.com/@crypto_whale_2024/video/1234567890",
      username: "crypto_whale_2024",
      views: 125000,
      comments: ["🚀🚀🚀", "This is going to moon!", "Diamond hands!", "When lambo?"],
      hashtags: ["#memecoin", "#pump", "#moon", "#crypto"],
      description: "Just discovered this new memecoin that's about to explode! 🚀",
      timestamp: new Date().toISOString()
    },
    {
      url: "https://tiktok.com/@memecoin_hunter/video/1234567891",
      username: "memecoin_hunter",
      views: 89000,
      comments: ["LFG!", "To the moon!", "This is the one!"],
      hashtags: ["#memecoin", "#solana", "#pump"],
      description: "Another gem found! This one has serious potential 💎",
      timestamp: new Date().toISOString()
    }
  ];

  const mockTokenData: TokenData[] = [
    {
      name: "Pepe Coin",
      symbol: "PEPE",
      uri: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      market_cap: 1500000,
      volume_24h: 250000,
      price_change_24h: 0.15,
      created_timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: "Doge Killer",
      symbol: "DOGEK",
      uri: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      market_cap: 800000,
      volume_24h: 180000,
      price_change_24h: -0.05,
      created_timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const mockKeywordMatches: KeywordMatch[] = [
    {
      keyword: "memecoin",
      tiktok_mentions: 15,
      token_names: ["PEPE", "DOGEK"]
    },
    {
      keyword: "pump",
      tiktok_mentions: 8,
      token_names: ["PEPE"]
    }
  ];

  const runAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🤖 Running AI analysis...');

      const result = await aiAnalysisService.analyzeMemecoinData({
        tiktok_data: mockTikTokData,
        token_data: mockTokenData,
        keyword_matches: mockKeywordMatches
      });

      setAnalysisResult(result);
      setLastAnalysis(new Date());
      console.log('✅ Analysis completed');

    } catch (err) {
      console.error('❌ Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await aiAnalysisService.getRecentAnalysis();
      if (result) {
        setAnalysisResult(result);
        setLastAnalysis(new Date(result.metadata.analysis_timestamp));
      }

    } catch (err) {
      console.error('❌ Failed to load recent analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load recent analysis on component mount
    loadRecentAnalysis();
  }, []);

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation.toUpperCase()) {
      case 'BUY':
        return <TrendingUp className="h-4 w-4" />;
      case 'HOLD':
        return <Clock className="h-4 w-4" />;
      case 'AVOID':
        return <TrendingDown className="h-4 w-4" />;
      case 'ERROR':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'strong_bullish':
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish':
      case 'strong_bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Memecoin Analysis
            </CardTitle>
            <CardDescription>
              OpenAI-powered analysis of TikTok trends and token data
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={runAnalysis}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Analysis Error:</span>
              <span>{error}</span>
            </div>
            <Button
              onClick={runAnalysis}
              variant="outline"
              size="sm"
              className="mt-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Try Again
            </Button>
          </div>
        )}

        {loading && !analysisResult && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#F8D12E]/20 border-t-[#F8D12E] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">AI is analyzing memecoin data...</p>
          </div>
        )}

        {analysisResult && (
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="creators">Creators</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              {/* Analysis Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getRecommendationIcon(analysisResult.analysis_summary.overall_recommendation)}
                      <span className="font-semibold">Overall Recommendation</span>
                    </div>
                    <Badge 
                      variant={aiAnalysisService.getRecommendationBadgeVariant(analysisResult.analysis_summary.overall_recommendation)}
                      className="text-lg px-3 py-1"
                    >
                      {analysisResult.analysis_summary.overall_recommendation}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" />
                      <span className="font-semibold">Confidence Score</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${aiAnalysisService.getConfidenceColor(analysisResult.analysis_summary.confidence_score)}`}>
                          {aiAnalysisService.formatConfidence(analysisResult.analysis_summary.confidence_score)}
                        </span>
                      </div>
                      <Progress 
                        value={analysisResult.analysis_summary.confidence_score * 100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getMomentumIcon(analysisResult.market_signals.momentum_indicator)}
                      <span className="font-semibold">Market Momentum</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-lg px-3 py-1 ${aiAnalysisService.getMomentumColor(analysisResult.market_signals.momentum_indicator)}`}
                    >
                      {analysisResult.market_signals.momentum_indicator.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Key Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.analysis_summary.key_insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Market Signals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Market Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Manipulation Risk</div>
                      <Badge variant="outline" className="mt-1">
                        {analysisResult.market_signals.manipulation_risk}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Viral Trajectory</div>
                      <Badge variant="outline" className="mt-1">
                        {analysisResult.market_signals.viral_trajectory.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Recommended Action</div>
                      <Badge variant="outline" className="mt-1">
                        {analysisResult.market_signals.recommended_action.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Viral Probability</div>
                      <div className={`text-lg font-bold ${aiAnalysisService.getConfidenceColor(analysisResult.predictions.viral_probability)}`}>
                        {aiAnalysisService.formatViralProbability(analysisResult.predictions.viral_probability)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tokens" className="space-y-4">
              {analysisResult.token_analysis.length > 0 ? (
                <div className="space-y-4">
                  {analysisResult.token_analysis.map((token, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            {token.token_symbol}
                          </CardTitle>
                          <Badge 
                            variant={aiAnalysisService.getRecommendationBadgeVariant(token.recommendation)}
                          >
                            {token.recommendation}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Sentiment</div>
                            <div className={`text-lg font-bold ${token.sentiment_score >= 7 ? 'text-green-500' : token.sentiment_score >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {token.sentiment_score.toFixed(1)}/10
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Viral Potential</div>
                            <div className={`text-lg font-bold ${token.viral_potential >= 7 ? 'text-green-500' : token.viral_potential >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {token.viral_potential.toFixed(1)}/10
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Credibility</div>
                            <div className={`text-lg font-bold ${token.credibility_score >= 7 ? 'text-green-500' : token.credibility_score >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {token.credibility_score.toFixed(1)}/10
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Risk Level</div>
                            <div className={`text-lg font-bold ${aiAnalysisService.getRiskColor(token.risk_level)}`}>
                              {token.risk_level.toFixed(1)}/10
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Recommendation: </span>
                            <span>{token.recommendation}</span>
                          </div>
                          <div>
                            <span className="font-medium">Reasoning: </span>
                            <span className="text-sm text-muted-foreground">{token.reasoning}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No token analysis available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="creators" className="space-y-4">
              {analysisResult.creator_analysis.length > 0 ? (
                <div className="space-y-4">
                  {analysisResult.creator_analysis.map((creator, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          @{creator.username}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Credibility</div>
                            <div className={`text-lg font-bold ${creator.credibility_score >= 7 ? 'text-green-500' : creator.credibility_score >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {creator.credibility_score.toFixed(1)}/10
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Success Rate</div>
                            <div className={`text-lg font-bold ${creator.historical_success_rate >= 0.7 ? 'text-green-500' : creator.historical_success_rate >= 0.4 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {Math.round(creator.historical_success_rate * 100)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Follower Quality</div>
                            <Badge variant="outline" className="mt-1">
                              {creator.follower_quality}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Influence Level</div>
                            <Badge variant="outline" className="mt-1">
                              {creator.influence_level}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No creator analysis available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="predictions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      24h Outlook
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Badge 
                        variant={analysisResult.predictions['24h_outlook'] === 'positive' ? 'default' : 
                                analysisResult.predictions['24h_outlook'] === 'negative' ? 'destructive' : 'secondary'}
                        className="text-lg px-4 py-2"
                      >
                        {analysisResult.predictions['24h_outlook'].toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Price Movement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        {analysisResult.predictions.price_movement_prediction.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Timeline to Peak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {analysisResult.predictions.timeline_to_peak.replace('_', ' ')}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Analysis Metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model:</span>
                        <span>{analysisResult.metadata.model_used}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">TikTok Videos:</span>
                        <span>{analysisResult.metadata.data_sources.tiktok_videos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tokens Analyzed:</span>
                        <span>{analysisResult.metadata.data_sources.tokens_analyzed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>{new Date(analysisResult.metadata.analysis_timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {!analysisResult && !loading && !error && (
          <div className="text-center py-12 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No analysis data available</p>
            <p className="text-sm">Click &quot;Run Analysis&quot; to generate AI insights</p>
          </div>
        )}

        {lastAnalysis && (
          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            Last analysis: {lastAnalysis.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
