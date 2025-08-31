import { createClient } from '@supabase/supabase-js';

// Test the TikTok API endpoints
async function testTikTokAPI() {
  console.log('🧪 Testing TikTok API Endpoints...\n');

  try {
    // Test 1: Direct Supabase connection
    console.log('1️⃣ Testing direct Supabase connection...');
    
    const supabaseUrl = 'https://srsapzqvwxgrohisrwnm.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyc2FwenF2d3hncm9oaXNyd25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODg4MTUsImV4cCI6MjA2NzM2NDgxNX0.IGGaJcpeEGj-Y7Drb-HRvSL7bnsJdX1dFrHtvnfyKLI';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created');

    // Test 2: Check if tiktoks table exists and has data
    console.log('\n2️⃣ Checking tiktoks table...');
    
    const { data: tiktoks, error: tiktokError, count } = await supabase
      .from('tiktoks')
      .select('*', { count: 'exact' })
      .limit(5);

    if (tiktokError) {
      console.error('❌ Error fetching TikTok data:', tiktokError);
    } else {
      console.log(`✅ TikTok data fetched successfully: ${tiktoks?.length || 0} records`);
      console.log(`📊 Total count: ${count || 0}`);
      
      if (tiktoks && tiktoks.length > 0) {
        console.log('📱 Sample TikTok data:');
        tiktoks.slice(0, 2).forEach((tiktok, index) => {
          console.log(`  ${index + 1}. ${tiktok.username} - ${tiktok.views} views, ${tiktok.comments} comments`);
        });
      } else {
        console.log('⚠️ No TikTok data found in database');
      }
    }

    // Test 3: Check if mentions table exists and has data
    console.log('\n3️⃣ Checking mentions table...');
    
    const { data: mentions, error: mentionsError } = await supabase
      .from('mentions')
      .select('*, token:symbol, name')
      .limit(5);

    if (mentionsError) {
      console.error('❌ Error fetching mentions data:', mentionsError);
    } else {
      console.log(`✅ Mentions data fetched successfully: ${mentions?.length || 0} records`);
      
      if (mentions && mentions.length > 0) {
        console.log('🔗 Sample mentions data:');
        mentions.slice(0, 2).forEach((mention, index) => {
          console.log(`  ${index + 1}. Token: ${mention.token?.symbol || mention.token_id}, Count: ${mention.count}`);
        });
      } else {
        console.log('⚠️ No mentions data found in database');
      }
    }

    // Test 4: Check if tokens table exists and has data
    console.log('\n4️⃣ Checking tokens table...');
    
    const { data: tokens, error: tokensError } = await supabase
      .from('tokens')
      .select('*')
      .limit(5);

    if (tokensError) {
      console.error('❌ Error fetching tokens data:', tokensError);
    } else {
      console.log(`✅ Tokens data fetched successfully: ${tokens?.length || 0} records`);
      
      if (tokens && tokens.length > 0) {
        console.log('🪙 Sample tokens data:');
        tokens.slice(0, 2).forEach((token, index) => {
          console.log(`  ${index + 1}. ${token.symbol} (${token.name}) - ${token.views} views, ${token.mentions} mentions`);
        });
      } else {
        console.log('⚠️ No tokens data found in database');
      }
    }

    // Test 5: Test the Next.js API endpoint
    console.log('\n5️⃣ Testing Next.js API endpoint...');
    
    try {
      const response = await fetch('http://localhost:3000/api/supabase/get-tiktoks?limit=5');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Next.js API endpoint working');
        console.log(`📊 API returned: ${data.data?.length || 0} TikTok videos`);
        console.log(`📈 Total count: ${data.count || 0}`);
      } else {
        console.error(`❌ Next.js API error: ${response.status} ${response.statusText}`);
      }
    } catch (apiError) {
      console.error('❌ Next.js API connection failed:', apiError.message);
      console.log('💡 Make sure your Next.js dev server is running on port 3000');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('\n🏁 Test completed!');
}

// Run the test
testTikTokAPI();
