import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

class MemecoinPatternAnalyzer {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    this.resultsDir = path.join(process.cwd(), 'analysis_results');
    this.ensureResultsDirectory();
  }

  async ensureResultsDirectory() {
    try {
      await fs.mkdir(this.resultsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating results directory:', error);
    }
  }

  /**
   * Cross-reference TikTok trends with Pump.fun token database
   */
  async analyzeTikTokTokenCorrelation() {
    try {
      console.log('🔍 Analyzing TikTok trends vs Pump.fun tokens...');
      
      // Get TikTok data from last 24 hours
      const tiktokData = await this.getRecentTikTokData();
      console.log(`📱 Found ${tiktokData.length} recent TikTok videos`);
      
      // Get recent token launches from Pump.fun
      const tokenData = await this.getRecentTokenLaunches();
      console.log(`🪙 Found ${tokenData.length} recent token launches`);
      
      // Extract trending keywords from TikTok
      const trendingKeywords = this.extractTrendingKeywords(tiktokData);
      console.log(`📊 Trending keywords: ${trendingKeywords.join(', ')}`);
      
      // Match keywords to token launches
      const matches = this.matchKeywordsToTokens(trendingKeywords, tokenData);
      console.log(`🎯 Found ${matches.length} keyword-token matches`);
      
      // Calculate correlation metrics
      const correlationData = await this.calculateCorrelationMetrics(tiktokData, tokenData, matches);
      
      // Generate analysis report
      const report = this.generateTikTokAnalysisReport(tiktokData, tokenData, matches, correlationData);
      
      // Store results in Supabase
      await this.storeAnalysisResults('tiktok', 'tiktok', report);
      
      // Also save to file as backup
      await this.saveAnalysisResults('tiktok_token_correlation', report);
      
      return report;
    } catch (error) {
      console.error('Error in TikTok token correlation analysis:', error);
      throw error;
    }
  }

  /**
   * Cross-reference Telegram trends with Pump.fun token database
   */
  async analyzeTelegramTokenCorrelation() {
    try {
      console.log('📡 Analyzing Telegram trends vs Pump.fun tokens...');
      
      // Get Telegram data from last 24 hours
      const telegramData = await this.getRecentTelegramData();
      console.log(`💬 Found ${telegramData.length} recent Telegram messages`);
      
      // Get recent token launches from Pump.fun
      const tokenData = await this.getRecentTokenLaunches();
      console.log(`🪙 Found ${tokenData.length} recent token launches`);
      
      // Extract trending keywords from Telegram
      const trendingKeywords = this.extractTelegramTrendingKeywords(telegramData);
      console.log(`📊 Trending keywords: ${trendingKeywords.join(', ')}`);
      
      // Match keywords to token launches
      const matches = this.matchKeywordsToTokens(trendingKeywords, tokenData);
      console.log(`🎯 Found ${matches.length} keyword-token matches`);
      
      // Calculate correlation metrics
      const correlationData = await this.calculateCorrelationMetrics(telegramData, tokenData, matches);
      
      // Generate analysis report
      const report = this.generateTelegramAnalysisReport(telegramData, tokenData, matches, correlationData);
      
      // Store results in Supabase
      await this.storeAnalysisResults('telegram', 'telegram', report);
      
      // Also save to file as backup
      await this.saveAnalysisResults('telegram_token_correlation', report);
      
      return report;
    } catch (error) {
      console.error('Error in Telegram token correlation analysis:', error);
      throw error;
    }
  }

  /**
   * Get recent TikTok data from database
   */
  async getRecentTikTokData() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const { data, error } = await this.supabase
        .from('tiktoks')
        .select(`
          *,
          mentions (
            count,
            mention_at,
            tokens (
              name,
              symbol,
              uri,
              created_at
            )
          )
        `)
        .gte('fetched_at', twentyFourHoursAgo.toISOString())
        .order('fetched_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching TikTok data:', error);
      return [];
    }
  }

  /**
   * Get recent Telegram data from database
   */
  async getRecentTelegramData() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const { data, error } = await this.supabase
        .from('telegram_messages')
        .select('*')
        .gte('scraped_at', twentyFourHoursAgo.toISOString())
        .order('scraped_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching Telegram data:', error);
      return [];
    }
  }

  /**
   * Get recent token launches from Pump.fun database
   */
  async getRecentTokenLaunches() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const { data, error } = await this.supabase
        .from('tokens')
        .select('*')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching token data:', error);
      return [];
    }
  }

  /**
   * Extract trending keywords from TikTok data
   */
  extractTrendingKeywords(tiktokData) {
    const keywordCounts = {};
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);

    tiktokData.forEach(video => {
      if (video.mentions && video.mentions.length > 0) {
        video.mentions.forEach(mention => {
          if (mention.tokens && mention.tokens.name) {
            const words = mention.tokens.name.toLowerCase().split(/\s+/);
            words.forEach(word => {
              if (word.length > 2 && !commonWords.has(word)) {
                keywordCounts[word] = (keywordCounts[word] || 0) + 1;
              }
            });
          }
        });
      }
    });

    // Sort by frequency and return top keywords
    return Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([keyword]) => keyword);
  }

  /**
   * Extract trending keywords from Telegram data
   */
  extractTelegramTrendingKeywords(telegramData) {
    const keywordCounts = {};
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);

    telegramData.forEach(message => {
      if (message.text) {
        const words = message.text.toLowerCase().split(/\s+/);
        words.forEach(word => {
          // Clean word (remove punctuation, etc.)
          const cleanWord = word.replace(/[^\w]/g, '');
          if (cleanWord.length > 2 && !commonWords.has(cleanWord)) {
            keywordCounts[cleanWord] = (keywordCounts[cleanWord] || 0) + 1;
          }
        });
      }
    });

    // Sort by frequency and return top keywords
    return Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([keyword]) => keyword);
  }

  /**
   * Match trending keywords to token launches
   */
  matchKeywordsToTokens(keywords, tokens) {
    const matches = [];
    
    keywords.forEach(keyword => {
      const matchingTokens = tokens.filter(token => {
        const tokenName = token.name?.toLowerCase() || '';
        const tokenSymbol = token.symbol?.toLowerCase() || '';
        const tokenUri = token.uri?.toLowerCase() || '';
        
        return tokenName.includes(keyword) || 
               tokenSymbol.includes(keyword) || 
               tokenUri.includes(keyword);
      });
      
      if (matchingTokens.length > 0) {
        matches.push({
          keyword,
          tokens: matchingTokens,
          matchCount: matchingTokens.length
        });
      }
    });
    
    return matches;
  }

  /**
   * Calculate correlation between social metrics and trading volume
   */
  async calculateCorrelationMetrics(socialData, tokenData, matches) {
    try {
      console.log('📈 Calculating correlation metrics...');
      
      const correlations = [];
      
      for (const match of matches) {
        const token = match.tokens[0]; // Use first matching token
        
        // Get price data for the token
        const priceData = await this.getTokenPriceData(token.uri);
        
        if (priceData && priceData.length > 0) {
          // Calculate social engagement metrics
          const socialMetrics = this.calculateSocialMetrics(socialData, match.keyword);
          
          // Calculate trading volume metrics
          const tradingMetrics = this.calculateTradingMetrics(priceData);
          
          // Calculate correlation coefficient
          const correlation = this.calculateCorrelationCoefficient(socialMetrics, tradingMetrics);
          
          correlations.push({
            keyword: match.keyword,
            token: token,
            socialMetrics,
            tradingMetrics,
            correlation,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      return correlations;
    } catch (error) {
      console.error('Error calculating correlation metrics:', error);
      return [];
    }
  }

  /**
   * Get token price data from database
   */
  async getTokenPriceData(tokenUri) {
    try {
      const { data, error } = await this.supabase
        .from('prices')
        .select('*')
        .eq('token_uri', tokenUri)
        .order('trade_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching price data:', error);
      return [];
    }
  }

  /**
   * Calculate social engagement metrics
   */
  calculateSocialMetrics(socialData, keyword) {
    const relevantData = socialData.filter(item => {
      if (item.text) {
        return item.text.toLowerCase().includes(keyword.toLowerCase());
      }
      if (item.mentions) {
        return item.mentions.some(mention => 
          mention.tokens?.name?.toLowerCase().includes(keyword.toLowerCase())
        );
      }
      return false;
    });

    return {
      count: relevantData.length,
      totalViews: relevantData.reduce((sum, item) => sum + (item.views || 0), 0),
      totalComments: relevantData.reduce((sum, item) => sum + (item.comments || 0), 0),
      engagementRate: relevantData.length > 0 ? 
        (relevantData.reduce((sum, item) => sum + (item.views || 0), 0) / relevantData.length) : 0
    };
  }

  /**
   * Calculate trading volume metrics
   */
  calculateTradingMetrics(priceData) {
    if (priceData.length === 0) return { volume: 0, priceChange: 0, volatility: 0 };
    
    const prices = priceData.map(item => parseFloat(item.price_usd || 0)).filter(p => p > 0);
    const volumes = priceData.map(item => parseFloat(item.price_sol || 0)).filter(v => v > 0);
    
    if (prices.length === 0) return { volume: 0, priceChange: 0, volatility: 0 };
    
    const firstPrice = prices[prices.length - 1];
    const lastPrice = prices[0];
    const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    
    // Calculate volatility (standard deviation of price changes)
    const priceChanges = [];
    for (let i = 1; i < prices.length; i++) {
      if (prices[i-1] > 0) {
        priceChanges.push(((prices[i] - prices[i-1]) / prices[i-1]) * 100);
      }
    }
    
    const volatility = priceChanges.length > 0 ? 
      Math.sqrt(priceChanges.reduce((sum, change) => sum + change * change, 0) / priceChanges.length) : 0;
    
    return {
      volume: avgVolume,
      priceChange,
      volatility
    };
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  calculateCorrelationCoefficient(socialMetrics, tradingMetrics) {
    // Simplified correlation calculation
    // In a real implementation, you'd want more sophisticated statistical analysis
    
    const socialScore = socialMetrics.engagementRate * socialMetrics.count;
    const tradingScore = Math.abs(tradingMetrics.priceChange) * tradingMetrics.volume;
    
    if (socialScore === 0 || tradingScore === 0) return 0;
    
    // Normalize scores and calculate correlation
    const correlation = Math.min(1, Math.max(-1, (socialScore * tradingScore) / (socialScore + tradingScore)));
    
    return correlation;
  }

  /**
   * Generate TikTok analysis report
   */
  generateTikTokAnalysisReport(tiktokData, tokenData, matches, correlationData) {
    const report = {
      timestamp: new Date().toISOString(),
      platform: 'TikTok',
      summary: {
        totalVideos: tiktokData.length,
        totalTokens: tokenData.length,
        keywordMatches: matches.length,
        averageCorrelation: correlationData.length > 0 ? 
          correlationData.reduce((sum, item) => sum + item.correlation, 0) / correlationData.length : 0
      },
      trendingKeywords: matches.map(match => ({
        keyword: match.keyword,
        matchCount: match.matchCount,
        tokens: match.tokens.map(token => ({
          name: token.name,
          symbol: token.symbol,
          uri: token.uri,
          created_at: token.created_at
        }))
      })),
      correlations: correlationData,
      recommendations: this.generateRecommendations(correlationData, 'TikTok')
    };
    
    return report;
  }

  /**
   * Generate Telegram analysis report
   */
  generateTelegramAnalysisReport(telegramData, tokenData, matches, correlationData) {
    const report = {
      timestamp: new Date().toISOString(),
      platform: 'Telegram',
      summary: {
        totalMessages: telegramData.length,
        totalTokens: tokenData.length,
        keywordMatches: matches.length,
        averageCorrelation: correlationData.length > 0 ? 
          correlationData.reduce((sum, item) => sum + item.correlation, 0) / correlationData.length : 0
      },
      trendingKeywords: matches.map(match => ({
        keyword: match.keyword,
        matchCount: match.matchCount,
        tokens: match.tokens.map(token => ({
          name: token.name,
          symbol: token.symbol,
          uri: token.uri,
          created_at: token.created_at
        }))
      })),
      correlations: correlationData,
      recommendations: this.generateRecommendations(correlationData, 'Telegram')
    };
    
    return report;
  }

  /**
   * Generate trading recommendations based on analysis
   */
  generateRecommendations(correlationData, platform) {
    const recommendations = [];
    
    // Sort by correlation strength
    const sortedCorrelations = correlationData
      .filter(item => item.correlation > 0.3) // Only consider positive correlations
      .sort((a, b) => b.correlation - a.correlation);
    
    sortedCorrelations.slice(0, 5).forEach((item, index) => {
      recommendations.push({
        rank: index + 1,
        keyword: item.keyword,
        token: item.token.name,
        correlation: item.correlation,
        socialEngagement: item.socialMetrics.engagementRate,
        priceChange: item.tradingMetrics.priceChange,
        recommendation: this.getRecommendationText(item.correlation, item.tradingMetrics.priceChange),
        risk: this.assessRisk(item.correlation, item.tradingMetrics.volatility)
      });
    });
    
    return recommendations;
  }

  /**
   * Get recommendation text based on correlation and price change
   */
  getRecommendationText(correlation, priceChange) {
    if (correlation > 0.7 && priceChange > 0) {
      return 'Strong buy signal - High social engagement correlates with positive price movement';
    } else if (correlation > 0.5 && priceChange > 0) {
      return 'Moderate buy signal - Good correlation between social trends and price';
    } else if (correlation > 0.3 && priceChange < 0) {
      return 'Watch for reversal - High social engagement but declining price may indicate oversold condition';
    } else {
      return 'Monitor - Low correlation between social trends and price movement';
    }
  }

  /**
   * Assess risk level
   */
  assessRisk(correlation, volatility) {
    if (correlation > 0.7 && volatility < 50) return 'Low';
    if (correlation > 0.5 && volatility < 100) return 'Medium';
    if (correlation > 0.3 && volatility < 150) return 'High';
    return 'Very High';
  }

  /**
   * Store analysis results in Supabase database
   */
  async storeAnalysisResults(analysisType, platform, data) {
    try {
      console.log(`💾 Storing ${analysisType} analysis results in Supabase...`);
      
      // Store main analysis result
      const { data: analysisResult, error: analysisError } = await this.supabase
        .from('pattern_analysis_results')
        .insert({
          analysis_type: analysisType,
          platform: platform,
          timestamp: new Date().toISOString(),
          summary: data.summary,
          trending_keywords: data.trendingKeywords || [],
          correlations: data.correlations || [],
          recommendations: data.recommendations || [],
          metadata: {
            total_records: data.summary?.totalVideos || data.summary?.totalMessages || 0,
            analysis_version: '1.0.0',
            generated_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (analysisError) throw analysisError;
      console.log(`✅ Analysis result stored with ID: ${analysisResult.id}`);

      // Store individual correlations
      if (data.correlations && data.correlations.length > 0) {
        const correlationRecords = data.correlations.map(corr => ({
          analysis_id: analysisResult.id,
          keyword: corr.keyword,
          token_name: corr.token?.name,
          token_symbol: corr.token?.symbol,
          token_uri: corr.token?.uri,
          correlation_score: corr.correlation,
          social_metrics: corr.socialMetrics,
          trading_metrics: corr.tradingMetrics,
          risk_level: this.assessRisk(corr.correlation, corr.tradingMetrics?.volatility || 0),
          recommendation_text: this.getRecommendationText(corr.correlation, corr.tradingMetrics?.priceChange || 0)
        }));

        const { error: correlationsError } = await this.supabase
          .from('pattern_correlations')
          .insert(correlationRecords);

        if (correlationsError) {
          console.error('Error storing correlations:', correlationsError);
        } else {
          console.log(`✅ Stored ${correlationRecords.length} correlation records`);
        }
      }

      // Update trending keywords
      await this.updateTrendingKeywords(data.trendingKeywords || [], platform);

      return analysisResult.id;
    } catch (error) {
      console.error('Error storing analysis results in Supabase:', error);
      throw error;
    }
  }

  /**
   * Update trending keywords in database
   */
  async updateTrendingKeywords(keywords, platform) {
    try {
      for (const keywordData of keywords) {
        const keyword = keywordData.keyword;
        
        // Check if keyword already exists
        const { data: existingKeyword } = await this.supabase
          .from('trending_keywords')
          .select('*')
          .eq('keyword', keyword)
          .eq('platform', platform)
          .single();

        if (existingKeyword) {
          // Update existing keyword
          await this.supabase
            .from('trending_keywords')
            .update({
              frequency: existingKeyword.frequency + 1,
              last_seen: new Date().toISOString(),
              total_mentions: existingKeyword.total_mentions + (keywordData.matchCount || 1)
            })
            .eq('id', existingKeyword.id);
        } else {
          // Insert new keyword
          await this.supabase
            .from('trending_keywords')
            .insert({
              keyword: keyword,
              platform: platform,
              frequency: 1,
              total_mentions: keywordData.matchCount || 1
            });
        }
      }
      console.log(`✅ Updated trending keywords for ${platform}`);
    } catch (error) {
      console.error('Error updating trending keywords:', error);
    }
  }

  /**
   * Save analysis results to file (kept for backup)
   */
  async saveAnalysisResults(filename, data) {
    try {
      const filePath = path.join(this.resultsDir, `${filename}_${Date.now()}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`💾 Analysis results also saved to: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('Error saving analysis results to file:', error);
      // Don't throw error as this is just backup
    }
  }

  /**
   * Run comprehensive analysis
   */
  async runComprehensiveAnalysis() {
    try {
      console.log('🚀 Starting comprehensive memecoin pattern analysis...');
      
      // Run TikTok analysis
      const tiktokReport = await this.analyzeTikTokTokenCorrelation();
      
      // Run Telegram analysis
      const telegramReport = await this.analyzeTelegramTokenCorrelation();
      
      // Generate combined report
      const combinedReport = {
        timestamp: new Date().toISOString(),
        summary: {
          tiktok: tiktokReport.summary,
          telegram: telegramReport.summary,
          totalCorrelations: tiktokReport.correlations.length + telegramReport.correlations.length
        },
        platforms: {
          tiktok: tiktokReport,
          telegram: telegramReport
        },
        topRecommendations: this.combineTopRecommendations([
          ...tiktokReport.recommendations,
          ...telegramReport.recommendations
        ])
      };
      
      // Store combined report in Supabase
      await this.storeAnalysisResults('comprehensive', 'combined', combinedReport);
      
      // Also save to file as backup
      await this.saveAnalysisResults('comprehensive_analysis', combinedReport);
      
      console.log('✅ Comprehensive analysis completed successfully!');
      return combinedReport;
      
    } catch (error) {
      console.error('Error in comprehensive analysis:', error);
      throw error;
    }
  }

  /**
   * Combine and rank top recommendations from all platforms
   */
  combineTopRecommendations(allRecommendations) {
    return allRecommendations
      .sort((a, b) => b.correlation - a.correlation)
      .slice(0, 10)
      .map((rec, index) => ({
        ...rec,
        globalRank: index + 1
      }));
  }

  /**
   * Get latest analysis results from database
   */
  async getLatestAnalysisResults(analysisType = null, limit = 10) {
    try {
      let query = this.supabase
        .from('pattern_analysis_results')
        .select(`
          *,
          pattern_correlations (
            keyword,
            token_name,
            token_symbol,
            correlation_score,
            risk_level,
            recommendation_text
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (analysisType) {
        query = query.eq('analysis_type', analysisType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching analysis results:', error);
      return [];
    }
  }

  /**
   * Get trending keywords from database
   */
  async getTrendingKeywords(platform = null, limit = 20) {
    try {
      let query = this.supabase
        .from('trending_keywords')
        .select('*')
        .order('frequency', { ascending: false })
        .limit(limit);

      if (platform) {
        query = query.eq('platform', platform);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trending keywords:', error);
      return [];
    }
  }

  /**
   * Get correlation data for specific keyword
   */
  async getKeywordCorrelations(keyword, limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from('pattern_correlations')
        .select(`
          *,
          pattern_analysis_results (
            analysis_type,
            platform,
            timestamp
          )
        `)
        .eq('keyword', keyword)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching keyword correlations:', error);
      return [];
    }
  }

  /**
   * Get analysis summary statistics
   */
  async getAnalysisSummary() {
    try {
      const { data, error } = await this.supabase
        .from('pattern_analysis_results')
        .select('analysis_type, platform, timestamp, summary')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      const summary = {
        total_analyses: data.length,
        platforms: {},
        recent_activity: data.slice(0, 10).map(item => ({
          type: item.analysis_type,
          platform: item.platform,
          timestamp: item.timestamp,
          summary: item.summary
        }))
      };

      // Group by platform
      data.forEach(item => {
        if (!summary.platforms[item.platform]) {
          summary.platforms[item.platform] = 0;
        }
        summary.platforms[item.platform]++;
      });

      return summary;
    } catch (error) {
      console.error('Error fetching analysis summary:', error);
      return null;
    }
  }
}

// Export the class
export { MemecoinPatternAnalyzer };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new MemecoinPatternAnalyzer();
  analyzer.runComprehensiveAnalysis().catch(console.error);
}
