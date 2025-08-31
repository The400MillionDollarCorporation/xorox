-- Create tokens table
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
    market_cap NUMERIC(20, 2) DEFAULT 0,
    total_supply NUMERIC(30, 0) DEFAULT 0,
    decimals INTEGER DEFAULT 9,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tiktoks table
CREATE TABLE tiktoks (
    id TEXT PRIMARY KEY,  -- TikTok video ID
    username TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    views BIGINT DEFAULT 0,
    comments INTEGER DEFAULT 0,
    UNIQUE(url)
);

-- Create mentions table
CREATE TABLE mentions (
    id SERIAL PRIMARY KEY,
    tiktok_id TEXT REFERENCES tiktoks(id),
    token_id INTEGER REFERENCES tokens(id),
    count INTEGER DEFAULT 1,
    mention_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source TEXT DEFAULT 'tiktok', -- 'tiktok' or 'telegram'
    channel_id TEXT, -- For Telegram messages
    message_id BIGINT -- For Telegram messages
);

-- Create tweets table
CREATE TABLE tweets (
    id SERIAL PRIMARY KEY,
    token_id INTEGER REFERENCES tokens(id),
    tweet TEXT NOT NULL,
    tweet_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tweet_type TEXT DEFAULT 'analysis', -- 'analysis', 'alert', 'discovery'
    engagement_metrics JSONB DEFAULT '{}' -- likes, retweets, replies
);

-- Create prices table (if not already exists)
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    token_id INTEGER REFERENCES tokens(id),
    token_uri TEXT, -- Add token_uri for direct reference
    price_usd NUMERIC(20, 10),
    price_sol NUMERIC(20, 10),
    trade_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Add timestamp for compatibility
    is_latest BOOLEAN DEFAULT FALSE
);

-- Add index for token_uri lookups in prices table
CREATE INDEX idx_prices_token_uri ON prices(token_uri);

-- Add constraint to ensure token_uri references valid tokens
ALTER TABLE prices ADD CONSTRAINT fk_prices_token_uri 
    FOREIGN KEY (token_uri) REFERENCES tokens(uri) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_mentions_tiktok_id ON mentions(tiktok_id);
CREATE INDEX idx_mentions_token_id ON mentions(token_id);
CREATE INDEX idx_mentions_source ON mentions(source);
CREATE INDEX idx_mentions_channel_id ON mentions(channel_id);
CREATE INDEX idx_mentions_message_id ON mentions(message_id);
CREATE INDEX idx_tweets_token_id ON tweets(token_id);
CREATE INDEX idx_tweets_tweet_id ON tweets(tweet_id);
CREATE INDEX idx_tweets_created_at ON tweets(created_at);
CREATE INDEX idx_prices_token_id ON prices(token_id);
CREATE INDEX idx_prices_is_latest ON prices(is_latest);
CREATE INDEX idx_tokens_uri ON tokens(uri);
CREATE INDEX idx_tokens_symbol ON tokens(symbol);

-- Optional: Add RLS (Row Level Security) policies
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktoks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow insert and select operations
CREATE POLICY "Allow all operations" ON tokens FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON tiktoks FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON mentions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON tweets FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON prices FOR ALL USING (true);

-- Create telegram_channels table
CREATE TABLE IF NOT EXISTS telegram_channels (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    enabled BOOLEAN DEFAULT true,
    last_message_id BIGINT DEFAULT 0,
    scrape_media BOOLEAN DEFAULT false,
    scrape_interval_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create telegram_messages table
CREATE TABLE IF NOT EXISTS telegram_messages (
    id SERIAL PRIMARY KEY,
    channel_id TEXT NOT NULL,
    channel_title TEXT,
    message_id BIGINT NOT NULL,
    text TEXT,
    date BIGINT,
    author_signature TEXT,
    forward_from_chat_id TEXT,
    forward_from_chat_title TEXT,
    forward_from_message_id BIGINT,
    forward_date BIGINT,
    reply_to_message_id BIGINT,
    edit_date BIGINT,
    media_group_id TEXT,
    has_photo BOOLEAN DEFAULT false,
    has_video BOOLEAN DEFAULT false,
    has_document BOOLEAN DEFAULT false,
    has_audio BOOLEAN DEFAULT false,
    has_voice BOOLEAN DEFAULT false,
    has_video_note BOOLEAN DEFAULT false,
    has_sticker BOOLEAN DEFAULT false,
    has_animation BOOLEAN DEFAULT false,
    has_contact BOOLEAN DEFAULT false,
    has_location BOOLEAN DEFAULT false,
    has_venue BOOLEAN DEFAULT false,
    has_poll BOOLEAN DEFAULT false,
    photo_urls TEXT[],
    video_url TEXT,
    document_url TEXT,
    audio_url TEXT,
    voice_url TEXT,
    views BIGINT,
    reactions_count BIGINT,
    entities JSONB,
    caption TEXT,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB,
    
    UNIQUE(channel_id, message_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_telegram_messages_channel_id ON telegram_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_date ON telegram_messages(date);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_text ON telegram_messages USING GIN (to_tsvector('english', text));

-- Enable Row Level Security for telegram tables
ALTER TABLE telegram_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for telegram tables
CREATE POLICY "Allow all operations" ON telegram_channels FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON telegram_messages FOR ALL USING (true);

-- Create pattern_analysis_results table for storing analysis reports
CREATE TABLE IF NOT EXISTS pattern_analysis_results (
    id SERIAL PRIMARY KEY,
    analysis_type TEXT NOT NULL, -- 'tiktok', 'telegram', 'comprehensive'
    platform TEXT, -- 'tiktok', 'telegram', 'combined'
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    summary JSONB,
    trending_keywords JSONB,
    correlations JSONB,
    recommendations JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pattern_correlations table for detailed correlation data
CREATE TABLE IF NOT EXISTS pattern_correlations (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER REFERENCES pattern_analysis_results(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    token_name TEXT,
    token_symbol TEXT,
    token_uri TEXT,
    correlation_score DECIMAL(5,4),
    social_metrics JSONB,
    trading_metrics JSONB,
    risk_level TEXT,
    recommendation_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trending_keywords table for keyword tracking
CREATE TABLE IF NOT EXISTS trending_keywords (
    id SERIAL PRIMARY KEY,
    keyword TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'tiktok', 'telegram'
    frequency INTEGER DEFAULT 1,
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    total_mentions INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pattern_analysis_type ON pattern_analysis_results(analysis_type);
CREATE INDEX IF NOT EXISTS idx_pattern_analysis_timestamp ON pattern_analysis_results(timestamp);
CREATE INDEX IF NOT EXISTS idx_pattern_correlations_analysis_id ON pattern_correlations(analysis_id);
CREATE INDEX IF NOT EXISTS idx_pattern_correlations_keyword ON pattern_correlations(keyword);
CREATE INDEX IF NOT EXISTS idx_trending_keywords_platform ON trending_keywords(platform);
CREATE INDEX IF NOT EXISTS idx_trending_keywords_frequency ON trending_keywords(frequency);

-- Enable Row Level Security for pattern analysis tables
ALTER TABLE pattern_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_keywords ENABLE ROW LEVEL SECURITY;

-- Create policies for pattern analysis tables
CREATE POLICY "Allow all operations" ON pattern_analysis_results FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON pattern_correlations FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON trending_keywords FOR ALL USING (true);

-- Create twitter_alerts table for storing Twitter alert history
CREATE TABLE IF NOT EXISTS twitter_alerts (
    id SERIAL PRIMARY KEY,
    alert_type TEXT NOT NULL, -- 'volume_growth', 'growth_rate', 'trending_discovery'
    token_uri TEXT,
    data JSONB,
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    tweet_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for twitter_alerts
CREATE INDEX IF NOT EXISTS idx_twitter_alerts_type ON twitter_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_twitter_alerts_token ON twitter_alerts(token_uri);
CREATE INDEX IF NOT EXISTS idx_twitter_alerts_posted_at ON twitter_alerts(posted_at);

-- Enable Row Level Security for twitter_alerts
ALTER TABLE twitter_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for twitter_alerts
CREATE POLICY "Allow all operations" ON twitter_alerts FOR ALL USING (true);
