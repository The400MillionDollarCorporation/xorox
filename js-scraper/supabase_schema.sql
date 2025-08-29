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
