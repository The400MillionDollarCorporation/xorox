# 📊 **Scraper Data Storage Summary**

This document provides a comprehensive overview of what data is stored in your Supabase database from both the TikTok and Telegram scrapers.

## 🗄️ **Database Tables Overview**

| Table | Purpose | Data Source | Key Fields |
|-------|---------|-------------|------------|
| `tiktoks` | TikTok video data | TikTok Scraper | ID, username, URL, views, comments |
| `telegram_channels` | Telegram channel info | Telegram Scraper | Username, display_name, enabled |
| `telegram_messages` | Telegram message data | Telegram Scraper | Channel_id, message_id, text, date |
| `mentions` | Token mentions | Both Scrapers | Token_id, count, source, platform_id |
| `tokens` | Token information | Manual/API | Name, symbol, address, URI |
| `prices` | Token price data | Bitquery/API | Price_usd, price_sol, timestamp |

## 🎵 **TikTok Scraper Data Storage**

### **What Gets Stored:**
- **Video Metadata**: ID, username, URL, thumbnail, creation date
- **Engagement Metrics**: Views, comment count, fetched timestamp
- **Token Mentions**: Extracted from video comments and hashtags

### **Data Flow:**
```
TikTok Scraper → Video Data → tiktoks table
                → Comment Analysis → mentions table
                → JSON Backup Files
```

### **Sample TikTok Record:**
```json
{
  "id": "7465878076333755679",
  "username": "dclovesnq",
  "url": "https://www.tiktok.com/@dclovesnq/video/7465878076333755679",
  "thumbnail": "https://p19-sign.tiktokcdn-us.com/...",
  "created_at": "2025-01-31T01:11:27.546Z",
  "fetched_at": "2025-01-31T01:13:03.631Z",
  "views": 13,
  "comments": 8
}
```

### **Keywords Scraped:**
- `memecoin`, `pumpfun`, `solana`, `crypto`, `meme`, `bags`, `bonk`

## 📱 **Telegram Scraper Data Storage**

### **What Gets Stored:**
- **Channel Information**: Username, display name, scraping settings
- **Message Content**: Text, metadata, media info, engagement metrics
- **Token Mentions**: Extracted from message text and hashtags

### **Data Flow:**
```
Telegram Scraper → Channel Discovery → telegram_channels table
                 → Message Scraping → telegram_messages table
                 → Token Analysis → mentions table
```

### **Sample Telegram Message Record:**
```json
{
  "channel_id": "crypto_channel",
  "message_id": 12345,
  "text": "Check out this new #memecoin! $SOL is pumping!",
  "date": 1735689600,
  "author_signature": "Crypto Expert",
  "has_photo": true,
  "views": 1500,
  "reactions_count": 23,
  "scraped_at": "2025-01-01T12:00:00Z"
}
```

### **Keywords Scraped:**
- `memecoin`, `pumpfun`, `solana`, `crypto`, `meme`, `bags`, `bonk`

## 🔗 **Token Mentions Storage**

### **Unified Mentions Table:**
Both scrapers store token mentions in the same `mentions` table with source tracking:

```json
{
  "id": 1,
  "tiktok_id": "7465878076333755679", // For TikTok mentions
  "token_id": 1,
  "count": 3,
  "mention_at": "2025-01-31T01:13:03.631Z",
  "source": "tiktok", // or "telegram"
  "channel_id": null, // For TikTok mentions
  "message_id": null  // For TikTok mentions
}
```

### **Mention Sources:**
- **TikTok**: `tiktok_id` populated, `source: 'tiktok'`
- **Telegram**: `channel_id` and `message_id` populated, `source: 'telegram'`

## 📈 **Data Volume Expectations**

### **TikTok Scraper:**
- **Videos per search term**: 100-200
- **Total videos per run**: 700-1400
- **Token mentions**: 50-200 per run
- **Storage size**: ~2-5 MB per run

### **Telegram Scraper:**
- **Channels discovered**: 10-50
- **Messages per channel**: 100-1000
- **Total messages per run**: 1000-50000
- **Token mentions**: 100-1000 per run
- **Storage size**: ~10-50 MB per run

## 🔄 **Real-time Updates**

### **Frontend Integration:**
- **Server-Sent Events (SSE)** for real-time data updates
- **Automatic dashboard refresh** when new data is scraped
- **Unified data view** combining TikTok and Telegram sources

### **Update Triggers:**
- TikTok scraper runs → Frontend updates via SSE
- Telegram scraper runs → Frontend updates via SSE
- Manual data refresh → API calls to latest data

## 🛠️ **Running the Scrapers**

### **TikTok Scraper:**
```bash
cd js-scraper
npm run scrape-tiktok
# or
node index.mjs
```

### **Telegram Scraper:**
```bash
cd js-scraper
npm run scrape-telegram
# or
node telegram_scraper.mjs
```

### **Test Commands:**
```bash
# Test database connection
npm run test-connection

# Test TikTok scraper
npm run test-db

# Test Telegram scraper
npm run test-telegram
```

## 📊 **Data Quality & Validation**

### **Data Validation:**
- **URL sanitization** to prevent injection attacks
- **Duplicate prevention** using unique constraints
- **Error handling** with detailed logging
- **Fallback values** for missing data

### **Data Consistency:**
- **Timestamp standardization** across platforms
- **Unified token reference** system
- **Cross-platform mention tracking**
- **Data integrity constraints**

## 🎯 **Use Cases & Analytics**

### **Trend Analysis:**
- **Cross-platform trending** (TikTok + Telegram)
- **Token mention correlation** analysis
- **Engagement pattern** comparison
- **Market sentiment** tracking

### **Business Intelligence:**
- **Memecoin discovery** opportunities
- **Social media impact** measurement
- **Token launch timing** optimization
- **Community engagement** analysis

## 🔒 **Security & Privacy**

### **Data Protection:**
- **Row Level Security (RLS)** enabled on all tables
- **Public read access** for dashboard display
- **Controlled write access** for scrapers only
- **No sensitive user data** stored

### **Compliance:**
- **Public data only** (no private messages)
- **Respects rate limits** and terms of service
- **Data retention** policies configurable
- **GDPR compliance** considerations

## 📱 **Frontend Dashboard Integration**

### **Real-time Components:**
- **TikTok Feed**: Latest videos and engagement
- **Telegram Feed**: Recent messages and channels
- **Unified Mentions**: Token mentions from both sources
- **Trending Analysis**: Cross-platform trend detection

### **Data Display:**
- **Charts and graphs** for trend visualization
- **Search and filtering** capabilities
- **Export functionality** for data analysis
- **Mobile-responsive** design

## 🚀 **Next Steps & Optimization**

### **Immediate Actions:**
1. **Run database setup** to create required tables
2. **Test both scrapers** to ensure connectivity
3. **Verify data storage** in Supabase dashboard
4. **Check frontend integration** for data display

### **Future Enhancements:**
- **AI-powered sentiment analysis** of messages
- **Advanced token correlation** algorithms
- **Predictive trending** models
- **Automated alert system** for significant mentions

---

**Your scrapers are now fully configured to store comprehensive data in Supabase! 🎉**
