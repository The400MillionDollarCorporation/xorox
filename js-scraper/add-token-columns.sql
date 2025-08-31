-- Add missing columns to tokens table
-- Run this in your Supabase SQL editor or database client

-- Add decimals column (default to 9 for Solana tokens)
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS decimals INTEGER DEFAULT 9;

-- Add address column for token contract address
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS address TEXT;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tokens' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Update existing records with default values if needed
UPDATE tokens SET decimals = 9 WHERE decimals IS NULL;
UPDATE tokens SET address = '' WHERE address IS NULL;

-- Verify sample data
SELECT id, name, symbol, address, decimals, market_cap, total_supply, last_updated
FROM tokens 
LIMIT 5;
