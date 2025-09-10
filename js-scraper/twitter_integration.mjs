import { createClient } from '@supabase/supabase-js';
import { TwitterApi } from 'twitter-api-v2';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cron from 'node-cron';

dotenv.config();

class TwitterIntegration {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    // Initialize Twitter client
    this.twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
    
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.volumeThreshold = 10000; // $10K threshold
    this.growthThreshold = 100; // 100% growth threshold
    this.postedAlerts = new Set(); // Track posted alerts to avoid duplicates
    
    // Initialize scheduled tasks
    this.initializeScheduledTasks();
  }

  /**
   * Initialize scheduled monitoring tasks
   */
  initializeScheduledTasks() {
    // Monitor volume growth every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.monitorVolumeGrowth();
    });
    
    // Monitor trending discoveries every 10 minutes
    cron.schedule('*/10 * * * *', () => {
      this.monitorTrendingDiscoveries();
    });
    
    // Post market analysis every 4 hours
    cron.schedule('0 */4 * * *', () => {
      this.postMarketAnalysis();
    });
    
    // Clear posted alerts cache every hour
    cron.schedule('0 * * * *', () => {
      this.postedAlerts.clear();
    });
    
    console.log('🕒 Twitter monitoring tasks scheduled');
  }

  /**
   * Monitor volume growth and post alerts
   */
  async monitorVolumeGrowth() {
    try {
      console.log('📊 Monitoring volume growth...');
      
      // Get recent price data from last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const { data: recentPrices, error } = await this.supabase
        .from('prices')
        .select(`
          *,
          tokens!fk_prices_token_uri (
            name,
            symbol,
            uri
          )
        `)
        .gte('trade_at', oneHourAgo.toISOString())
        .order('trade_at', { ascending: false });

      if (error) throw error;
      
      if (!recentPrices || recentPrices.length === 0) {
        console.log('No recent price data found');
        return;
      }

      // Group prices by token
      const tokenPrices = this.groupPricesByToken(recentPrices);
      
      // Analyze volume growth for each token
      for (const [tokenUri, prices] of Object.entries(tokenPrices)) {
        await this.analyzeTokenVolumeGrowth(tokenUri, prices);
      }
      
    } catch (error) {
      console.error('Error monitoring volume growth:', error);
    }
  }

  /**
   * Group price data by token
   */
  groupPricesByToken(prices) {
    const grouped = {};
    
    prices.forEach(price => {
      if (price.tokens?.uri) {
        if (!grouped[price.tokens.uri]) {
          grouped[price.tokens.uri] = [];
        }
        grouped[price.tokens.uri].push(price);
      }
    });
    
    return grouped;
  }

  /**
   * Analyze volume growth for a specific token
   */
  async analyzeTokenVolumeGrowth(tokenUri, prices) {
    try {
      if (prices.length < 2) return; // Need at least 2 data points
      
      // Sort by timestamp
      prices.sort((a, b) => new Date(a.trade_at) - new Date(b.trade_at));
      
      // Calculate hourly volume growth
      const hourlyVolumes = this.calculateHourlyVolumes(prices);
      
      if (hourlyVolumes.length < 2) return;
      
      // Calculate volume growth rate
      const currentHour = hourlyVolumes[hourlyVolumes.length - 1];
      const previousHour = hourlyVolumes[hourlyVolumes.length - 2];
      
      const volumeGrowth = currentHour.volume - previousHour.volume;
      const growthRate = previousHour.volume > 0 ? 
        ((currentHour.volume - previousHour.volume) / previousHour.volume) * 100 : 0;
      
      // Check if thresholds are met
      const alertKey = `${tokenUri}_volume_${currentHour.timestamp}`;
      
      if (volumeGrowth >= this.volumeThreshold && !this.postedAlerts.has(alertKey)) {
        await this.postVolumeGrowthAlert(tokenUri, volumeGrowth, currentHour.volume, previousHour.volume);
        this.postedAlerts.add(alertKey);
      }
      
      if (growthRate >= this.growthThreshold && !this.postedAlerts.has(alertKey)) {
        await this.postGrowthRateAlert(tokenUri, growthRate, currentHour.volume, previousHour.volume);
        this.postedAlerts.add(alertKey);
      }
      
    } catch (error) {
      console.error(`Error analyzing volume growth for ${tokenUri}:`, error);
    }
  }

  /**
   * Calculate hourly volumes from price data
   */
  calculateHourlyVolumes(prices) {
    const hourlyData = {};
    
    prices.forEach(price => {
      const hour = new Date(price.trade_at).toISOString().slice(0, 13) + ':00:00Z';
      
      if (!hourlyData[hour]) {
        hourlyData[hour] = {
          timestamp: hour,
          volume: 0,
          count: 0
        };
      }
      
      // Add volume (assuming price_sol represents volume in SOL)
      hourlyData[hour].volume += parseFloat(price.price_sol || 0);
      hourlyData[hour].count++;
    });
    
    return Object.values(hourlyData).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  /**
   * Post volume growth alert
   */
  async postVolumeGrowthAlert(tokenUri, volumeGrowth, currentVolume, previousVolume) {
    try {
      const token = await this.getTokenInfo(tokenUri);
      if (!token) return;
      
      // Generate AI-powered message
      const message = await this.generateVolumeGrowthMessage(token, volumeGrowth, currentVolume, previousVolume);
      
      const tweet = await this.postTweet(message);
      console.log(`🚀 Posted AI-generated volume growth alert for ${token.symbol}`);
      
      // Store alert in database
      await this.storeAlert('volume_growth', tokenUri, {
        volumeGrowth,
        currentVolume,
        previousVolume,
        message,
        aiGenerated: true
      }, tweet.data.id);
      
    } catch (error) {
      console.error('Error posting volume growth alert:', error);
    }
  }

  /**
   * Post growth rate alert
   */
  async postGrowthRateAlert(tokenUri, growthRate, currentVolume, previousVolume) {
    try {
      const token = await this.getTokenInfo(tokenUri);
      if (!token) return;
      
      // Generate AI-powered message
      const message = await this.generateGrowthRateMessage(token, growthRate, currentVolume, previousVolume);
      
      const tweet = await this.postTweet(message);
      console.log(`📈 Posted AI-generated growth rate alert for ${token.symbol}`);
      
      // Store alert in database
      await this.storeAlert('growth_rate', tokenUri, {
        growthRate,
        currentVolume,
        previousVolume,
        message,
        aiGenerated: true
      }, tweet.data.id);
      
    } catch (error) {
      console.error('Error posting growth rate alert:', error);
    }
  }

  /**
   * Monitor trending discoveries from pattern analysis
   */
  async monitorTrendingDiscoveries() {
    try {
      console.log('🔍 Monitoring trending discoveries...');
      
      // Get recent pattern analysis results
      const { data: analysisResults, error } = await this.supabase
        .from('pattern_analysis_results')
        .select(`
          *,
          pattern_correlations (
            keyword,
            token_name,
            token_symbol,
            correlation_score,
            risk_level
          )
        `)
        .gte('timestamp', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // Last 2 hours
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      if (!analysisResults || analysisResults.length === 0) {
        console.log('No recent analysis results found');
        return;
      }

      // Find high-correlation discoveries
      for (const result of analysisResults) {
        if (result.pattern_correlations && result.pattern_correlations.length > 0) {
          for (const correlation of result.pattern_correlations) {
            if (correlation.correlation_score >= 0.7) { // High correlation threshold
              await this.postTrendingDiscoveryAlert(result, correlation);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error monitoring trending discoveries:', error);
    }
  }

  /**
   * Post trending discovery alert
   */
  async postTrendingDiscoveryAlert(analysisResult, correlation) {
    try {
      const alertKey = `discovery_${correlation.keyword}_${correlation.token_symbol}_${analysisResult.id}`;
      
      if (this.postedAlerts.has(alertKey)) return; // Already posted
      
      // Generate AI-powered message
      const message = await this.generateTrendingDiscoveryMessage(analysisResult, correlation);
      
      const tweet = await this.postTweet(message);
      console.log(`🎯 Posted AI-generated trending discovery alert for ${correlation.token_symbol}`);
      
      // Store alert in database
      await this.storeAlert('trending_discovery', correlation.token_uri, {
        keyword: correlation.keyword,
        correlationScore: correlation.correlation_score,
        riskLevel: correlation.risk_level,
        platform: analysisResult.platform,
        message,
        aiGenerated: true
      }, tweet.data.id);
      
      this.postedAlerts.add(alertKey);
      
    } catch (error) {
      console.error('Error posting trending discovery alert:', error);
    }
  }

  /**
   * Generate AI-powered volume growth message
   */
  async generateVolumeGrowthMessage(token, volumeGrowth, currentVolume, previousVolume) {
    try {
      const volumeGrowthFormatted = this.formatCurrency(volumeGrowth);
      const currentVolumeFormatted = this.formatCurrency(currentVolume);
      const previousVolumeFormatted = this.formatCurrency(previousVolume);
      
      const prompt = `Generate an engaging tweet about a memecoin volume surge. 

Context:
- Token: ${token.symbol} (${token.name})
- Volume growth: +${volumeGrowthFormatted}/hour
- Current volume: ${currentVolumeFormatted}
- Previous volume: ${previousVolumeFormatted}

Requirements:
- Maximum 280 characters
- Include emojis and hashtags
- Make it exciting and engaging
- Include the key metrics
- Use relevant crypto hashtags
- Keep it professional but fun

Format the response as a complete tweet ready to post.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a crypto analyst creating engaging tweets about memecoin volume surges. Be exciting, informative, and use relevant hashtags." },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      return completion.choices[0].message.content || this.formatVolumeGrowthMessage(token, volumeGrowth, currentVolume, previousVolume);
    } catch (error) {
      console.error('Error generating AI message:', error);
      // Fallback to default message
      return this.formatVolumeGrowthMessage(token, volumeGrowth, currentVolume, previousVolume);
    }
  }

  /**
   * Format volume growth message (fallback)
   */
  formatVolumeGrowthMessage(token, volumeGrowth, currentVolume, previousVolume) {
    const volumeGrowthFormatted = this.formatCurrency(volumeGrowth);
    const currentVolumeFormatted = this.formatCurrency(currentVolume);
    
    return `🚀 VOLUME ALERT! 🚀\n\n` +
           `${token.symbol} (${token.name})\n` +
           `Volume growth: +${volumeGrowthFormatted}/hour\n` +
           `Current: ${currentVolumeFormatted}\n` +
           `Previous: ${this.formatCurrency(previousVolume)}\n\n` +
           `#${token.symbol} #Memecoin #Solana #PumpFun\n` +
           `#VolumeAlert #Trading`;
  }

  /**
   * Generate AI-powered growth rate message
   */
  async generateGrowthRateMessage(token, growthRate, currentVolume, previousVolume) {
    try {
      const currentVolumeFormatted = this.formatCurrency(currentVolume);
      const previousVolumeFormatted = this.formatCurrency(previousVolume);
      
      const prompt = `Generate an engaging tweet about a memecoin growth rate surge. 

Context:
- Token: ${token.symbol} (${token.name})
- Growth rate: +${growthRate.toFixed(1)}%
- Volume change: ${previousVolumeFormatted} → ${currentVolumeFormatted}

Requirements:
- Maximum 280 characters
- Include emojis and hashtags
- Make it exciting and engaging
- Emphasize the growth percentage
- Use relevant crypto hashtags
- Keep it professional but fun

Format the response as a complete tweet ready to post.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a crypto analyst creating engaging tweets about memecoin growth rate surges. Be exciting, informative, and use relevant hashtags." },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      return completion.choices[0].message.content || this.formatGrowthRateMessage(token, growthRate, currentVolume, previousVolume);
    } catch (error) {
      console.error('Error generating AI message:', error);
      // Fallback to default message
      return this.formatGrowthRateMessage(token, growthRate, currentVolume, previousVolume);
    }
  }

  /**
   * Format growth rate message (fallback)
   */
  formatGrowthRateMessage(token, growthRate, currentVolume, previousVolume) {
    const currentVolumeFormatted = this.formatCurrency(currentVolume);
    const previousVolumeFormatted = this.formatCurrency(previousVolume);
    
    return `📈 GROWTH ALERT! 📈\n\n` +
           `${token.symbol} (${token.name})\n` +
           `Growth rate: +${growthRate.toFixed(1)}%\n` +
           `Volume: ${previousVolumeFormatted} → ${currentVolumeFormatted}\n\n` +
           `#${token.symbol} #Memecoin #Solana #PumpFun\n` +
           `#GrowthAlert #Trading`;
  }

  /**
   * Generate AI-powered trending discovery message
   */
  async generateTrendingDiscoveryMessage(analysisResult, correlation) {
    try {
      const correlationPercent = (correlation.correlation_score * 100).toFixed(1);
      
      const prompt = `Generate an engaging tweet about a trending memecoin discovery. 

Context:
- Token: ${correlation.token_symbol}
- Keyword: ${correlation.keyword}
- Correlation: ${correlationPercent}%
- Risk Level: ${correlation.risk_level}
- Platform: ${analysisResult.platform}

Requirements:
- Maximum 280 characters
- Include emojis and hashtags
- Make it exciting and engaging
- Emphasize the discovery aspect
- Include correlation and risk level
- Use relevant crypto hashtags
- Keep it professional but fun

Format the response as a complete tweet ready to post.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a crypto analyst creating engaging tweets about trending memecoin discoveries. Be exciting, informative, and use relevant hashtags." },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      return completion.choices[0].message.content || this.formatTrendingDiscoveryMessage(analysisResult, correlation);
    } catch (error) {
      console.error('Error generating AI message:', error);
      // Fallback to default message
      return this.formatTrendingDiscoveryMessage(analysisResult, correlation);
    }
  }

  /**
   * Format trending discovery message (fallback)
   */
  formatTrendingDiscoveryMessage(analysisResult, correlation) {
    const correlationPercent = (correlation.correlation_score * 100).toFixed(1);
    
    return `🎯 TRENDING DISCOVERY! 🎯\n\n` +
           `${correlation.token_symbol} (${correlation.keyword})\n` +
           `Correlation: ${correlationPercent}%\n` +
           `Risk Level: ${correlation.risk_level}\n` +
           `Platform: ${analysisResult.platform}\n\n` +
           `#${correlation.token_symbol} #${correlation.keyword} #Memecoin\n` +
           `#Solana #PumpFun #Trending`;
  }

  /**
   * Format currency values
   */
  formatCurrency(value) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenUri) {
    try {
      const { data, error } = await this.supabase
        .from('tokens')
        .select('name, symbol, uri')
        .eq('uri', tokenUri)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching token info:', error);
      return null;
    }
  }

  /**
   * Post tweet to Twitter
   */
  async postTweet(message) {
    try {
      const tweet = await this.twitterClient.v2.tweet(message);
      console.log(`✅ Tweet posted successfully: ${tweet.data.id}`);
      return tweet;
    } catch (error) {
      console.error('Error posting tweet:', error);
      throw error;
    }
  }

  /**
   * Store alert in database
   */
  async storeAlert(alertType, tokenUri, data, tweetId = null) {
    try {
      const alertData = {
          alert_type: alertType,
          token_uri: tokenUri,
        data: {
          ...data,
          alert_generated_at: new Date().toISOString(),
          alert_version: '1.0.0'
        },
        posted_at: new Date().toISOString(),
        tweet_id: tweetId,
        status: tweetId ? 'posted' : 'generated',
        created_at: new Date().toISOString()
      };

      const { data: storedAlert, error } = await this.supabase
        .from('twitter_alerts')
        .insert(alertData)
        .select()
        .single();

      if (error) {
        console.error('Error storing alert:', error);
        return null;
      }

      console.log(`✅ Alert stored: ${alertType} for ${tokenUri || 'market'}`);
      return storedAlert;
    } catch (error) {
      console.error('Error storing alert:', error);
      return null;
    }
  }

  /**
   * Test Twitter connection
   */
  async testConnection() {
    try {
      const me = await this.twitterClient.v2.me();
      console.log(`✅ Twitter connection successful: @${me.data.username}`);
      return true;
    } catch (error) {
      console.error('❌ Twitter connection failed:', error);
      return false;
    }
  }

  /**
   * Generate contextual market analysis tweet
   */
  async generateMarketAnalysisTweet() {
    try {
      // Get recent market data for context
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const { data: recentPrices, error } = await this.supabase
        .from('prices')
        .select(`
          *,
          tokens!fk_prices_token_uri (
            name,
            symbol
          )
        `)
        .gte('trade_at', oneHourAgo.toISOString())
        .order('trade_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Analyze market sentiment
      const marketData = this.analyzeMarketSentiment(recentPrices);
      
      const prompt = `Generate an engaging tweet about the current memecoin market sentiment. 

Context:
- Total tokens traded: ${marketData.totalTokens}
- Average volume change: ${marketData.avgVolumeChange}%
- Top performing token: ${marketData.topPerformer}
- Market mood: ${marketData.marketMood}

Requirements:
- Maximum 280 characters
- Include emojis and hashtags
- Make it engaging and informative
- Provide market insights
- Use relevant crypto hashtags
- Keep it professional but exciting

Format the response as a complete tweet ready to post.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a crypto analyst creating engaging tweets about memecoin market sentiment. Be insightful, exciting, and use relevant hashtags." },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      return completion.choices[0].message.content || "📊 Market analysis tweet generation failed";
    } catch (error) {
      console.error('Error generating market analysis tweet:', error);
      return "📊 Market analysis tweet generation failed";
    }
  }

  /**
   * Analyze market sentiment from price data
   */
  analyzeMarketSentiment(prices) {
    if (!prices || prices.length === 0) {
      return {
        totalTokens: 0,
        avgVolumeChange: 0,
        topPerformer: 'N/A',
        marketMood: 'neutral'
      };
    }

    // Group by token
    const tokenData = {};
    prices.forEach(price => {
      if (price.tokens?.symbol) {
        if (!tokenData[price.tokens.symbol]) {
          tokenData[price.tokens.symbol] = [];
        }
        tokenData[price.tokens.symbol].push(price);
      }
    });

    // Calculate metrics
    const totalTokens = Object.keys(tokenData).length;
    let totalVolumeChange = 0;
    let topPerformer = { symbol: 'N/A', change: 0 };

    Object.entries(tokenData).forEach(([symbol, tokenPrices]) => {
      if (tokenPrices.length >= 2) {
        const sorted = tokenPrices.sort((a, b) => new Date(a.trade_at) - new Date(b.trade_at));
        const first = parseFloat(sorted[0].price_sol || 0);
        const last = parseFloat(sorted[sorted.length - 1].price_sol || 0);
        
        if (first > 0) {
          const change = ((last - first) / first) * 100;
          totalVolumeChange += change;
          
          if (change > topPerformer.change) {
            topPerformer = { symbol, change };
          }
        }
      }
    });

    const avgVolumeChange = totalTokens > 0 ? totalVolumeChange / totalTokens : 0;
    
    // Determine market mood
    let marketMood = 'neutral';
    if (avgVolumeChange > 50) marketMood = 'bullish';
    else if (avgVolumeChange < -20) marketMood = 'bearish';

    return {
      totalTokens,
      avgVolumeChange: Math.round(avgVolumeChange * 100) / 100,
      topPerformer: topPerformer.symbol,
      marketMood
    };
  }

  /**
   * Get alert statistics
   */
  async getAlertStats() {
    try {
      const { data, error } = await this.supabase
        .from('twitter_alerts')
        .select('alert_type, posted_at')
        .gte('posted_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;
      
      const stats = {
        total_alerts: data.length,
        volume_alerts: data.filter(a => a.alert_type === 'volume_growth').length,
        growth_alerts: data.filter(a => a.alert_type === 'growth_rate').length,
        discovery_alerts: data.filter(a => a.alert_type === 'trending_discovery').length
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching alert stats:', error);
      return null;
    }
  }

  /**
   * Post market analysis tweet
   */
  async postMarketAnalysis() {
    try {
      console.log('📊 Generating market analysis tweet...');
      
      const message = await this.generateMarketAnalysisTweet();
      
      if (message && message !== "📊 Market analysis tweet generation failed") {
        const tweet = await this.postTweet(message);
        console.log('✅ Posted market analysis tweet');
        
        // Store alert in database
        await this.storeAlert('market_analysis', null, {
          message,
          aiGenerated: true,
          type: 'periodic_analysis'
        }, tweet.data.id);
      } else {
        console.log('⚠️ Skipping market analysis tweet due to generation failure');
      }
      
    } catch (error) {
      console.error('Error posting market analysis:', error);
    }
  }

  /**
   * Start monitoring
   */
  start() {
    console.log('🚀 Starting Twitter integration monitoring...');
    this.testConnection();
  }

  /**
   * Stop monitoring
   */
  stop() {
    console.log('🛑 Stopping Twitter integration monitoring...');
    // cron jobs will continue running, but we can add cleanup logic here
  }
}

// Export the class
export { TwitterIntegration };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const twitter = new TwitterIntegration();
  twitter.start();
}
