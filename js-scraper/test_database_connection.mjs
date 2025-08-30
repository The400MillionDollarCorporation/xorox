import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing Supabase database connection...');
    
    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing environment variables!');
      console.log('Please create a .env file with:');
      console.log('SUPABASE_URL=your_supabase_url_here');
      console.log('SUPABASE_KEY=your_supabase_anon_key_here');
      return false;
    }
    
    console.log('✅ Environment variables found');
    
    // Test connection
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('tiktoks')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    
    // Check required tables
    const requiredTables = ['tiktoks', 'tokens', 'mentions'];
    console.log('\n🔍 Checking required tables...');
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: Table exists and accessible`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
      }
    }
    
    // Check if tokens table has data
    const { data: tokenCount, error: tokenError } = await supabase
      .from('tokens')
      .select('*', { count: 'exact' });
    
    if (tokenError) {
      console.log('   ❌ Could not count tokens');
    } else {
      console.log(`   📊 Tokens table has ${tokenCount.length} records`);
    }
    
    console.log('\n🎉 Database is ready for TikTok scraping!');
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

// Run test
testDatabaseConnection().then(success => {
  if (success) {
    console.log('\n✅ You can now run: node index.mjs');
  } else {
    console.log('\n❌ Please fix the database issues before running the scraper');
    process.exit(1);
  }
});
