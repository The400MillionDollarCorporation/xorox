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
    mentions INTEGER DEFAULT 0
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
    mention_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- Create indexes for performance
CREATE INDEX idx_mentions_tiktok_id ON mentions(tiktok_id);
CREATE INDEX idx_mentions_token_id ON mentions(token_id);
CREATE INDEX idx_prices_token_id ON prices(token_id);
CREATE INDEX idx_prices_is_latest ON prices(is_latest);
CREATE INDEX idx_tokens_uri ON tokens(uri);
CREATE INDEX idx_tokens_symbol ON tokens(symbol);

-- Optional: Add RLS (Row Level Security) policies
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktoks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow insert and select operations
CREATE POLICY "Allow all operations" ON tokens FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON tiktoks FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON mentions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON prices FOR ALL USING (true);
