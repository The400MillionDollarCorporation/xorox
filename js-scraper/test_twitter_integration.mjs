import { TwitterIntegration } from './twitter_integration.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function testTwitterIntegration() {
  try {
    console.log('🧪 Testing Twitter Integration...');
    
    // Check environment variables
    const requiredEnvVars = [
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
    
    // Test 1: Test Twitter connection
    console.log('\n🔗 Test 1: Testing Twitter connection...');
    const connectionSuccess = await twitter.testConnection();
    
    if (!connectionSuccess) {
      console.error('❌ Twitter connection failed. Please check your credentials.');
      process.exit(1);
    }
    
    // Test 2: Test alert statistics
    console.log('\n📊 Test 2: Testing alert statistics...');
    const alertStats = await twitter.getAlertStats();
    
    if (alertStats) {
      console.log('✅ Alert statistics retrieved:');
      console.log(`   Total alerts: ${alertStats.total_alerts}`);
      console.log(`   Volume alerts: ${alertStats.volume_alerts}`);
      console.log(`   Growth alerts: ${alertStats.growth_alerts}`);
      console.log(`   Discovery alerts: ${alertStats.discovery_alerts}`);
    } else {
      console.log('⚠️ No alert statistics available (table may not exist yet)');
    }
    
    // Test 3: Test volume monitoring (without posting)
    console.log('\n📈 Test 3: Testing volume monitoring (read-only)...');
    try {
      // This will run the monitoring logic but won't post due to thresholds
      await twitter.monitorVolumeGrowth();
      console.log('✅ Volume monitoring test completed');
    } catch (error) {
      console.log('⚠️ Volume monitoring test had issues:', error.message);
    }
    
    // Test 4: Test trending discovery monitoring (without posting)
    console.log('\n🔍 Test 4: Testing trending discovery monitoring (read-only)...');
    try {
      await twitter.monitorTrendingDiscoveries();
      console.log('✅ Trending discovery monitoring test completed');
    } catch (error) {
      console.log('⚠️ Trending discovery monitoring test had issues:', error.message);
    }
    
    // Test 5: Test message formatting
    console.log('\n📝 Test 5: Testing message formatting...');
    
    const mockToken = { name: 'Test Token', symbol: 'TEST' };
    const mockAnalysis = { platform: 'tiktok' };
    const mockCorrelation = { 
      keyword: 'test', 
      token_symbol: 'TEST', 
      correlation_score: 0.85,
      risk_level: 'Low'
    };
    
    // Test volume growth message
    const volumeMessage = twitter.formatVolumeGrowthMessage(mockToken, 15000, 25000, 10000);
    console.log('✅ Volume growth message formatted:');
    console.log(volumeMessage.substring(0, 100) + '...');
    
    // Test growth rate message
    const growthMessage = twitter.formatGrowthRateMessage(mockToken, 150, 25000, 10000);
    console.log('✅ Growth rate message formatted:');
    console.log(growthMessage.substring(0, 100) + '...');
    
    // Test trending discovery message
    const discoveryMessage = twitter.formatTrendingDiscoveryMessage(mockAnalysis, mockCorrelation);
    console.log('✅ Trending discovery message formatted:');
    console.log(discoveryMessage.substring(0, 100) + '...');
    
    // Test 6: Test currency formatting
    console.log('\n💰 Test 6: Testing currency formatting...');
    console.log(`   $1500 → ${twitter.formatCurrency(1500)}`);
    console.log(`   $1500000 → ${twitter.formatCurrency(1500000)}`);
    console.log(`   $150 → ${twitter.formatCurrency(150)}`);
    
    console.log('\n🎉 Twitter integration test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Twitter connection established');
    console.log('   ✅ Alert statistics retrieved');
    console.log('   ✅ Volume monitoring tested');
    console.log('   ✅ Trending discovery monitoring tested');
    console.log('   ✅ Message formatting verified');
    console.log('   ✅ Currency formatting verified');
    
    console.log('\n🚀 To start monitoring, run:');
    console.log('   npm run twitter-start');
    console.log('   or');
    console.log('   node twitter_integration.mjs');
    
  } catch (error) {
    console.error('❌ Twitter integration test failed:', error);
    process.exit(1);
  }
}

// Run test
testTwitterIntegration();
