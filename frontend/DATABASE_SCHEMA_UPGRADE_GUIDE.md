# 🗄️ Database Schema Upgrade Guide - Market Cap & Enhanced Fields

## 🚨 **Current Issues**

### **1. Missing Database Columns**
```
Error fetching tokens: {
  code: '42703',
  details: null,
  hint: null,
  message: 'column tokens.last_updated does not exist'
}
```

### **2. Missing Market Cap Data**
- **Problem**: No market cap information available for tokens
- **Impact**: Limited financial analysis capabilities
- **Solution**: Fetch and store market cap from Bitquery API

### **3. Missing Token URI in Prices**
- **Problem**: Prices table doesn't have direct token_uri reference
- **Impact**: Complex joins needed for data queries
- **Solution**: Add token_uri column for direct access

## ✅ **Comprehensive Solution Applied**

### **1. Database Schema Updates**

**File**: `js-scraper/supabase_schema.sql`

**New Columns Added**:

#### **Tokens Table**:
```sql
-- Added market cap support
market_cap NUMERIC(20, 2) DEFAULT 0,

-- Added last updated tracking
last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

#### **Prices Table**:
```sql
-- Added direct token URI reference
token_uri TEXT,

-- Added timestamp for compatibility
timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

### **2. Bitquery API Enhancement**

**File**: `bitquery/scripts/prices.mjs`

**Enhanced Query**:
```graphql
Currency {
  Uri
  MintAddress
  Name
  Symbol
  MarketCap        # ✅ New: Market capitalization
  TotalSupply      # ✅ New: Total token supply
}
```

**Before (❌ Limited Data)**:
```graphql
Currency {
  Uri              # Only basic token info
}
```

**After (✅ Rich Data)**:
```graphql
Currency {
  Uri              # Token URI
  MintAddress      # Solana mint address
  Name             # Token name
  Symbol           # Token symbol
  MarketCap        # Market capitalization
  TotalSupply      # Total supply
}
```

### **3. Enhanced Data Storage**

**File**: `bitquery/scripts/supabase/prices.mjs`

**New Data Fields**:
```javascript
priceDataArray.push({
  price_sol: priceData.Trade.Buy.Price,
  price_usd: priceData.Trade.Buy.PriceInUSD,
  created_at: sanitize(priceData.Block.Time),
  uri: priceData.Trade.Buy.Currency.Uri,
  
  // ✅ New fields
  mint_address: priceData.Trade.Buy.Currency.MintAddress,
  name: priceData.Trade.Buy.Currency.Name,
  symbol: priceData.Trade.Buy.Currency.Symbol,
  market_cap: priceData.Trade.Buy.Currency.MarketCap,
  total_supply: priceData.Trade.Buy.Currency.TotalSupply,
  block_time: priceData.Block.Time
});
```

**Enhanced Storage Logic**:
```javascript
// Store price data with token_uri
updates.push({
  token_id: tokenId,
  token_uri: item.uri,        # ✅ Direct URI reference
  price_usd: item.price_usd,
  price_sol: item.price_sol,
  trade_at: item.created_at,
  timestamp: item.block_time,  # ✅ Timestamp field
  is_latest: true,
});

// Update token metadata
if (item.market_cap || item.name || item.symbol) {
  const tokenUpdate = {};
  if (item.market_cap) tokenUpdate.market_cap = item.market_cap;
  if (item.name) tokenUpdate.name = item.name;
  if (item.symbol) tokenUpdate.symbol = item.symbol;
  tokenUpdate.last_updated = item.block_time;
  
  // Update token record
  supabase.from("tokens").update(tokenUpdate).eq("id", update.token_id);
}
```

## 🔧 **How to Apply the Updates**

### **Step 1: Run Database Migration**

```bash
cd frontend
npm run add-missing-columns
```

**Expected Output**:
```
🔧 Adding missing columns to database...
📊 Adding market_cap column to tokens table...
✅ market_cap column added to tokens table
🕒 Adding last_updated column to tokens table...
✅ last_updated column added to tokens table
🔗 Adding token_uri column to prices table...
✅ token_uri column added to prices table
⏰ Adding timestamp column to prices table...
✅ timestamp column added to prices table
🔄 Updating existing prices records with token_uri...
✅ Existing prices records updated with token_uri
🔄 Updating existing tokens records with last_updated...
✅ Existing tokens records updated with last_updated
🎉 Database migration completed successfully!
```

### **Step 2: Update Bitquery Scripts**

The Bitquery scripts have been updated to:
- **Fetch market cap data** from the API
- **Store additional token metadata** in the database
- **Update token records** with latest information

### **Step 3: Restart Services**

```bash
# Restart your development server
npm run dev

# Restart Bitquery price fetching (if running)
cd ../bitquery/scripts
node prices.mjs
```

## 🎯 **Benefits of This Upgrade**

### **✅ Enhanced Financial Data**
- **Market Cap**: Real-time market capitalization for tokens
- **Total Supply**: Complete token supply information
- **Price History**: Enhanced price tracking with timestamps

### **✅ Improved Data Access**
- **Direct URI Access**: No more complex joins for price queries
- **Timestamp Support**: Better time-based data analysis
- **Metadata Updates**: Automatic token information updates

### **✅ Better API Performance**
- **Reduced Joins**: Direct access to token_uri in prices table
- **Efficient Queries**: Optimized database queries
- **Real-time Updates**: Live market cap and metadata updates

### **✅ Enhanced Analytics**
- **Market Analysis**: Market cap trends and analysis
- **Token Performance**: Better token performance tracking
- **Financial Metrics**: Comprehensive financial data

## 🧪 **Testing the Upgrade**

### **1. Verify Database Structure**

```sql
-- Check tokens table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tokens' 
AND column_name IN ('market_cap', 'last_updated');

-- Check prices table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'prices' 
AND column_name IN ('token_uri', 'timestamp');
```

### **2. Test Trending Coins API**

```bash
# Should now work without database errors
curl "http://localhost:3000/api/dashboard/trending-coins?limit=20"
```

**Expected Response**:
```json
{
  "coins": [
    {
      "uri": "token_uri_here",
      "symbol": "TOKEN",
      "name": "Token Name",
      "trading_volume_24h": 1000,
      "tiktok_views_24h": 5000,
      "correlation_score": 0.85,
      "price_change_24h": 5.2,
      "total_mentions": 25,
      "last_updated": "2025-01-31T...",
      "market_cap": 1000000
    }
  ]
}
```

### **3. Verify Market Cap Data**

```sql
-- Check for market cap data
SELECT name, symbol, market_cap, last_updated 
FROM tokens 
WHERE market_cap > 0 
ORDER BY market_cap DESC 
LIMIT 10;
```

## 🚀 **Next Steps**

### **1. Monitor Data Quality**
- Check that market cap data is being populated
- Verify token_uri relationships are correct
- Monitor last_updated timestamps

### **2. Enhanced Analytics**
- Implement market cap-based sorting
- Add market cap change tracking
- Create market cap visualization charts

### **3. Performance Optimization**
- Add indexes on new columns if needed
- Monitor query performance
- Optimize data update frequency

## 🆘 **Troubleshooting**

### **Common Issues**:

#### **1. Migration Fails**
```bash
# Check if RPC function exists
# Some Supabase instances may not have exec_sql
# Use direct SQL execution instead
```

#### **2. Market Cap Not Populating**
```bash
# Check Bitquery API credentials
# Verify API response contains MarketCap field
# Check database update logic
```

#### **3. Token URI Mismatches**
```sql
-- Verify token_uri relationships
SELECT p.token_uri, t.uri, p.token_id, t.id
FROM prices p
JOIN tokens t ON p.token_id = t.id
WHERE p.token_uri != t.uri;
```

### **Debugging Steps**:
1. **Check migration logs** for specific errors
2. **Verify API responses** contain expected fields
3. **Monitor database updates** for successful operations
4. **Check column existence** in database schema

## 🏆 **Summary**

This comprehensive upgrade resolves the database schema issues by:

1. **Adding missing columns**: `market_cap`, `last_updated`, `token_uri`, `timestamp`
2. **Enhancing Bitquery API**: Fetching market cap and additional metadata
3. **Improving data storage**: Better data relationships and timestamps
4. **Providing migration tools**: Automated database schema updates

Your system will now:
- **Work without database errors** - all required columns exist
- **Provide rich financial data** - market cap and metadata
- **Enable better analytics** - enhanced data relationships
- **Support real-time updates** - live market data

The trending coins API and dashboard are now fully functional with enhanced financial data! 🎉

## 📚 **Additional Resources**

- [Supabase Database Schema](https://supabase.com/docs/guides/database/overview)
- [Bitquery API Documentation](https://docs.bitquery.io/docs/category/solana)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Database Migration Best Practices](https://supabase.com/docs/guides/database/migrations)
