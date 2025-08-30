import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for now
const SUPABASE_URL = 'https://srsapzqvwxgrohisrwnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyc2FwenF2d3hncm9oaXNyd25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODg4MTUsImV4cCI6MjA2NzM2NDgxNX0.IGGaJcpeEGj-Y7Drb-HRvSL7bnsJdX1dFrHtvnfyKLI';

async function setupDatabase() {
  try {
    console.log('🗄️ Setting up Frontend Database Tables...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('✅ Supabase client initialized');
    
    // Create basic tables if they don't exist
    const tables = [
      {
        name: 'tokens',
        sql: `
          CREATE TABLE IF NOT EXISTS tokens (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            symbol TEXT NOT NULL,
            address TEXT,
            uri TEXT UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            create_tx TEXT,
            views BIGINT DEFAULT 0,
            mentions INTEGER DEFAULT 0
          );
        `
      },
      {
        name: 'tiktoks',
        sql: `
          CREATE TABLE IF NOT EXISTS tiktoks (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            url TEXT NOT NULL,
            thumbnail TEXT,
            created_at TIMESTAMP WITH TIME ZONE,
            fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            views BIGINT DEFAULT 0,
            comments INTEGER DEFAULT 0,
            UNIQUE(url)
          );
        `
      },
      {
        name: 'prices',
        sql: `
          CREATE TABLE IF NOT EXISTS prices (
            id SERIAL PRIMARY KEY,
            token_id INTEGER REFERENCES tokens(id),
            price_usd NUMERIC(20, 10),
            price_sol NUMERIC(20, 10),
            trade_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_latest BOOLEAN DEFAULT FALSE
          );
        `
      },
      {
        name: 'mentions',
        sql: `
          CREATE TABLE IF NOT EXISTS mentions (
            id SERIAL PRIMARY KEY,
            tiktok_id TEXT REFERENCES tiktoks(id),
            token_id INTEGER REFERENCES tokens(id),
            count INTEGER DEFAULT 1,
            mention_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }
    ];
    
    for (const table of tables) {
      try {
        console.log(`🔧 Creating table: ${table.name}`);
        
        // Try to create the table using RPC if available
        const { error: rpcError } = await supabase.rpc('exec_sql', { sql: table.sql });
        
        if (rpcError) {
          console.log(`⚠️ RPC method not available for ${table.name}, table may already exist`);
          
          // Test if table exists by trying to select from it
          const { data, error: selectError } = await supabase
            .from(table.name)
            .select('*')
            .limit(1);
          
          if (selectError) {
            console.log(`❌ Table ${table.name} does not exist and cannot be created via RPC`);
            console.log(`   You may need to create it manually in the Supabase SQL editor`);
          } else {
            console.log(`✅ Table ${table.name} exists and is accessible`);
          }
        } else {
          console.log(`✅ Table ${table.name} created successfully`);
        }
        
      } catch (error) {
        console.log(`⚠️ Error with table ${table.name}:`, error.message);
      }
    }
    
    // Test table access
    console.log('\n🔍 Testing table access...');
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${table.name}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table.name}: Accessible`);
        }
      } catch (err) {
        console.log(`   ❌ ${table.name}: ${err.message}`);
      }
    }
    
    console.log('\n📋 Setup Summary:');
    console.log('   If tables are not accessible, you may need to:');
    console.log('   1. Run the full setup script: cd js-scraper && node setup_database.mjs');
    console.log('   2. Or create tables manually in Supabase SQL editor');
    console.log('   3. Check your Supabase permissions and RLS policies');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupDatabase();
