# TikTok Data Not Showing - Complete Fix Guide

## Problem
The TikTok data is not showing in the frontend because:
1. **Missing `tiktoks` table** in the database
2. **No sample data** to display
3. **API endpoints** may not be working properly

## Solution Steps

### Step 1: Set Up the Database Tables

First, run the updated database setup script that now includes the `tiktoks` table:

```bash
cd frontend
npm run setup-db
```

This will create:
- ✅ `tokens` table
- ✅ `tiktoks` table (NEW!)
- ✅ `prices` table  
- ✅ `mentions` table

### Step 2: Populate with Sample Data

After setting up the tables, populate them with sample data:

```bash
npm run populate-sample
```

This will insert:
- 📱 **5 sample TikTok videos** with realistic data
- 🪙 **3 sample tokens** (BONK, WIF, POPCAT)
- 🔗 **5 sample mentions** linking TikTok videos to tokens

### Step 3: Verify Database Setup

Check your Supabase dashboard to confirm:
1. **Tables exist** in the `Table Editor`
2. **Sample data** is visible in each table
3. **RLS policies** allow read access

### Step 4: Test the API Endpoint

The API endpoint `/api/supabase/get-tiktoks` now has enhanced logging. Check your terminal when the frontend loads to see:
- ✅ Credential status
- ✅ Database connection
- ✅ Query results
- ✅ Data count

### Step 5: Check Frontend Components

The following components should now display TikTok data:
- **Analytics Dashboard**: Shows total videos, views, comments
- **Scraper Status**: Shows scraper activity and video counts
- **Real-time Data**: Displays TikTok metrics

## Expected Results

After completing the setup, you should see:

### Analytics Dashboard
- **Total Videos**: 5
- **Total Views**: 112,000 (sum of all sample videos)
- **Total Comments**: 289 (sum of all sample comments)
- **Top Mentioned Tokens**: BONK, WIF, POPCAT with mention counts

### Sample TikTok Data
```
📱 crypto_hunter: 15K views, 45 comments
📱 memecoin_expert: 25K views, 67 comments  
📱 solana_trader: 18K views, 32 comments
📱 defi_insights: 32K views, 89 comments
📱 nft_collector: 22K views, 56 comments
```

## Troubleshooting

### If Tables Still Don't Exist
1. **Check Supabase permissions** - ensure your API key has table creation rights
2. **Run manual SQL** in Supabase SQL editor using the schema from `js-scraper/supabase_schema.sql`
3. **Verify RLS policies** - ensure tables allow read operations

### If Sample Data Fails to Insert
1. **Check foreign key constraints** - ensure tokens are inserted before mentions
2. **Verify table structure** - ensure columns match the expected schema
3. **Check for duplicate keys** - some sample data may already exist

### If API Still Returns Empty Data
1. **Check terminal logs** - the enhanced logging will show exactly what's happening
2. **Verify environment variables** - ensure `SUPABASE_URL` and `SUPABASE_ANON_SECRET` are set
3. **Test direct database access** - try querying the `tiktoks` table directly in Supabase

## Database Schema

The `tiktoks` table structure:
```sql
CREATE TABLE tiktoks (
    id TEXT PRIMARY KEY,           -- TikTok video ID
    username TEXT NOT NULL,        -- TikTok username
    url TEXT NOT NULL,             -- Video URL
    thumbnail TEXT,                -- Thumbnail image
    created_at TIMESTAMP,          -- Video creation date
    fetched_at TIMESTAMP,          -- When we scraped it
    views BIGINT DEFAULT 0,        -- View count
    comments INTEGER DEFAULT 0     -- Comment count
);
```

## Next Steps

After fixing the TikTok data issue:

1. **Test all components** to ensure they display data correctly
2. **Verify real-time updates** work with the new data
3. **Consider adding more sample data** for better testing
4. **Set up automated scraping** to populate real TikTok data

## Status Check

Run these commands to verify everything is working:

```bash
# 1. Set up database tables
npm run setup-db

# 2. Populate with sample data  
npm run populate-sample

# 3. Start the frontend
npm run dev
```

Then check:
- ✅ **Database tables** exist in Supabase
- ✅ **Sample data** is visible in tables
- ✅ **Frontend components** display TikTok data
- ✅ **API endpoints** return data correctly
- ✅ **No console errors** in browser

The TikTok data should now be fully visible in your frontend! 🎉
