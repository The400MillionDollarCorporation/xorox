# 📱 **Telegram Scraper Setup Guide**

This guide will help you set up and run the Telegram scraper to store data in your Supabase database.

## 📋 **Prerequisites**

1. **Node.js** installed (version 16 or higher)
2. **Supabase project** with database set up
3. **Environment variables** configured
4. **Telegram Bot Token** (optional, for enhanced functionality)

## 🔧 **Step 1: Environment Setup**

Create or update your `.env` file in the `js-scraper` directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here

# Telegram Configuration (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Other configurations
NODE_ENV=development
```

### **How to get your credentials:**

1. **Supabase**: Go to your project dashboard → Settings → API
2. **Telegram Bot**: Message @BotFather on Telegram to create a bot

## 🗄️ **Step 2: Database Setup**

The Telegram scraper requires updated database tables. Run the setup:

```bash
# Install dependencies (if not already done)
npm install

# Set up database tables with updated schema
npm run setup-db
```

### **Tables Created:**
- `telegram_channels` - Telegram channel information
- `telegram_messages` - Individual Telegram messages
- `mentions` - Token mentions from both TikTok and Telegram
- `tokens` - Token information
- `tiktoks` - TikTok video data

## ✅ **Step 3: Test Database Connection**

Test if your database connection is working:

```bash
npm run test-connection
```

## 🧪 **Step 4: Test Telegram Scraper**

Test the Telegram scraper functionality:

```bash
npm run test-telegram
```

This will:
- Verify environment variables
- Test database initialization
- Test channel addition
- Test message storage
- Test token mention extraction

## 🚀 **Step 5: Run the Telegram Scraper**

Once everything is set up, run the scraper:

```bash
npm run scrape-telegram
```

Or directly:

```bash
node telegram_scraper.mjs
```

## 📊 **What the Telegram Scraper Does**

### **1. Channel Discovery**
- Automatically discovers new Telegram channels based on keywords
- Keywords: `memecoin`, `pumpfun`, `solana`, `crypto`, `meme`, `bags`, `bonk`

### **2. Message Scraping**
- Scrapes messages from discovered channels
- Uses both web scraping and RSS feed methods
- Scrapes from December 2024 to current date
- Stores messages in `telegram_messages` table

### **3. Token Mention Extraction**
- Analyzes message content for token symbols
- Detects mentions like `#memecoin`, `$SOL`, `bonk`
- Stores mentions in `mentions` table with source tracking
- Links mentions to existing tokens in your database

### **4. Data Storage**
- **Channels** → `telegram_channels` table
- **Messages** → `telegram_messages` table  
- **Token Mentions** → `mentions` table (with `source: 'telegram'`)

## 🔍 **Monitoring Progress**

During scraping, you'll see:

```
🔍 Scraping channel: @crypto_channel using dual method approach
✅ Web scraping completed: 45 messages
✅ RSS scraping completed: 32 messages
✅ Stored 77 messages
🔗 Stored 12 token mentions from Telegram messages
```

## 📈 **Expected Results**

After successful scraping, you should see:

```
📊 SCRAPING SUMMARY:
✅ Channels processed: 15
✅ Messages stored: 1,247
✅ Token mentions extracted: 89
🎉 Telegram data has been successfully stored in Supabase database!
```

## 🛠️ **Troubleshooting**

### **Common Issues:**

#### 1. **Missing Environment Variables**
```
❌ Missing SUPABASE_URL or SUPABASE_KEY in environment variables
```
**Solution**: Create `.env` file with correct credentials

#### 2. **Database Connection Failed**
```
❌ Database connection failed: [error message]
```
**Solution**: Check Supabase credentials and project status

#### 3. **Tables Don't Exist**
```
❌ telegram_messages: relation "telegram_messages" does not exist
```
**Solution**: Run `npm run setup-db` first

#### 4. **No Messages Found**
```
⚠️ No messages found for channel @example
```
**Solution**: Channel may be private or have no public messages

### **Debug Commands:**

```bash
# Test database connection
npm run test-connection

# Test Telegram scraper
npm run test-telegram

# Check database setup
npm run setup-db

# View logs
tail -f telegram_scraper.log
```

## 🔄 **Automation**

The scraper includes built-in scheduling:

```javascript
// Discover new channels every 6 hours
cron.schedule('0 */6 * * *', async () => {
  await scraper.discoverChannels();
});

// Scrape all channels daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await scraper.scrapeAllChannels(1000);
});
```

## 📱 **Viewing Scraped Data**

### **In Supabase Dashboard:**
1. Go to Table Editor
2. Check `telegram_channels` table for channels
3. Check `telegram_messages` table for messages
4. Check `mentions` table for token mentions (filter by `source = 'telegram'`)

### **In Your Frontend:**
- The dashboard should now display Telegram data
- Real-time updates via SSE
- Token mentions from both TikTok and Telegram

## 🎯 **Data Structure**

### **Telegram Messages:**
```json
{
  "channel_id": "crypto_channel",
  "message_id": 12345,
  "text": "Check out this new #memecoin! $SOL is pumping!",
  "date": 1735689600,
  "views": 1500,
  "reactions_count": 23,
  "has_photo": true,
  "scraped_at": "2025-01-01T12:00:00Z"
}
```

### **Token Mentions:**
```json
{
  "token_id": 1,
  "count": 2,
  "source": "telegram",
  "channel_id": "crypto_channel",
  "message_id": 12345,
  "mention_at": "2025-01-01T12:00:00Z"
}
```

## 🔧 **Customization**

### **Add More Keywords:**
```javascript
this.keywords = [
  'memecoin', 'pumpfun', 'solana', 'crypto', 
  'meme', 'bags', 'bonk',
  'your_custom_keyword', 'another_keyword'
];
```

### **Adjust Scraping Limits:**
```javascript
// In scrapeAllChannels method
await this.scrapeAllChannels(500); // 500 messages per channel
```

### **Change Scraping Frequency:**
```javascript
// In setupScheduledTasks method
cron.schedule('0 */2 * * *', async () => { // Every 2 hours
  await this.scrapeAllChannels(1000);
});
```

## 🎯 **Next Steps**

1. **Verify data storage** in Supabase dashboard
2. **Check frontend dashboard** for Telegram data display
3. **Monitor scraping performance** and adjust parameters
4. **Set up additional channels** manually if needed
5. **Analyze token mention patterns** across platforms

## 📞 **Support**

If you encounter issues:

1. Check the troubleshooting section above
2. Verify environment variables are correct
3. Ensure database tables exist and are accessible
4. Check Telegram channel accessibility
5. Review error logs for specific issues

---

**Happy Telegram Scraping! 📱✨**
