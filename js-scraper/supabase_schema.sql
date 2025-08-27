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
    last_mention_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    last_mention_check TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    mention_count INTEGER DEFAULT 0,
    UNIQUE(url)
);

-- Create mentions table
CREATE TABLE mentions (
    id SERIAL PRIMARY KEY,
    tiktok_id TEXT REFERENCES tiktoks(id),
    token_id INTEGER REFERENCES tokens(id),
    count INTEGER DEFAULT 1,
    mention_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    comment_text TEXT,
    sentiment_score NUMERIC(3, 2) -- -1.0 to 1.0 for sentiment analysis
);

-- Create prices table (if not already exists)
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    token_id INTEGER REFERENCES tokens(id),
    price_usd NUMERIC(20, 10),
    price_sol NUMERIC(20, 10),
    trade_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_latest BOOLEAN DEFAULT FALSE
);

-- Create monitoring_logs table for tracking monitoring activities
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

-- Create token_mentions_summary table for aggregated mention data
CREATE TABLE token_mentions_summary (
    id SERIAL PRIMARY KEY,
    token_id INTEGER REFERENCES tokens(id),
    total_mentions INTEGER DEFAULT 0,
    unique_tiktoks INTEGER DEFAULT 0,
    last_mention_at TIMESTAMP WITH TIME ZONE,
    mention_trend_24h INTEGER DEFAULT 0, -- Change in mentions over 24 hours
    mention_trend_7d INTEGER DEFAULT 0, -- Change in mentions over 7 days
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(token_id)
);

-- Create indexes for performance
CREATE INDEX idx_mentions_tiktok_id ON mentions(tiktok_id);
CREATE INDEX idx_mentions_token_id ON mentions(token_id);
CREATE INDEX idx_mentions_mention_at ON mentions(mention_at);
CREATE INDEX idx_prices_token_id ON prices(token_id);
CREATE INDEX idx_prices_is_latest ON prices(is_latest);
CREATE INDEX idx_tokens_uri ON tokens(uri);
CREATE INDEX idx_tokens_symbol ON tokens(symbol);
CREATE INDEX idx_tokens_last_mention_update ON tokens(last_mention_update);
CREATE INDEX idx_tiktoks_last_mention_check ON tiktoks(last_mention_check);
CREATE INDEX idx_tiktoks_mention_count ON tiktoks(mention_count);
CREATE INDEX idx_monitoring_logs_started_at ON monitoring_logs(started_at);
CREATE INDEX idx_monitoring_logs_status ON monitoring_logs(status);
CREATE INDEX idx_token_mentions_summary_token_id ON token_mentions_summary(token_id);
CREATE INDEX idx_token_mentions_summary_updated_at ON token_mentions_summary(updated_at);

-- Create composite indexes for common query patterns
CREATE INDEX idx_mentions_token_mention_at ON mentions(token_id, mention_at);
CREATE INDEX idx_tiktoks_username_created ON tiktoks(username, created_at);

-- Optional: Add RLS (Row Level Security) policies
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktoks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_mentions_summary ENABLE ROW LEVEL SECURITY;

-- Create policies to allow insert and select operations
CREATE POLICY "Allow all operations" ON tokens FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON tiktoks FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON mentions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON prices FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON monitoring_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON token_mentions_summary FOR ALL USING (true);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_token_mention_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update token mention count
    UPDATE tokens 
    SET mentions = mentions + NEW.count,
        last_mention_update = CURRENT_TIMESTAMP
    WHERE id = NEW.token_id;
    
    -- Update TikTok mention count
    UPDATE tiktoks 
    SET mention_count = mention_count + NEW.count
    WHERE id = NEW.tiktok_id;
    
    -- Update or insert token mentions summary
    INSERT INTO token_mentions_summary (token_id, total_mentions, unique_tiktoks, last_mention_at, updated_at)
    VALUES (NEW.token_id, NEW.count, 1, NEW.mention_at, CURRENT_TIMESTAMP)
    ON CONFLICT (token_id) 
    DO UPDATE SET 
        total_mentions = token_mentions_summary.total_mentions + NEW.count,
        unique_tiktoks = (
            SELECT COUNT(DISTINCT tiktok_id) 
            FROM mentions 
            WHERE token_id = NEW.token_id
        ),
        last_mention_at = GREATEST(token_mentions_summary.last_mention_at, NEW.mention_at),
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update mention counts
CREATE TRIGGER trigger_update_mention_counts
    AFTER INSERT ON mentions
    FOR EACH ROW
    EXECUTE FUNCTION update_token_mention_count();

-- Create function to clean up old monitoring logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_monitoring_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM monitoring_logs 
    WHERE started_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to get mention trends
CREATE OR REPLACE FUNCTION get_mention_trends(token_id_param INTEGER, days INTEGER DEFAULT 7)
RETURNS TABLE(
    date DATE,
    mention_count BIGINT,
    trend_change NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_mentions AS (
        SELECT 
            DATE(mention_at) as date,
            COUNT(*) as mention_count
        FROM mentions 
        WHERE token_id = token_id_param 
        AND mention_at >= CURRENT_DATE - INTERVAL '1 day' * days
        GROUP BY DATE(mention_at)
        ORDER BY date
    ),
    trend_calc AS (
        SELECT 
            date,
            mention_count,
            LAG(mention_count) OVER (ORDER BY date) as prev_count
        FROM daily_mentions
    )
    SELECT 
        date,
        mention_count,
        CASE 
            WHEN prev_count IS NULL OR prev_count = 0 THEN 0
            ELSE ROUND(((mention_count::NUMERIC - prev_count) / prev_count * 100), 2)
        END as trend_change
    FROM trend_calc
    ORDER BY date;
END;
$$ LANGUAGE plpgsql;
