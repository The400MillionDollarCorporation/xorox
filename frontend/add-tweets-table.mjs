import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for now
const SUPABASE_URL = 'https://srsapzqvwxgrohisrwnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyc2FwenF2d3hncm9oaXNyd25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODg4MTUsImV4cCI6MjA2NzM2NDgxNX0.IGGaJcpeEGj-Y7Drb-HRvSL7bnsJdX1dFrHtvnfyKLI';

async function addTweetsTable() {
  try {
    console.log('🗄️ Adding tweets table to database...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('✅ Supabase client initialized');
    
    // Create tweets table
    const createTweetsTable = `
      CREATE TABLE IF NOT EXISTS tweets (
        id SERIAL PRIMARY KEY,
        token_id INTEGER REFERENCES tokens(id),
        tweet TEXT NOT NULL,
        tweet_id TEXT UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        tweet_type TEXT DEFAULT 'analysis',
        engagement_metrics JSONB DEFAULT '{}'
      );
    `;
    
    console.log('🔧 Creating tweets table...');
    
    // Try to create the table using RPC if available
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql: createTweetsTable });
    
    if (rpcError) {
      console.log('⚠️ RPC method not available, table may already exist');
      
      // Test if table exists by trying to select from it
      const { data, error: selectError } = await supabase
        .from('tweets')
        .select('*')
        .limit(1);
      
      if (selectError) {
        console.log('❌ Table tweets does not exist and cannot be created via RPC');
        console.log('   You may need to create it manually in the Supabase SQL editor');
        console.log('   SQL to run:');
        console.log(createTweetsTable);
      } else {
        console.log('✅ Table tweets exists and is accessible');
      }
    } else {
      console.log('✅ Table tweets created successfully');
    }
    
    // Create indexes
    console.log('🔧 Creating indexes for tweets table...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_tweets_token_id ON tweets(token_id);',
      'CREATE INDEX IF NOT EXISTS idx_tweets_tweet_id ON tweets(tweet_id);',
      'CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets(created_at);'
    ];
    
    for (const index of indexes) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: index });
        if (error) {
          console.log(`⚠️ Index creation may need manual execution: ${index}`);
        } else {
          console.log(`✅ Index created: ${index.split(' ')[2]}`);
        }
      } catch (err) {
        console.log(`⚠️ Index creation failed: ${index}`);
      }
    }
    
    // Enable RLS and create policies
    console.log('🔧 Setting up RLS policies...');
    
    const rlsSetup = [
      'ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY IF NOT EXISTS "Allow all operations" ON tweets FOR ALL USING (true);'
    ];
    
    for (const policy of rlsSetup) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.log(`⚠️ RLS setup may need manual execution: ${policy}`);
        } else {
          console.log(`✅ RLS policy applied: ${policy.split(' ')[0]}`);
        }
      } catch (err) {
        console.log(`⚠️ RLS setup failed: ${policy}`);
      }
    }
    
    // Test table access
    console.log('\n🔍 Testing tweets table access...');
    
    try {
      const { data, error } = await supabase
        .from('tweets')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ tweets: ${error.message}`);
      } else {
        console.log(`   ✅ tweets: Accessible (${data?.length || 0} rows)`);
      }
    } catch (err) {
      console.log(`   ❌ tweets: ${err.message}`);
    }
    
    console.log('\n📋 Setup Summary:');
    console.log('   If the tweets table is not accessible, you may need to:');
    console.log('   1. Run the full setup script: cd js-scraper && node setup_database.mjs');
    console.log('   2. Or create the table manually in Supabase SQL editor');
    console.log('   3. Check your Supabase permissions and RLS policies');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup
addTweetsTable();
