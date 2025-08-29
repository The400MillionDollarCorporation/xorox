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

-- Row Level Security for telegram_messages
ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;

-- Policies for telegram_messages
CREATE POLICY "Allow select for authenticated users" 
    ON telegram_messages FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for service_role" 
    ON telegram_messages FOR INSERT 
    WITH CHECK (auth.role() = 'service_role');

-- Function to create telegram_messages table (for RPC)
CREATE OR REPLACE FUNCTION create_telegram_messages_table()
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'telegram_messages') THEN
        CREATE TABLE telegram_messages (
            -- Same schema as above
            id SERIAL PRIMARY KEY,
            channel_id TEXT NOT NULL,
            channel_title TEXT,
            message_id BIGINT NOT NULL,
            text TEXT,
            date BIGINT,
            -- ... rest of the columns ...
            UNIQUE(channel_id, message_id)
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create telegram_channels table (for RPC)
CREATE OR REPLACE FUNCTION create_telegram_channels_table()
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'telegram_channels') THEN
        CREATE TABLE telegram_channels (
            -- Same schema as above
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
    END IF;
END;
$$ LANGUAGE plpgsql;
