# 🚀 Complete Bitquery Data Collection Guide

## 🎯 **Overview**

The updated `bitquery/index.mjs` now provides a comprehensive data collection system that fetches and pushes three types of data to your Supabase database:

1. **📈 Memecoins** - Token discovery and basic information
2. **💰 Prices** - Real-time DEX trade prices
3. **📊 Market Data** - Market cap, total supply, and enhanced token metadata

## 🏗️ **System Architecture**

```
bitquery/index.mjs
├── 📈 fetchAndPushMemecoins()     # From memecoins.mjs
├── 💰 fetchAndPushPrices()        # From prices.mjs  
└── 📊 fetchAndPushMarketData()    # From market-data.mjs
    ├── getTokensForMarketDataUpdate()  # Find tokens needing updates
    ├── fetchMarketData()               # Get market data from Bitquery
    └── updateTokenMarketData()         # Update Supabase tokens table
```

## 🚀 **How to Run**

### **Option 1: Direct Node Execution**
```bash
cd bitquery
node index.mjs
```

### **Option 2: Using NPM Script**
```bash
cd bitquery
npm run full-collection
```

## 📊 **What Gets Collected**

### **1. Memecoins (Step 1)**
- **Source**: `scripts/memecoins.mjs`
- **Data**: Token discovery, basic metadata
- **Storage**: `tokens` table

### **2. Prices (Step 2)**
- **Source**: `scripts/prices.mjs`
- **Data**: Real-time DEX trade prices
- **Storage**: `prices` table
- **Fields**: Price in SOL/USD, trade timestamps, token references

### **3. Market Data (Step 3)**
- **Source**: `scripts/market-data.mjs`
- **Data**: Market cap, total supply, enhanced metadata
- **Storage**: `tokens` table updates
- **Fields**: `market_cap`, `total_supply`, `name`, `symbol`, `last_updated`

## 🔄 **Market Data Update Logic**

### **Smart Token Selection**
The system automatically identifies tokens that need market data updates:

```javascript
// Tokens are selected if they:
1. Don't have market_cap data (market_cap IS NULL)
2. Don't have total_supply data (total_supply IS NULL)  
3. Haven't been updated recently (last_updated < 24 hours ago)
4. Have a valid address field
5. Are limited to 50 tokens per run (to avoid overwhelming the API)
```

### **Batch Processing**
- **Batch Size**: 5 tokens processed concurrently
- **Rate Limiting**: 1 second delay between individual API calls
- **Batch Delay**: 2 seconds between batches
- **Error Handling**: Individual token failures don't stop the process

## 📈 **Expected Output**

### **Successful Run Example**:
```
🚀 Starting Bitquery data collection...

📈 Step 1: Fetching and pushing memecoins...
✅ Memecoins data collected and stored

💰 Step 2: Fetching and pushing prices...
✅ Prices data saved to: C:\Users\jwavo\xoroxalt\bitquery\results\prices\prices-1756627075004.json
📊 NEW PRICES METADATA
🚀 PUSHING TO SUPABASE
📈 Found 1 DEX trades
✅ Prices data successfully processed and stored!

📊 Step 3: Fetching and pushing market data...
📊 Found 15 tokens to update with market data

🔄 Processing batch 1/3
  🔍 Fetching market data for TOKEN1 (address1)
  ✅ Market data fetched: { supply: "1000000000", marketCap: "1000000", name: "Token One", symbol: "TOKEN1" }
  🔍 Fetching market data for TOKEN2 (address2)
  ✅ Market data fetched: { supply: "500000000", marketCap: "250000", name: "Token Two", symbol: "TOKEN2" }
  ...

🔄 Processing batch 2/3
  ⏳ Waiting 2 seconds before next batch...

✅ Market data update completed. Processed 15 tokens.

✅ All data collection completed successfully!
```

## 🛠️ **Configuration Requirements**

### **Environment Variables**
```env
# Required for all operations
BITQUERY_API_KEY=your_bitquery_api_key
ACCESS_TOKEN=your_bitquery_access_token

# Required for market data updates
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_SECRET=your_supabase_anon_key
```

### **Database Schema**
Ensure your database has the required columns:
```sql
-- Tokens table
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS market_cap NUMERIC(20, 2) DEFAULT 0;
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS total_supply NUMERIC(30, 0) DEFAULT 0;
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Prices table  
ALTER TABLE prices ADD COLUMN IF NOT EXISTS token_uri TEXT;
ALTER TABLE prices ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
```

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. Missing Environment Variables**
```
❌ Missing SUPABASE_URL or SUPABASE_ANON_SECRET in environment variables
```
**Solution**: Ensure all required environment variables are set in your `.env` file.

#### **2. API Rate Limiting**
```
❌ Bitquery API rate limit exceeded - try again later
```
**Solution**: The system includes built-in delays, but you may need to increase them for high-volume usage.

#### **3. Database Connection Issues**
```
❌ Error fetching tokens for market data update: [database error]
```
**Solution**: Verify your Supabase connection and RLS policies.

### **Debug Mode**
To see detailed logging, check the console output for:
- 🔍 API Response Status
- 📊 Response Data Keys  
- 🔄 Processing batches
- ✅ Success confirmations

## 📊 **Data Quality Monitoring**

### **Check Data Completeness**
```sql
-- Tokens missing market data
SELECT COUNT(*) as missing_market_data 
FROM tokens 
WHERE market_cap IS NULL OR total_supply IS NULL;

-- Tokens not updated recently
SELECT COUNT(*) as stale_data 
FROM tokens 
WHERE last_updated < NOW() - INTERVAL '24 hours';

-- Recent price data
SELECT COUNT(*) as recent_prices 
FROM prices 
WHERE timestamp > NOW() - INTERVAL '1 hour';
```

### **Monitor API Usage**
- **Rate Limits**: Built-in delays prevent overwhelming the API
- **Batch Processing**: Processes tokens in manageable chunks
- **Error Recovery**: Individual failures don't stop the entire process

## 🚀 **Advanced Usage**

### **Customize Batch Sizes**
```javascript
// In index.mjs, modify these values:
const batchSize = 5;        // Tokens per batch
const apiDelay = 1000;      // Delay between API calls (ms)
const batchDelay = 2000;    // Delay between batches (ms)
```

### **Filter Token Selection**
```javascript
// Modify the query in getTokensForMarketDataUpdate():
.limit(50)  // Change from 50 to your preferred limit
```

### **Schedule Regular Updates**
```bash
# Using cron (Linux/Mac)
0 */6 * * * cd /path/to/bitquery && node index.mjs

# Using Task Scheduler (Windows)
# Create a scheduled task to run: node index.mjs
```

## 🎯 **Success Indicators**

### **✅ Good Run**
- All three steps complete without errors
- Market data is fetched for multiple tokens
- Database tables are updated with new information
- No rate limiting or authentication errors

### **⚠️ Partial Success**
- Some steps complete, others fail
- Market data fetched for some tokens but not others
- Check error logs for specific issues

### **❌ Failed Run**
- Early termination with errors
- Check environment variables and API credentials
- Verify database connectivity and permissions

## 🏆 **Summary**

The updated `bitquery/index.mjs` provides:

1. **🔄 Complete Data Pipeline**: Memecoins → Prices → Market Data
2. **📊 Smart Updates**: Only updates tokens that need market data
3. **⚡ Efficient Processing**: Batch processing with rate limiting
4. **🛡️ Error Resilience**: Individual failures don't stop the process
5. **📈 Rich Data**: Market cap, supply, and enhanced metadata

**Run it with**: `node index.mjs` or `npm run full-collection`

Your Supabase database will now receive comprehensive token data including real-time prices, market caps, and total supplies! 🎉
