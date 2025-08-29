# 🐦 Twitter Integration System

## Overview

The Twitter Integration System automatically posts alerts to Twitter when specific trading conditions are met, providing real-time notifications for volume growth, growth rate spikes, and trending discoveries. This system integrates seamlessly with the pattern analysis and Pump.fun token database.

## 🎯 **Core Features**

### **1. AI-Powered Tweet Generation**
- **OpenAI Integration**: Uses GPT-4 to generate engaging, context-aware tweets
- **Smart Content**: Automatically creates relevant hashtags and emojis
- **Fallback System**: Falls back to template messages if AI generation fails

### **2. Automated Volume Alerts**
- **Volume Growth Threshold**: Posts when volume growth exceeds $10K/hour
- **Growth Rate Threshold**: Posts when growth rate hits 100%+ ($5K → $10K+)
- **Real-time Monitoring**: Checks every 5 minutes for new alerts

### **3. Trending Discovery Alerts**
- **Pattern Analysis Integration**: Monitors high-correlation discoveries
- **Social Media Trends**: Links TikTok/Telegram trends to token performance
- **Risk Assessment**: Includes risk levels in discovery alerts

### **4. Market Analysis Tweets**
- **Periodic Insights**: Posts market sentiment analysis every 4 hours
- **Data-Driven Content**: Analyzes recent price data for market mood
- **Engaging Format**: AI-generated insights with relevant hashtags

### **5. Smart Alert Management**
- **Duplicate Prevention**: Avoids posting the same alert multiple times
- **Scheduled Monitoring**: Automated background monitoring with cron jobs
- **Database Storage**: All alerts stored in Supabase for analytics

## 🔧 **How It Works**

### **Monitoring Pipeline**
```
Price Data → Volume Analysis → Threshold Check → Alert Generation → Twitter Post → Database Storage
     ↓              ↓              ↓              ↓              ↓              ↓
  Pump.fun DB   Hourly Calc   $10K/100%+    Message Format   Tweet Post   Alert History
```

### **Alert Triggers**
1. **Volume Growth Alert**: When hourly volume increases by $10K+
2. **Growth Rate Alert**: When volume grows by 100%+ in one hour
3. **Trending Discovery**: When pattern analysis shows 70%+ correlation

### **Monitoring Intervals**
- **Volume Monitoring**: Every 5 minutes
- **Trending Discovery**: Every 10 minutes
- **Alert Cache Clear**: Every hour

## 🚀 **Setup & Installation**

### **1. Install Dependencies**
```bash
cd js-scraper
npm install
```

### **2. API Setup**
1. **Twitter API**: Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Create a new app and get your API credentials
2. **OpenAI API**: Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Get your API key for AI-powered tweet generation
3. Copy `twitter_env_example.txt` to `.env` and fill in your credentials

### **3. Environment Variables**
```bash
# Required Twitter API credentials
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_SECRET=your_twitter_access_secret_here

# Required Supabase credentials
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Customize thresholds
VOLUME_THRESHOLD=10000      # $10K default
GROWTH_THRESHOLD=100        # 100% default
CORRELATION_THRESHOLD=0.7   # 70% default
```

### **4. Database Setup**
```bash
# Run the updated schema (includes twitter_alerts table)
npm run setup-db
```

## 📱 **Usage Commands**

### **Start Twitter Monitoring**
```bash
# Start automated monitoring
npm run twitter-start

# Or run directly
node twitter_integration.mjs
```

### **Test Integration**
```bash
# Test Twitter connection and functionality
npm run twitter-test

# Test AI-powered tweet generation
npm run ai-test

# Or run directly
node test_twitter_integration.mjs
node test_ai_tweets.mjs
```

### **Run Pattern Analysis with Twitter**
```bash
# Run analysis (will trigger Twitter alerts if thresholds met)
npm run analyze

# Start monitoring for discoveries
npm run twitter-start
```

## 📊 **Alert Types & Messages**

### **Volume Growth Alert**
```
🚀 VOLUME ALERT! 🚀

TEST (Test Token)
Volume growth: +$15K/hour
Current: $25K
Previous: $10K

#TEST #Memecoin #Solana #PumpFun
#VolumeAlert #Trading
```

### **Growth Rate Alert**
```
📈 GROWTH ALERT! 📈

TEST (Test Token)
Growth rate: +150.0%
Volume: $10K → $25K

#TEST #Memecoin #Solana #PumpFun
#GrowthAlert #Trading
```

### **Trending Discovery Alert**
```
🎯 TRENDING DISCOVERY! 🎯

TEST (test)
Correlation: 85.0%
Risk Level: Low
Platform: tiktok

#TEST #test #Memecoin
#Solana #PumpFun #Trending
```

## 🗄️ **Database Integration**

### **New Tables Created**
- **`twitter_alerts`**: Stores all posted alerts with metadata
- **`pattern_analysis_results`**: Links to trending discoveries
- **`prices`**: Source data for volume calculations

### **Alert Storage**
```sql
CREATE TABLE twitter_alerts (
    id SERIAL PRIMARY KEY,
    alert_type TEXT NOT NULL,
    token_uri TEXT,
    data JSONB,
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    tweet_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Data Flow**
1. **Price Monitoring**: Analyzes Pump.fun price data every 5 minutes
2. **Volume Calculation**: Groups prices by hour and calculates growth
3. **Threshold Check**: Compares against $10K and 100% thresholds
4. **Alert Generation**: Creates formatted messages with hashtags
5. **Twitter Post**: Posts to Twitter via API
6. **Database Storage**: Saves alert history for analytics

## ⚙️ **Configuration Options**

### **Thresholds**
```javascript
this.volumeThreshold = 10000;    // $10K volume growth
this.growthThreshold = 100;      // 100% growth rate
this.correlationThreshold = 0.7; // 70% correlation for discoveries
```

### **Monitoring Intervals**
```javascript
// Volume monitoring every 5 minutes
cron.schedule('*/5 * * * *', () => {
  this.monitorVolumeGrowth();
});

// Trending discovery monitoring every 10 minutes
cron.schedule('*/10 * * * *', () => {
  this.monitorTrendingDiscoveries();
});
```

### **Message Customization**
- **Hashtags**: Configurable hashtag sets for different alert types
- **Formatting**: Customizable message templates
- **Currency**: Automatic formatting ($1.5K, $1.5M)

## 🔍 **Monitoring & Analytics**

### **Alert Statistics**
```javascript
const stats = await twitter.getAlertStats();
// Returns: total_alerts, volume_alerts, growth_alerts, discovery_alerts
```

### **Real-time Monitoring**
- **Live Alerts**: Immediate posting when thresholds are met
- **Performance Tracking**: Monitor alert frequency and engagement
- **Error Handling**: Graceful handling of API failures

### **Integration Points**
- **Pattern Analysis**: Triggers on high-correlation discoveries
- **Pump.fun Data**: Real-time price and volume monitoring
- **Social Media**: Links TikTok/Telegram trends to trading alerts

## 🚨 **Alert Logic**

### **Volume Growth Detection**
1. **Data Collection**: Gather price data from last hour
2. **Hourly Grouping**: Group prices by hour for volume calculation
3. **Growth Calculation**: Compare current vs. previous hour
4. **Threshold Check**: Alert if growth ≥ $10K
5. **Duplicate Prevention**: Track posted alerts to avoid spam

### **Growth Rate Detection**
1. **Percentage Calculation**: (Current - Previous) / Previous × 100
2. **Threshold Check**: Alert if growth rate ≥ 100%
3. **Message Formatting**: Include before/after volumes
4. **Hashtag Generation**: Relevant trading hashtags

### **Trending Discovery Detection**
1. **Pattern Analysis**: Monitor correlation scores ≥ 70%
2. **Risk Assessment**: Include risk level in alerts
3. **Platform Integration**: Specify source (TikTok/Telegram)
4. **Keyword Highlighting**: Emphasize trending keywords

## 🛡️ **Safety Features**

### **Duplicate Prevention**
- **Alert Tracking**: Maintains cache of posted alerts
- **Time-based Keys**: Unique keys for each alert type
- **Cache Clearing**: Hourly cleanup to prevent memory buildup

### **Error Handling**
- **API Failures**: Graceful handling of Twitter API errors
- **Database Errors**: Non-blocking alert storage
- **Connection Issues**: Automatic retry and recovery

### **Rate Limiting**
- **API Limits**: Respects Twitter API rate limits
- **Monitoring Intervals**: Configurable to avoid overwhelming APIs
- **Batch Processing**: Efficient handling of multiple alerts

## 📈 **Performance & Scalability**

### **Efficient Monitoring**
- **Scheduled Tasks**: Uses cron for optimal timing
- **Database Queries**: Optimized queries with proper indexing
- **Memory Management**: Efficient alert caching and cleanup

### **Scalability Features**
- **Modular Design**: Easy to add new alert types
- **Configurable Thresholds**: Adjustable for different market conditions
- **Extensible Architecture**: Support for additional platforms

## 🔮 **Future Enhancements**

### **Planned Features**
- **Multi-Platform Support**: Discord, Telegram bot integration
- **Advanced Analytics**: Alert performance and engagement metrics
- **Custom Thresholds**: User-configurable alert conditions
- **Image Generation**: Charts and graphs in tweets
- **Webhook Support**: Real-time notifications to external systems

### **Advanced Monitoring**
- **Machine Learning**: Predictive alert generation
- **Sentiment Analysis**: Market sentiment integration
- **Portfolio Tracking**: Personalized alerts for specific tokens
- **Risk Management**: Advanced risk assessment algorithms

## ⚠️ **Important Notes**

### **API Requirements**
- **Twitter Developer Account**: Required for API access
- **Rate Limits**: Respect Twitter's API rate limits
- **Authentication**: Proper OAuth setup required

### **Data Dependencies**
- **Pump.fun Data**: Requires active price data collection
- **Pattern Analysis**: Needs regular analysis runs
- **Database Schema**: Must include twitter_alerts table

### **Monitoring Requirements**
- **Continuous Operation**: System must run continuously for alerts
- **Data Freshness**: Requires recent price and analysis data
- **Network Stability**: Stable internet connection required

## 🎉 **Getting Started**

1. **Setup Twitter API**: Get credentials from developer portal
2. **Configure Environment**: Set all required environment variables
3. **Setup Database**: Run schema updates for twitter_alerts table
4. **Test Integration**: Run `npm run twitter-test` to verify setup
5. **Start Monitoring**: Run `npm run twitter-start` to begin alerts
6. **Monitor Performance**: Check alert statistics and engagement

The Twitter Integration System transforms your memecoin analysis into real-time social media alerts, helping you and your followers catch the next viral token before it moons! 🚀
