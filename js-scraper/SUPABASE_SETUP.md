# Supabase Database Setup for ZoroX

This document outlines the complete database schema setup for the ZoroX memecoin hunting platform, including the enhanced token mention monitoring system.

## 🗄️ Database Tables

### 1. **tokens** - Memecoin Token Information
```sql
CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    address TEXT,
    uri TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE,
    create_tx TEXT,
    views BIGINT DEFAULT 0,
    mentions INTEGER DEFAULT 0,
    last_mention_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Stores information about memecoins and tokens discovered through various sources.

**Key Fields**:
- `symbol`: Token symbol (e.g., "BONK", "DOGE") - **NOT UNIQUE** (multiple tokens can have same symbol)
- `uri`: Unique identifier for the token
- `create_tx`: Transaction hash where the token was created
- `views`: Total view count across all platforms
- `mentions`: Total mention count across all platforms
- `last_mention_update`: Timestamp of last mention update

### 2. **tiktoks** - TikTok Video Data
```sql
CREATE TABLE tiktoks (
    id TEXT PRIMARY KEY,  -- TikTok video ID
    username TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    views BIGINT DEFAULT 0,
    comments INTEGER DEFAULT 0,
    last_mention_check TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    mention_count INTEGER DEFAULT 0,
    UNIQUE(url)
);
```

**Purpose**: Stores TikTok videos that mention memecoins or tokens.

**Key Fields**:
- `id`: TikTok video ID (primary key)
- `last_mention_check`: When the video was last checked for mentions
- `mention_count`: Total number of token mentions in this video

### 3. **mentions** - Token Mentions in Content
```sql
CREATE TABLE mentions (
    id SERIAL PRIMARY KEY,
    tiktok_id TEXT REFERENCES tiktoks(id),
    token_id INTEGER REFERENCES tokens(id),
    count INTEGER DEFAULT 1,
    mention_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    comment_text TEXT,
    sentiment_score NUMERIC(3, 2) -- -1.0 to 1.0 for sentiment analysis
);
```

**Purpose**: Tracks individual token mentions across different content pieces.

**Key Fields**:
- `count`: Number of times the token was mentioned
- `comment_text`: The actual comment text (for analysis)
- `sentiment_score`: Sentiment analysis score (-1.0 to 1.0)

### 4. **prices** - Token Price History
```sql
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    token_id INTEGER REFERENCES tokens(id),
    price_usd NUMERIC(20, 10),
    price_sol NUMERIC(20, 10),
    trade_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_latest BOOLEAN DEFAULT FALSE
);
```

**Purpose**: Historical price data for tokens.

### 5. **monitoring_logs** - System Monitoring Activity
```sql
CREATE TABLE monitoring_logs (
    id SERIAL PRIMARY KEY,
    monitoring_type TEXT NOT NULL, -- 'mention_check', 'token_update', 'price_update'
    status TEXT NOT NULL, -- 'success', 'error', 'partial'
    tik_toks_processed INTEGER DEFAULT 0,
    new_mentions_found INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_details TEXT
);
```

**Purpose**: Tracks the performance and health of the monitoring system.

### 6. **token_mentions_summary** - Aggregated Mention Data
```sql
CREATE TABLE token_mentions_summary (
    id SERIAL PRIMARY KEY,
    token_id INTEGER REFERENCES tokens(id),
    total_mentions INTEGER DEFAULT 0,
    unique_tiktoks INTEGER DEFAULT 0,
    last_mention_at TIMESTAMP WITH TIME ZONE,
    mention_trend_24h INTEGER DEFAULT 0,
    mention_trend_7d INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(token_id)
);
```

**Purpose**: Pre-calculated summary statistics for quick analytics and trending.

## 🔧 Database Functions

### 1. **update_token_mention_count()**
Automatically updates mention counts and summaries when new mentions are added.

### 2. **get_mention_trends(token_id, days)**
Returns mention trends over specified time periods for analysis.

### 3. **cleanup_old_monitoring_logs()**
Removes monitoring logs older than 30 days to maintain performance.

## 📊 Performance Indexes

The schema includes comprehensive indexing for optimal query performance:

- **Primary indexes**: All primary keys and foreign keys
- **Composite indexes**: Common query patterns (token + date, username + created)
- **Time-based indexes**: For temporal queries and monitoring
- **Text search indexes**: For symbol and URI lookups

## 🚀 Setup Instructions

### 1. **Create Database**
```bash
# In your Supabase dashboard, create a new project
# Or use existing project
```

### 2. **Run Schema Script**
```bash
# Copy the contents of supabase_schema.sql
# Run in Supabase SQL Editor
```

### 3. **Verify Tables**
```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 4. **Test Functions**
```sql
-- Test the mention trends function
SELECT * FROM get_mention_trends(1, 7);

-- Check trigger is working
SELECT trigger_name FROM information_schema.triggers;
```

## 🔒 Security & Permissions

- **Row Level Security (RLS)**: Enabled on all tables
- **Policies**: Allow all operations (can be restricted later)
- **API Access**: Use Supabase client with proper keys

## 📈 Monitoring & Analytics

The enhanced schema supports:

- **Real-time mention tracking**
- **Trend analysis** (24h, 7d changes)
- **Performance monitoring**
- **Sentiment analysis**
- **Automated aggregation**

## 🚨 Important Notes

1. **Symbol Uniqueness**: Token symbols are NOT unique - multiple tokens can share the same symbol
2. **URI Uniqueness**: Token URIs ARE unique - each token has a distinct identifier
3. **Automatic Updates**: Mention counts update automatically via triggers
4. **Data Retention**: Monitoring logs are automatically cleaned up after 30 days

## 🔄 Schema Updates

If you need to add the new fields to existing tables:

```sql
-- Add new columns to existing tokens table
ALTER TABLE tokens ADD COLUMN last_mention_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add new columns to existing tiktoks table
ALTER TABLE tiktoks ADD COLUMN mention_count INTEGER DEFAULT 0;

-- Add new columns to existing mentions table
ALTER TABLE mentions ADD COLUMN comment_text TEXT;
ALTER TABLE mentions ADD COLUMN sentiment_score NUMERIC(3, 2);

-- Create new tables
-- (Copy the CREATE TABLE statements for monitoring_logs and token_mentions_summary)

-- Create indexes and functions
-- (Copy the remaining schema elements)
```
