# 🎯 TikTok Scraper Setup Guide

This guide will help you set up and run the TikTok scraper to store data in your Supabase database.

## 📋 Prerequisites

1. **Node.js** installed (version 16 or higher)
2. **Chrome/Chromium** browser installed
3. **Supabase project** with database set up
4. **Environment variables** configured

## 🔧 Step 1: Environment Setup

Create a `.env` file in the `js-scraper` directory with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here

# Chrome Configuration (optional)
EXECUTABLE_PATH=
USER_DATA_DIR=

# Other configurations
NODE_ENV=development
```

### How to get your Supabase credentials:

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" to `SUPABASE_URL`
4. Copy the "anon public" key to `SUPABASE_KEY`

## 🗄️ Step 2: Database Setup

Before running the scraper, ensure your database tables exist:

```bash
# Install dependencies (if not already done)
npm install

# Set up database tables
npm run setup-db
```

This will create the required tables:
- `tiktoks` - TikTok video data
- `tokens` - Token information
- `mentions` - Token mentions in TikTok videos
- `prices` - Token price data
- And other supporting tables

## ✅ Step 3: Test Database Connection

Test if your database connection is working:

```bash
npm run test-connection
```

This will:
- Verify environment variables are set
- Test connection to Supabase
- Check if required tables exist
- Verify table accessibility

## 🚀 Step 4: Run the TikTok Scraper

Once everything is set up, run the scraper:

```bash
npm run scrape-tiktok
```

Or directly:

```bash
node index.mjs
```

## 📊 What the Scraper Does

The scraper will:

1. **Search TikTok** for keywords: `memecoin`, `pumpfun`, `solana`, `crypto`, `meme`, `bags`, `bonk`
2. **Extract video data** including:
   - Video URL and ID
   - Username and thumbnail
   - View count and comment count
   - Posted timestamp
   - Hashtags
3. **Store data immediately** in Supabase:
   - TikTok videos in `tiktoks` table
   - Token mentions in `mentions` table
4. **Save backup** to JSON files

## 🔍 Monitoring Progress

During scraping, you'll see:

```
✅ Stored TikTok: 7465878076333755679 (dclovesnq)
🔗 Stored 3 mentions for TikTok 7465878076333755679
```

## 📈 Expected Results

After successful scraping, you should see:

```
📊 DATABASE STORAGE SUMMARY:
✅ Successfully stored: 45 TikTok videos
❌ Storage errors: 0
📁 Total processed: 45 videos

🎉 TikTok data has been successfully stored in Supabase database!
You can now view this data in your frontend dashboard.
```

## 🛠️ Troubleshooting

### Common Issues:

#### 1. **Missing Environment Variables**
```
❌ Missing SUPABASE_URL or SUPABASE_KEY in environment variables
```
**Solution**: Create `.env` file with correct credentials

#### 2. **Database Connection Failed**
```
❌ Database connection failed: [error message]
```
**Solution**: 
- Check your Supabase credentials
- Ensure your project is active
- Verify IP allowlist settings

#### 3. **Tables Don't Exist**
```
❌ tiktoks: relation "tiktoks" does not exist
```
**Solution**: Run `npm run setup-db` first

#### 4. **Chrome Launch Failed**
```
❌ Failed to launch browser: [error]
```
**Solution**: 
- Ensure Chrome is installed
- Check if Chrome path is correct in `.env`
- Try running without headless mode

### Debug Commands:

```bash
# Test database connection
npm run test-connection

# Check database setup
npm run setup-db

# Test web scraping
npm run test

# View logs
tail -f scraper.log
```

## 🔄 Automation

To run the scraper automatically:

```bash
# Run every 6 hours
0 */6 * * * cd /path/to/js-scraper && npm run scrape-tiktok

# Run daily at 2 AM
0 2 * * * cd /path/to/js-scraper && npm run scrape-tiktok
```

## 📱 Viewing Scraped Data

After successful scraping, you can view the data:

1. **In Supabase Dashboard**:
   - Go to Table Editor
   - Check `tiktoks`, `mentions`, `tokens` tables

2. **In Your Frontend**:
   - The dashboard should now display TikTok data
   - Real-time updates via SSE

## 🎯 Next Steps

1. **Verify data storage** in Supabase dashboard
2. **Check frontend dashboard** for TikTok data display
3. **Set up automated scraping** with cron jobs
4. **Monitor data quality** and adjust scraping parameters

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify environment variables are correct
3. Ensure database tables exist
4. Check browser compatibility
5. Review error logs for specific issues

---

**Happy Scraping! 🎉**
