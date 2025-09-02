export interface TikTokData {
  url: string;
  username: string;
  views: number;
  comments: string[];
  hashtags: string[];
  description: string;
  timestamp: string;
}

export interface TokenData {
  name: string;
  symbol: string;
  uri: string;
  market_cap: number;
  volume_24h: number;
  price_change_24h: number;
  created_timestamp: string;
}

export interface KeywordMatch {
  keyword: string;
  tiktok_mentions: number;
  token_names: string[];
}

export interface AnalysisSummary {
  timestamp: string;
  confidence_score: number;
  overall_recommendation: 'BUY' | 'HOLD' | 'AVOID' | 'ERROR';
  key_insights: string[];
}

export interface TokenAnalysis {
  token_symbol: string;
  sentiment_score: number;
  viral_potential: number;
  credibility_score: number;
  risk_level: number;
  correlation_strength: number;
  recommendation: string;
  reasoning: string;
}

export interface CreatorAnalysis {
  username: string;
  credibility_score: number;
  historical_success_rate: number;
  follower_quality: 'low' | 'medium' | 'high';
  influence_level: 'low' | 'medium' | 'high';
}

export interface MarketSignals {
  momentum_indicator: 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish' | 'error' | 'unknown';
  manipulation_risk: 'low' | 'medium' | 'high' | 'unknown';
  viral_trajectory: 'early_stage' | 'growing' | 'peaking' | 'declining' | 'unknown';
  recommended_action: 'buy_now' | 'monitor_closely' | 'hold' | 'sell' | 'avoid' | 'manual_review' | 'retry_analysis';
}

export interface Predictions {
  '24h_outlook': 'positive' | 'negative' | 'neutral' | 'unknown';
  viral_probability: number;
  price_movement_prediction: 'strong_upward' | 'moderate_upward' | 'stable' | 'moderate_downward' | 'strong_downward' | 'unknown';
  timeline_to_peak: string;
}

export interface AnalysisMetadata {
  analysis_timestamp: string;
  data_sources: {
    tiktok_videos: number;
    tokens_analyzed: number;
    keyword_matches: number;
  };
  model_used: string;
  processing_time_ms?: number;
}

export interface AIAnalysisResult {
  analysis_summary: AnalysisSummary;
  token_analysis: TokenAnalysis[];
  creator_analysis: CreatorAnalysis[];
  market_signals: MarketSignals;
  predictions: Predictions;
  metadata: AnalysisMetadata;
  error?: {
    message: string;
    timestamp: string;
  };
}

export interface AnalysisRequest {
  tiktok_data: TikTokData[];
  token_data: TokenData[];
  keyword_matches: KeywordMatch[];
}

class AIAnalysisService {
  private analysisCache: Map<string, AIAnalysisResult> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Generate cache key from request data
  private generateCacheKey(request: AnalysisRequest): string {
    const dataHash = JSON.stringify({
      tiktok_count: request.tiktok_data.length,
      token_count: request.token_data.length,
      keyword_count: request.keyword_matches.length,
      timestamp: Math.floor(Date.now() / (5 * 60 * 1000)) // 5-minute buckets
    });
    return btoa(dataHash).slice(0, 16);
  }

  // Check if cached analysis is still valid
  private isCacheValid(cachedResult: AIAnalysisResult): boolean {
    const cacheAge = Date.now() - new Date(cachedResult.metadata.analysis_timestamp).getTime();
    return cacheAge < this.cacheTimeout;
  }

  // Analyze memecoin data using OpenAI
  async analyzeMemecoinData(request: AnalysisRequest): Promise<AIAnalysisResult> {
    try {
      console.log('🤖 Starting AI memecoin analysis...');

      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cachedResult = this.analysisCache.get(cacheKey);
      
      if (cachedResult && this.isCacheValid(cachedResult)) {
        console.log('📋 Using cached analysis result');
        return cachedResult;
      }

      // Prepare request data
      const requestData = {
        tiktok_data: request.tiktok_data,
        token_data: request.token_data,
        keyword_matches: request.keyword_matches
      };

      console.log(`📊 Analyzing ${request.tiktok_data.length} TikTok videos, ${request.token_data.length} tokens, ${request.keyword_matches.length} keyword matches`);

      // Call the AI analysis API
      const response = await fetch('/api/ai/memecoin-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`AI analysis API error: ${response.status} ${response.statusText}`);
      }

      const result: AIAnalysisResult = await response.json();

      // Cache the result
      this.analysisCache.set(cacheKey, result);

      console.log('✅ AI analysis completed successfully');
      return result;

    } catch (error) {
      console.error('❌ Error in AI analysis:', error);
      
      // Return error result
      const errorResult: AIAnalysisResult = {
        analysis_summary: {
          timestamp: new Date().toISOString(),
          confidence_score: 0.0,
          overall_recommendation: 'ERROR',
          key_insights: [`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
        },
        token_analysis: [],
        creator_analysis: [],
        market_signals: {
          momentum_indicator: 'error',
          manipulation_risk: 'unknown',
          viral_trajectory: 'unknown',
          recommended_action: 'retry_analysis'
        },
        predictions: {
          '24h_outlook': 'unknown',
          viral_probability: 0.0,
          price_movement_prediction: 'unknown',
          timeline_to_peak: 'unknown'
        },
        metadata: {
          analysis_timestamp: new Date().toISOString(),
          data_sources: {
            tiktok_videos: request.tiktok_data.length,
            tokens_analyzed: request.token_data.length,
            keyword_matches: request.keyword_matches.length
          },
          model_used: 'error'
        },
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };

      return errorResult;
    }
  }

  // Fetch recent analysis results
  async getRecentAnalysis(): Promise<AIAnalysisResult | null> {
    try {
      console.log('📊 Fetching recent AI analysis results...');

      const response = await fetch('/api/ai/memecoin-analysis', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recent analysis: ${response.status}`);
      }

      const result: AIAnalysisResult = await response.json();
      console.log('✅ Recent analysis fetched successfully');
      return result;

    } catch (error) {
      console.error('❌ Error fetching recent analysis:', error);
      return null;
    }
  }

  // Get recommendation color based on recommendation
  getRecommendationColor(recommendation: string): string {
    switch (recommendation.toUpperCase()) {
      case 'BUY':
        return 'text-green-500';
      case 'HOLD':
        return 'text-yellow-500';
      case 'AVOID':
        return 'text-red-500';
      case 'ERROR':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  }

  // Get recommendation badge variant
  getRecommendationBadgeVariant(recommendation: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (recommendation.toUpperCase()) {
      case 'BUY':
        return 'default';
      case 'HOLD':
        return 'secondary';
      case 'AVOID':
        return 'destructive';
      case 'ERROR':
        return 'outline';
      default:
        return 'outline';
    }
  }

  // Get momentum indicator color
  getMomentumColor(momentum: string): string {
    switch (momentum) {
      case 'strong_bullish':
        return 'text-green-600';
      case 'bullish':
        return 'text-green-500';
      case 'neutral':
        return 'text-yellow-500';
      case 'bearish':
        return 'text-red-500';
      case 'strong_bearish':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  }

  // Get risk level color
  getRiskColor(riskLevel: number): string {
    if (riskLevel <= 3) return 'text-green-500';
    if (riskLevel <= 6) return 'text-yellow-500';
    return 'text-red-500';
  }

  // Get confidence level color
  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  }

  // Format confidence score as percentage
  formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
  }

  // Format viral probability as percentage
  formatViralProbability(probability: number): string {
    return `${Math.round(probability * 100)}%`;
  }

  // Clear cache
  clearCache(): void {
    this.analysisCache.clear();
    console.log('🗑️ AI analysis cache cleared');
  }

  // Get cache size
  getCacheSize(): number {
    return this.analysisCache.size;
  }
}

// Create singleton instance
export const aiAnalysisService = new AIAnalysisService();

// Export for use in components
export default aiAnalysisService;
