# 🧠 Memecoin Pattern Analysis System

## Overview

The Memecoin Pattern Analyzer is a sophisticated system that cross-references social media trends (TikTok and Telegram) with Pump.fun token database data to identify correlations between viral content and trading volume. This system provides actionable trading insights based on social sentiment analysis.

## 🎯 **Core Features**

### **1. Cross-Platform Trend Analysis**
- **TikTok Integration**: Analyzes video content, views, comments, and mentions
- **Telegram Integration**: Processes channel messages and community sentiment
- **Token Database**: Cross-references with Pump.fun token launches from bitquery

### **2. Pattern Matching & Correlation**
- **Keyword Extraction**: Identifies trending terms from social content
- **Token Matching**: Links social trends to actual token launches
- **Correlation Metrics**: Calculates relationship between social engagement and trading volume

### **3. Trading Intelligence**
- **Risk Assessment**: Evaluates volatility and correlation strength
- **Recommendations**: Generates buy/sell signals based on analysis
- **Market Timing**: Identifies optimal entry/exit points

## 🔍 **How It Works**

### **Data Collection Pipeline**
```
Social Media → Keyword Extraction → Token Matching → Correlation Analysis → Trading Recommendations
     ↓              ↓                    ↓              ↓                    ↓
  TikTok/Telegram  Trending Terms   Pump.fun DB   Statistical Metrics   Risk-Adjusted Signals
```

### **Analysis Process**
1. **Data Gathering**: Collects 24-hour social media and token data
2. **Keyword Mining**: Extracts trending terms using NLP techniques
3. **Pattern Matching**: Links social trends to token launches
4. **Correlation Calculation**: Measures relationship strength
5. **Recommendation Generation**: Produces actionable trading insights

## 📊 **Key Metrics Analyzed**

### **Social Engagement Metrics**
- **View Count**: Total video/message views
- **Comment Volume**: User interaction levels
- **Mention Frequency**: How often tokens are referenced
- **Engagement Rate**: Views per content piece

### **Trading Volume Metrics**
- **Price Changes**: Percentage price movements
- **Volume Data**: Trading activity levels
- **Volatility**: Price fluctuation patterns
- **Market Momentum**: Trend direction and strength

### **Correlation Coefficients**
- **Strength**: How closely social trends match price movements
- **Direction**: Positive or negative relationships
- **Significance**: Statistical confidence levels
- **Timing**: Lag between social buzz and price action

## 🚀 **Usage**

### **Database Setup**
```bash
# Navigate to js-scraper directory
cd js-scraper

# Setup database schema (run once)
npm run setup-db

# Or run directly
node setup_database.mjs
```

### **Run Comprehensive Analysis**
```bash
# Run full pattern analysis (stores in Supabase)
npm run analyze

# Or run directly
node pattern_analysis.mjs
```

### **Test Individual Components**
```bash
# Test pattern analysis system
npm run test-analysis

# Test database storage functionality
npm run test-db

# Or run directly
node test_pattern_analysis.mjs
node test_database_storage.mjs
```

### **Programmatic Usage**
```javascript
import { MemecoinPatternAnalyzer } from './pattern_analysis.mjs';

const analyzer = new MemecoinPatternAnalyzer();

// Run TikTok analysis only
const tiktokReport = await analyzer.analyzeTikTokTokenCorrelation();

// Run Telegram analysis only
const telegramReport = await analyzer.analyzeTelegramTokenCorrelation();

// Run comprehensive analysis
const fullReport = await analyzer.runComprehensiveAnalysis();

// Retrieve stored analysis results
const latestResults = await analyzer.getLatestAnalysisResults();
const trendingKeywords = await analyzer.getTrendingKeywords();
const keywordCorrelations = await analyzer.getKeywordCorrelations('pepe');
const analysisSummary = await analyzer.getAnalysisSummary();
```

## 📈 **Output & Reports**

### **Analysis Reports**
- **Individual Platform Reports**: TikTok and Telegram specific insights
- **Combined Analysis**: Cross-platform correlation data
- **Trading Recommendations**: Ranked by correlation strength
- **Risk Assessments**: Volatility and correlation risk levels
- **Database Storage**: All results stored in Supabase for real-time access
- **Historical Tracking**: Trend analysis over time with keyword frequency

### **Sample Report Structure**
```json
{
  "timestamp": "2025-01-31T12:00:00Z",
  "summary": {
    "tiktok": { "totalVideos": 150, "keywordMatches": 12 },
    "telegram": { "totalMessages": 300, "keywordMatches": 8 }
  },
  "topRecommendations": [
    {
      "rank": 1,
      "token": "PEPE",
      "keyword": "pepe",
      "correlation": 0.85,
      "risk": "Low",
      "recommendation": "Strong buy signal - High social engagement correlates with positive price movement"
    }
  ]
}
```

## 🎯 **Trading Signals**

### **Signal Types**
1. **Strong Buy**: High correlation (>0.7) + positive price movement
2. **Moderate Buy**: Good correlation (>0.5) + positive price movement
3. **Watch for Reversal**: High engagement + declining price
4. **Monitor**: Low correlation, wait for stronger signals

### **Risk Levels**
- **Low Risk**: High correlation + low volatility
- **Medium Risk**: Good correlation + moderate volatility
- **High Risk**: Moderate correlation + high volatility
- **Very High Risk**: Low correlation + extreme volatility

## 🔧 **Configuration**

### **Environment Variables**
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### **Analysis Parameters**
- **Time Window**: 24-hour analysis period (configurable)
- **Keyword Limit**: Top 20 trending keywords
- **Correlation Threshold**: 0.3 minimum for recommendations
- **Data Sources**: TikTok, Telegram, Pump.fun tokens, price data

## 📁 **File Structure**

```
js-scraper/
├── pattern_analysis.mjs          # Main analysis engine
├── test_pattern_analysis.mjs     # Test script
├── test_database_storage.mjs     # Database storage test script
├── PATTERN_ANALYSIS.md           # This documentation
├── analysis_results/             # Generated reports (backup)
│   ├── tiktok_token_correlation_*.json
│   ├── telegram_token_correlation_*.json
│   └── comprehensive_analysis_*.json
└── package.json                  # Scripts and dependencies
```

## 🗄️ **Database Storage**

### **New Database Tables**

The pattern analysis system now stores all results in Supabase for real-time access:

#### **`pattern_analysis_results`**
- Stores complete analysis reports
- Includes summary, trending keywords, correlations, and recommendations
- Supports multiple analysis types (tiktok, telegram, comprehensive)

#### **`pattern_correlations`**
- Detailed correlation data for each keyword-token pair
- Links to analysis results via foreign key
- Includes risk levels and recommendation text

#### **`trending_keywords`**
- Tracks keyword frequency across platforms
- Maintains first seen, last seen, and total mention counts
- Enables trend analysis over time

### **Database Schema Features**
- **Row Level Security (RLS)**: Secure access control
- **Proper Indexing**: Optimized queries for performance
- **JSONB Storage**: Flexible data structure for complex metrics
- **Foreign Key Relationships**: Maintains data integrity

## 🧪 **Testing & Validation**

### **Test Coverage**
- **Unit Tests**: Individual function testing
- **Integration Tests**: End-to-end analysis workflow
- **Data Validation**: Input/output verification
- **Performance Testing**: Large dataset handling

### **Validation Metrics**
- **Accuracy**: Correlation coefficient validation
- **Reliability**: Consistent result generation
- **Performance**: Analysis execution time
- **Scalability**: Large dataset processing

## 🔮 **Future Enhancements**

### **Planned Features**
- **Real-time Analysis**: Live data streaming and analysis
- **Machine Learning**: Advanced pattern recognition algorithms
- **Multi-chain Support**: Ethereum, Polygon, and other chains
- **API Integration**: RESTful endpoints for external access
- **Dashboard**: Web-based visualization interface

### **Advanced Analytics**
- **Sentiment Analysis**: Natural language processing for sentiment
- **Predictive Modeling**: Price movement forecasting
- **Risk Management**: Portfolio optimization algorithms
- **Market Timing**: Optimal entry/exit point identification

## ⚠️ **Important Notes**

### **Data Requirements**
- **TikTok Data**: Must be scraped and stored in database
- **Telegram Data**: Must be scraped and stored in database
- **Token Data**: Must be fetched from bitquery and stored
- **Price Data**: Must be available in prices table

### **Performance Considerations**
- **Analysis Frequency**: Recommended every 1-4 hours
- **Data Volume**: Handles thousands of records efficiently
- **Memory Usage**: Optimized for large datasets
- **Processing Time**: Typically completes within 2-5 minutes

### **Risk Disclaimer**
This system provides analysis and recommendations based on historical data and statistical correlations. It does not constitute financial advice. Always conduct your own research and consider consulting with financial professionals before making investment decisions.

## 🎉 **Getting Started**

1. **Install Dependencies**: `npm install`
2. **Set Environment**: Configure Supabase credentials
3. **Setup Database**: Run the updated `supabase_schema.sql` in your Supabase project
4. **Run Analysis**: `npm run analyze` (stores results in database)
5. **Test Database**: `npm run test-db` to verify storage functionality
6. **Review Results**: Check both database and `analysis_results/` backup directory
7. **Test System**: `npm run test-analysis` for basic functionality

The Memecoin Pattern Analyzer transforms raw social media and blockchain data into actionable trading intelligence, helping you identify the next viral memecoin before it moons! 🚀
