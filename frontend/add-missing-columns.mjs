import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://srsapzqvwxgrohisrwnm.supabase.co',
  process.env.SUPABASE_ANON_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyc2FwenF2d3hncm9oaXNyd25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODg4MTUsImV4cCI6MjA2NzM2NDgxNX0.IGGaJcpeEGj-Y7Drb-HRvSL7bnsJdX1dFrHtvnfyKLI'
);

async function addMissingColumns() {
  console.log('🔧 Adding missing columns to database...');
  
  try {
    // Add total_supply column to tokens table
    console.log('📊 Adding total_supply column to tokens table...');
    const { error: totalSupplyError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE tokens 
        ADD COLUMN IF NOT EXISTS total_supply NUMERIC(30, 0) DEFAULT 0;
      `
    });
    
    if (totalSupplyError) {
      console.log('ℹ️ total_supply column already exists or error:', totalSupplyError.message);
    } else {
      console.log('✅ total_supply column added to tokens table');
    }

    // Add market_cap column to tokens table
    console.log('📊 Adding market_cap column to tokens table...');
    const { error: marketCapError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE tokens 
        ADD COLUMN IF NOT EXISTS market_cap NUMERIC(20, 2) DEFAULT 0;
      `
    });
    
    if (marketCapError) {
      console.log('ℹ️ market_cap column already exists or error:', marketCapError.message);
    } else {
      console.log('✅ market_cap column added to tokens table');
    }

    // Add last_updated column to tokens table
    console.log('🕒 Adding last_updated column to tokens table...');
    const { error: lastUpdatedError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE tokens 
        ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      `
    });
    
    if (lastUpdatedError) {
      console.log('ℹ️ last_updated column already exists or error:', lastUpdatedError.message);
    } else {
      console.log('✅ last_updated column added to tokens table');
    }

    // Add token_uri column to prices table
    console.log('🔗 Adding token_uri column to prices table...');
    const { error: tokenUriError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE prices 
        ADD COLUMN IF NOT EXISTS token_uri TEXT;
      `
    });
    
    if (tokenUriError) {
      console.log('ℹ️ token_uri column already exists or error:', tokenUriError.message);
    } else {
      console.log('✅ token_uri column added to prices table');
    }

    // Add timestamp column to prices table
    console.log('⏰ Adding timestamp column to prices table...');
    const { error: timestampError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE prices 
        ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      `
    });
    
    if (timestampError) {
      console.log('ℹ️ timestamp column already exists or error:', timestampError.message);
    } else {
      console.log('✅ timestamp column added to prices table');
    }

    // Update existing prices records to set token_uri based on token_id
    console.log('🔄 Updating existing prices records with token_uri...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE prices 
        SET token_uri = tokens.uri 
        FROM tokens 
        WHERE prices.token_id = tokens.id 
        AND prices.token_uri IS NULL;
      `
    });
    
    if (updateError) {
      console.log('ℹ️ Could not update existing prices or already updated:', updateError.message);
    } else {
      console.log('✅ Existing prices records updated with token_uri');
    }

    // Update existing tokens records to set last_updated if null
    console.log('🔄 Updating existing tokens records with last_updated...');
    const { error: updateTokensError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE tokens 
        SET last_updated = COALESCE(last_updated, created_at, CURRENT_TIMESTAMP) 
        WHERE last_updated IS NULL;
      `
    });
    
    if (updateTokensError) {
      console.log('ℹ️ Could not update existing tokens or already updated:', updateTokensError.message);
    } else {
      console.log('✅ Existing tokens records updated with last_updated');
    }

    console.log('🎉 Database migration completed successfully!');
    
    // Verify the changes
    console.log('\n🔍 Verifying database structure...');
    
    const { data: tokensColumns, error: tokensColError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'tokens' 
        AND column_name IN ('market_cap', 'last_updated')
        ORDER BY column_name;
      `
    });
    
    if (!tokensColError && tokensColumns) {
      console.log('📊 Tokens table columns:');
      tokensColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

    const { data: pricesColumns, error: pricesColError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'prices' 
        AND column_name IN ('token_uri', 'timestamp')
        ORDER BY column_name;
      `
    });
    
    if (!pricesColError && pricesColumns) {
      console.log('📈 Prices table columns:');
      pricesColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

  } catch (error) {
    console.error('❌ Error during database migration:', error);
    throw error;
  }
}

// Run the migration
addMissingColumns()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
