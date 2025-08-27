# 🚀 Automated TikTok Scraping & Storage

This system automatically scrapes TikTok data and stores it directly in your Supabase database in real-time.

## ✨ Features

- **Real-time Storage**: Data is stored immediately after each video is scraped
- **Automatic Token Mentions**: Links TikTok videos to tokens in your database
- **Backup Files**: Creates JSON backup files for safety
- **Progress Tracking**: Shows real-time progress and statistics
- **Error Handling**: Gracefully handles errors and continues processing

## 🎯 How It Works

1. **Scrapes TikTok** for memecoin-related content
2. **Stores each video** immediately in Supabase `tiktoks` table
3. **Processes token mentions** and stores in `mentions` table
4. **Creates backup files** with all scraped data
5. **Shows real-time progress** and final statistics

## 🚀 Quick Start

### Option 1: Automated Scraping & Storage (Recommended)
```bash
npm run auto
# or
node auto_scrape_and_store.mjs
```

### Option 2: Original Scraping Only
```bash
npm start
# or
node index.mjs
```

## 📊 What Gets Stored

### TikTok Data (`tiktoks` table)
- Video ID, username, URL, thumbnail
- Views, comments, timestamps
- Search term context

### Token Mentions (`mentions` table)
- Links TikTok videos to specific tokens
- Count of mentions per token
- Temporal tracking

## 🔧 Prerequisites

### 1. Database Setup
Apply the schema from `supabase_schema.sql` to your Supabase database.

### 2. Environment Variables
Ensure `.env` file contains:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_SECRET=your_supabase_anon_key
```

### 3. Dependencies
All required packages are already installed:
- ✅ `@supabase/supabase-js`
- ✅ `puppeteer`
- ✅ `node-fetch`
- ✅ `dotenv`

## 📈 Expected Results

The automated system will:
- **Scrape videos** for each search term and hashtag
- **Store data immediately** in Supabase as it's processed
- **Process token mentions** automatically
- **Show real-time progress** with emojis and statistics
- **Create backup files** for data safety

## 🎮 Search Terms

The system automatically scrapes:
- **Search Terms**: memecoin, pumpfun, solana, crypto, meme, bags, bonk
- **Hashtags**: #memecoin, #solana, #crypto, #pumpfun, #meme, #bags, #bonk

## 🔍 Monitoring

Watch the console for:
- 🚀 **Starting indicators**
- 🔍 **Search term processing**
- 💾 **Storage operations**
- ✅ **Success confirmations**
- 🔗 **Mention processing**
- 📊 **Final statistics**

## 🛠️ Troubleshooting

### Common Issues:
1. **Chrome not found**: Ensure Google Chrome is installed at `/usr/bin/google-chrome`
2. **Database errors**: Check your Supabase schema and credentials
3. **Network issues**: Verify internet connection and TikTok accessibility

### Error Handling:
- The system continues processing even if individual videos fail
- All errors are logged with timestamps
- Failed videos are skipped, successful ones continue

## 📁 Output Files

- **Combined Results**: `combined_results_TIMESTAMP.json`
- **Database**: Direct storage in Supabase tables
- **Console**: Real-time progress and statistics

## 🎉 Success Indicators

You'll know it's working when you see:
- ✅ Green checkmarks for stored TikToks
- 🔗 Blue link indicators for mentions
- 📊 Final statistics with counts
- 🎯 Completion messages

---

**Ready to automate your TikTok scraping? Run `npm run auto` and watch the magic happen! 🚀**
