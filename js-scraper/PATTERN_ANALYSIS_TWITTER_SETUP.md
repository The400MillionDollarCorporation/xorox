# 🧠 **Pattern Analysis & Twitter Integration Setup Guide**

This guide will help you set up and run the pattern analysis and Twitter integration systems to store comprehensive data in your Supabase database.

## 📋 **Prerequisites**

1. **Node.js** installed (version 16 or higher)
2. **Supabase project** with database set up
3. **Environment variables** configured
4. **Twitter API credentials** (for Twitter integration)
5. **OpenAI API key** (for AI-powered analysis)

## 🔧 **Step 1: Environment Setup**

Create or update your `.env` file in the `js-scraper` directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here

# Twitter API Configuration
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_SECRET=your_twitter_access_secret_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Other configurations
NODE_ENV=development
```

### **How to get your credentials:**

1. **Supabase**: Go to your project dashboard → Settings → API
2. **Twitter**: Create a Twitter Developer account and app at developer.twitter.com
3. **OpenAI**: Get your API key from platform.openai.com

## 🗄️ **Step 2: Database Setup**

The pattern analysis and Twitter integration require specific database tables. Run the setup:

```bash
# Install dependencies (if not already done)
npm install

# Set up database tables with updated schema
npm run setup-db
```

### **Tables Created:**
- `pattern_analysis_results` - Main analysis reports
- `pattern_correlations` - Detailed correlation data
- `trending_keywords` - Keyword tracking and frequency
- `twitter_alerts` - Twitter alert history and data
- `tokens` - Token information (referenced)
- `prices` - Token price data (referenced)

## ✅ **Step 3: Test Database Connection**

Test if your database connection is working:

```bash
npm run test-connection
```

## 🧪 **Step 4: Test Pattern Analysis & Twitter Integration**

Test both systems to ensure they're working properly:

```bash
npm run test-pattern-twitter
```

This will:
- Verify environment variables
- Test database table accessibility
- Test pattern analysis data storage
- Test Twitter alert data storage
- Verify data retrieval capabilities

## 🚀 **Step 5: Run Pattern Analysis**

Once everything is set up, run the pattern analysis:

```bash
npm run analyze
```

Or directly:

```bash
node pattern_analysis.mjs
```

## 🐦 **Step 6: Start Twitter Integration**

Start the Twitter monitoring and alert system:

```bash
npm run twitter-start
```

Or directly:

```bash
node twitter_integration.mjs
```

## 📊 **What Gets Stored in Supabase**

### **1. Pattern Analysis Results** (`pattern_analysis_results` table)
```json
{
  "analysis_type": "tiktok",
  "platform": "tiktok",
  "timestamp": "2025-01-31T12:00:00Z",
  "summary": {
    "totalVideos": 150,
    "totalMessages": 300,
    "analysisDate": "2025-01-31T12:00:00Z"
  },
  "trending_keywords": ["memecoin", "solana", "bonk"],
  "correlations": [...],
  "recommendations": [...],
  "metadata": {
    "total_records": 450,
    "analysis_version": "1.0.0",
    "generated_at": "2025-01-31T12:00:00Z"
  }
}
```

### **2. Pattern Correlations** (`pattern_correlations` table)
```json
{
  "analysis_id": 1,
  "keyword": "memecoin",
  "token_name": "Test Token",
  "token_symbol": "TEST",
  "token_uri": "test://uri",
  "correlation_score": 0.85,
  "social_metrics": {
    "mentions": 25,
    "engagement": 0.75
  },
  "trading_metrics": {
    "priceChange": 15.5,
    "volume": 50000
  },
  "risk_level": "Medium",
  "recommendation_text": "Strong correlation detected"
}
```

### **3. Trending Keywords** (`trending_keywords` table)
```json
{
  "keyword": "memecoin",
  "platform": "tiktok",
  "frequency": 5,
  "first_seen": "2025-01-31T10:00:00Z",
  "last_seen": "2025-01-31T12:00:00Z",
  "total_mentions": 125
}
```

### **4. Twitter Alerts** (`twitter_alerts` table)
```json
{
  "alert_type": "volume_growth",
  "token_uri": "test://uri",
  "data": {
    "message": "🚀 $TEST token showing 150% volume growth!",
    "aiGenerated": true,
    "alert_generated_at": "2025-01-31T12:00:00Z",
    "alert_version": "1.0.0"
  },
  "posted_at": "2025-01-31T12:00:00Z",
  "tweet_id": "1234567890123456789",
  "status": "posted",
  "created_at": "2025-01-31T12:00:00Z"
}
```

## 🔍 **Monitoring Progress**

### **Pattern Analysis:**
```
🔍 Analyzing TikTok trends vs Pump.fun tokens...
📱 Found 150 recent TikTok videos
🪙 Found 25 recent token launches
📊 Trending keywords: memecoin, solana, bonk
🎯 Found 8 keyword-token matches
💾 Storing tiktok analysis results in Supabase...
✅ Analysis result stored with ID: 1
✅ Stored 8 correlation records
✅ Updated trending keywords for tiktok
```

### **Twitter Integration:**
```
📊 Monitoring volume growth...
🚀 Posted AI-generated volume growth alert for TEST
✅ Alert stored: volume_growth for test://uri
📈 Posted AI-generated growth rate alert for SOL
✅ Alert stored: growth_rate for sol://uri
```

## 📈 **Expected Results**

After successful analysis and Twitter integration, you should see:

```
📊 PATTERN ANALYSIS SUMMARY:
✅ Analysis results stored: 3 reports
✅ Correlations stored: 24 records
✅ Trending keywords updated: 15 keywords
✅ Database storage: 100% successful

🐦 TWITTER INTEGRATION SUMMARY:
✅ Alerts generated: 12 alerts
✅ Tweets posted: 8 tweets
✅ Data stored: 100% successful
🎉 All data successfully stored in Supabase database!
```

## 🛠️ **Troubleshooting**

### **Common Issues:**

#### 1. **Missing Environment Variables**
```
❌ Missing SUPABASE_URL or SUPABASE_KEY in environment variables
```
**Solution**: Create `.env` file with correct credentials

#### 2. **Database Tables Don't Exist**
```
❌ pattern_analysis_results: relation "pattern_analysis_results" does not exist
```
**Solution**: Run `npm run setup-db` first

#### 3. **Twitter API Connection Failed**
```
❌ Twitter connection failed: [error message]
```
**Solution**: Check Twitter API credentials and app permissions

#### 4. **OpenAI API Error**
```
❌ OpenAI API error: [error message]
```
**Solution**: Verify OpenAI API key and account status

### **Debug Commands:**

```bash
# Test database connection
npm run test-connection

# Test pattern analysis and Twitter
npm run test-pattern-twitter

# Test pattern analysis only
npm run test-analysis

# Test Twitter integration only
npm run twitter-test

# Check database setup
npm run setup-db
```

## 🔄 **Automation & Scheduling**

### **Pattern Analysis:**
```javascript
// Run comprehensive analysis
await patternAnalyzer.runComprehensiveAnalysis();

// Run individual platform analysis
await patternAnalyzer.analyzeTikTokTokenCorrelation();
await patternAnalyzer.analyzeTelegramTokenCorrelation();
```

### **Twitter Integration:**
```javascript
// Built-in scheduling
cron.schedule('*/5 * * * *', () => this.monitorVolumeGrowth());
cron.schedule('*/10 * * * *', () => this.monitorTrendingDiscoveries());
cron.schedule('0 */4 * * *', () => this.postMarketAnalysis());
```

## 📱 **Viewing Stored Data**

### **In Supabase Dashboard:**
1. Go to Table Editor
2. Check `pattern_analysis_results` for analysis reports
3. Check `pattern_correlations` for detailed correlations
4. Check `trending_keywords` for keyword tracking
5. Check `twitter_alerts` for Twitter alert history

### **In Your Frontend:**
- Pattern analysis results displayed in dashboard
- Twitter alerts shown in real-time
- Trending keywords visualized in charts
- Correlation data used for recommendations

## 🎯 **Data Analysis Use Cases**

### **Trend Detection:**
- **Cross-platform correlation** between social media and token performance
- **Keyword frequency analysis** for early trend identification
- **Risk assessment** based on correlation scores and volatility

### **Market Intelligence:**
- **Volume growth alerts** for trading opportunities
- **Trending discovery alerts** for new token launches
- **Market sentiment analysis** through AI-powered insights

### **Business Intelligence:**
- **Token launch timing** optimization
- **Community engagement** tracking
- **Social media impact** measurement

## 🔧 **Customization**

### **Adjust Analysis Parameters:**
```javascript
// In pattern analysis
this.correlationThreshold = 0.7; // Minimum correlation score
this.volatilityThreshold = 100;   // Maximum volatility

// In Twitter integration
this.volumeThreshold = 10000;     // Volume alert threshold
this.growthThreshold = 100;       // Growth rate threshold
```

### **Add New Alert Types:**
```javascript
// Add custom alert types
await this.storeAlert('custom_alert', tokenUri, {
  message: 'Custom alert message',
  customData: 'Additional data'
});
```

## 🎯 **Next Steps**

1. **Verify data storage** in Supabase dashboard
2. **Check frontend dashboard** for pattern analysis display
3. **Monitor Twitter alerts** for real-time updates
4. **Analyze correlation patterns** for insights
5. **Optimize thresholds** based on performance

## 📞 **Support**

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are correct
3. Ensure database tables exist and are accessible
4. Check API credentials and permissions
5. Review error logs for specific issues

---

**Your pattern analysis and Twitter integration are now fully configured to store comprehensive data in Supabase! 🎉**
