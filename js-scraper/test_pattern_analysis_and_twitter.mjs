import { MemecoinPatternAnalyzer } from './pattern_analysis.mjs';
import { TwitterIntegration } from './twitter_integration.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function testPatternAnalysisAndTwitter() {
  try {
    console.log('🧪 Testing Pattern Analysis and Twitter Integration...\n');
    
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
    
    // Test 1: Pattern Analysis
    console.log('\n🔍 Testing Pattern Analysis...');
    const patternAnalyzer = new MemecoinPatternAnalyzer();
    
    // Test database connection
    try {
      const { data: testData, error: testError } = await patternAnalyzer.supabase
        .from('pattern_analysis_results')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.log('   ❌ pattern_analysis_results table:', testError.message);
      } else {
        console.log('   ✅ pattern_analysis_results table: Accessible');
      }
    } catch (err) {
      console.log('   ❌ pattern_analysis_results table:', err.message);
    }
    
    // Test correlations table
    try {
      const { data: testData, error: testError } = await patternAnalyzer.supabase
        .from('pattern_correlations')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.log('   ❌ pattern_correlations table:', testError.message);
      } else {
        console.log('   ✅ pattern_correlations table: Accessible');
      }
    } catch (err) {
      console.log('   ❌ pattern_correlations table:', err.message);
    }
    
    // Test trending keywords table
    try {
      const { data: testData, error: testError } = await patternAnalyzer.supabase
        .from('trending_keywords')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.log('   ❌ trending_keywords table:', testError.message);
      } else {
        console.log('   ✅ trending_keywords table: Accessible');
      }
    } catch (err) {
      console.log('   ❌ trending_keywords table:', err.message);
    }
    
    // Test 2: Twitter Integration
    console.log('\n🔍 Testing Twitter Integration...');
    const twitterIntegration = new TwitterIntegration();
    
    // Test twitter_alerts table
    try {
      const { data: testData, error: testError } = await twitterIntegration.supabase
        .from('twitter_alerts')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.log('   ❌ twitter_alerts table:', testError.message);
      } else {
        console.log('   ✅ twitter_alerts table: Accessible');
      }
    } catch (err) {
      console.log('   ❌ twitter_alerts table:', err.message);
    }
    
    // Test 3: Sample Data Storage
    console.log('\n🔍 Testing Sample Data Storage...');
    
    // Test pattern analysis storage
    try {
      const sampleAnalysisData = {
        summary: {
          totalVideos: 150,
          totalMessages: 300,
          analysisDate: new Date().toISOString()
        },
        trendingKeywords: [
          { keyword: 'memecoin', matchCount: 25 },
          { keyword: 'solana', matchCount: 18 },
          { keyword: 'bonk', matchCount: 12 }
        ],
        correlations: [
          {
            keyword: 'memecoin',
            correlation: 0.85,
            token: { name: 'Test Token', symbol: 'TEST', uri: 'test://uri' },
            socialMetrics: { mentions: 25, engagement: 0.75 },
            tradingMetrics: { priceChange: 15.5, volume: 50000 }
          }
        ],
        recommendations: [
          {
            type: 'high_correlation',
            message: 'Strong correlation detected for memecoin keyword',
            confidence: 0.85
          }
        ]
      };
      
      const analysisId = await patternAnalyzer.storeAnalysisResults('test', 'test_platform', sampleAnalysisData);
      if (analysisId) {
        console.log('   ✅ Pattern analysis data stored successfully');
      } else {
        console.log('   ❌ Pattern analysis data storage failed');
      }
    } catch (error) {
      console.log('   ❌ Pattern analysis storage test failed:', error.message);
    }
    
    // Test Twitter alert storage
    try {
      const sampleAlertData = {
        message: 'Test alert for pattern analysis',
        aiGenerated: true,
        test_mode: true
      };
      
      const alertResult = await twitterIntegration.storeAlert('test_alert', 'test://uri', sampleAlertData);
      if (alertResult) {
        console.log('   ✅ Twitter alert data stored successfully');
      } else {
        console.log('   ❌ Twitter alert data storage failed');
      }
    } catch (error) {
      console.log('   ❌ Twitter alert storage test failed:', error.message);
    }
    
    // Test 4: Data Retrieval
    console.log('\n🔍 Testing Data Retrieval...');
    
    try {
      // Check pattern analysis results
      const { data: analysisResults, error: analysisError } = await patternAnalyzer.supabase
        .from('pattern_analysis_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (analysisError) {
        console.log('   ❌ Could not retrieve analysis results:', analysisError.message);
      } else {
        console.log(`   ✅ Retrieved ${analysisResults.length} analysis results`);
      }
      
      // Check Twitter alerts
      const { data: twitterAlerts, error: twitterError } = await twitterIntegration.supabase
        .from('twitter_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (twitterError) {
        console.log('   ❌ Could not retrieve Twitter alerts:', twitterError.message);
      } else {
        console.log(`   ✅ Retrieved ${twitterAlerts.length} Twitter alerts`);
      }
      
    } catch (error) {
      console.log('   ❌ Data retrieval test failed:', error.message);
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📊 Next steps:');
    console.log('1. Run pattern analysis: npm run analyze');
    console.log('2. Start Twitter monitoring: npm run twitter-start');
    console.log('3. Check your Supabase dashboard for stored data');
    console.log('4. View the data in your frontend dashboard');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run test
testPatternAnalysisAndTwitter().then(success => {
  if (success) {
    console.log('\n✅ Pattern analysis and Twitter integration are ready to use!');
  } else {
    console.log('\n❌ Please fix the issues before running the analysis');
    process.exit(1);
  }
});
