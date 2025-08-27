# Supabase Database Setup for TikTok Scraper

## Database Schema

This project requires the following tables:

### 1. `tokens`
Stores information about cryptocurrency tokens
- `id`: Unique identifier
- `name`: Token name
- `symbol`: Token symbol
- `address`: Token contract address
- `uri`: Token URI (unique)
- `created_at`: Token creation timestamp
- `create_tx`: Transaction signature that created the token
- `views`: Number of views (default: 0)
- `mentions`: Number of mentions (default: 0)

### 2. `tiktoks`
Stores TikTok video metadata
- `id`: TikTok video ID (primary key)
- `username`: TikTok creator username
- `url`: Video URL
- `thumbnail`: Thumbnail URL
- `created_at`: Video creation timestamp
- `fetched_at`: Scraping timestamp
- `views`: Number of views
- `comments`: Number of comments

### 3. `mentions`
Tracks token mentions in TikTok videos
- `id`: Unique mention identifier
- `tiktok_id`: Referenced TikTok video
- `token_id`: Referenced token
- `count`: Number of mentions
- `mention_at`: Mention timestamp

### 4. `prices`
Stores token price information
- `id`: Unique price entry
- `token_id`: Referenced token
- `price_usd`: Price in USD
- `price_sol`: Price in SOL
- `trade_at`: Timestamp of price
- `is_latest`: Flag for latest price

## Setup Instructions

1. Open Supabase SQL Editor
2. Copy and paste the SQL from `supabase_schema.sql`
3. Run the script to create tables

## Key Changes Made
- Added `create_tx` column to tokens table
- Added `views` and `mentions` columns to tokens table
- Made `uri` column unique for upsert operations
- Added performance indexes for `uri` and `symbol`

## Notes
- Ensure foreign key constraints are maintained
- Row Level Security (RLS) is enabled
- Indexes are created for performance
- The `uri` column is unique to prevent duplicate tokens

## Troubleshooting
- Verify token and TikTok data before inserting mentions
- Check foreign key relationships
- Ensure the `create_tx` column exists in your tokens table
