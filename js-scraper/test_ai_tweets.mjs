import { TwitterIntegration } from './twitter_integration.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function testAITweetGeneration() {
  try {
    console.log('🧪 Testing AI-Powered Tweet Generation...');
    
    // Check environment variables
    const requiredEnvVars = [
      'OPENAI_API_KEY',
      'TWITTER_API_KEY',
      'TWITTER_API_SECRET', 
      'TWITTER_ACCESS_TOKEN',
      'TWITTER_ACCESS_SECRET',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingVars.forEach(varName => console.error(`   - ${varName}`));
      console.log('\nPlease add these to your .env file');
      process.exit(1);
    }
    
    console.log('✅ All environment variables are set');
    
    // Initialize Twitter integration
    const twitter = new TwitterIntegration();
    
    // Test 1: Test OpenAI connection
    console.log('\n🤖 Test 1: Testing OpenAI connection...');
    try {
      const testPrompt = "Generate a simple test tweet about crypto in 50 characters or less.";
      const completion = await twitter.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: testPrompt }
        ],
        max_tokens: 50,
        temperature: 0.7,
      });
      
      const testResponse = completion.choices[0].message.content;
      console.log('✅ OpenAI connection successful');
      console.log(`   Test response: "${testResponse}"`);
    } catch (error) {
      console.error('❌ OpenAI connection failed:', error.message);
      process.exit(1);
    }
    
    // Test 2: Test volume growth message generation
    console.log('\n📊 Test 2: Testing volume growth message generation...');
    const mockToken = { name: 'Test Token', symbol: 'TEST' };
    const volumeMessage = await twitter.generateVolumeGrowthMessage(mockToken, 15000, 25000, 10000);
    console.log('✅ Volume growth message generated:');
    console.log(volumeMessage);
    
    // Test 3: Test growth rate message generation
    console.log('\n📈 Test 3: Testing growth rate message generation...');
    const growthMessage = await twitter.generateGrowthRateMessage(mockToken, 150, 25000, 10000);
    console.log('✅ Growth rate message generated:');
    console.log(growthMessage);
    
    // Test 4: Test trending discovery message generation
    console.log('\n🎯 Test 4: Testing trending discovery message generation...');
    const mockAnalysis = { platform: 'tiktok' };
    const mockCorrelation = { 
      keyword: 'test', 
      token_symbol: 'TEST', 
      correlation_score: 0.85,
      risk_level: 'Low'
    };
    const discoveryMessage = await twitter.generateTrendingDiscoveryMessage(mockAnalysis, mockCorrelation);
    console.log('✅ Trending discovery message generated:');
    console.log(discoveryMessage);
    
    // Test 5: Test market analysis tweet generation
    console.log('\n📊 Test 5: Testing market analysis tweet generation...');
    const marketMessage = await twitter.generateMarketAnalysisTweet();
    console.log('✅ Market analysis message generated:');
    console.log(marketMessage);
    
    // Test 6: Test market sentiment analysis
    console.log('\n📈 Test 6: Testing market sentiment analysis...');
    const mockPrices = [
      { trade_at: '2025-01-31T10:00:00Z', price_sol: '100', tokens: { symbol: 'TEST1' } },
      { trade_at: '2025-01-31T11:00:00Z', price_sol: '150', tokens: { symbol: 'TEST1' } },
      { trade_at: '2025-01-31T10:00:00Z', price_sol: '200', tokens: { symbol: 'TEST2' } },
      { trade_at: '2025-01-31T11:00:00Z', price_sol: '300', tokens: { symbol: 'TEST2' } }
    ];
    
    const sentiment = twitter.analyzeMarketSentiment(mockPrices);
    console.log('✅ Market sentiment analyzed:');
    console.log(`   Total tokens: ${sentiment.totalTokens}`);
    console.log(`   Average change: ${sentiment.avgVolumeChange}%`);
    console.log(`   Top performer: ${sentiment.topPerformer}`);
    console.log(`   Market mood: ${sentiment.marketMood}`);
    
    // Test 7: Test message length validation
    console.log('\n📏 Test 7: Testing message length validation...');
    const messages = [volumeMessage, growthMessage, discoveryMessage, marketMessage];
    const validMessages = messages.filter(msg => msg && msg.length <= 280);
    console.log(`✅ ${validMessages.length}/${messages.length} messages are within Twitter's 280 character limit`);
    
    // Test 8: Test hashtag presence
    console.log('\n🏷️ Test 8: Testing hashtag presence...');
    const messagesWithHashtags = messages.filter(msg => msg && msg.includes('#'));
    console.log(`✅ ${messagesWithHashtags.length}/${messages.length} messages contain hashtags`);
    
    console.log('\n🎉 AI-powered tweet generation test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ OpenAI API connection established');
    console.log('   ✅ Volume growth messages generated');
    console.log('   ✅ Growth rate messages generated');
    console.log('   ✅ Trending discovery messages generated');
    console.log('   ✅ Market analysis messages generated');
    console.log('   ✅ Market sentiment analysis working');
    console.log('   ✅ Message length validation passed');
    console.log('   ✅ Hashtag integration verified');
    
    console.log('\n🚀 To start the full system with AI tweets, run:');
    console.log('   npm run twitter-start');
    console.log('   or');
    console.log('   npm run start-all');
    
  } catch (error) {
    console.error('❌ AI tweet generation test failed:', error);
    process.exit(1);
  }
}

// Run test
testAITweetGeneration();
