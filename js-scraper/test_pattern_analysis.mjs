import { MemecoinPatternAnalyzer } from './pattern_analysis.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function testPatternAnalysis() {
  try {
    console.log('🧪 Testing Memecoin Pattern Analysis...');
    
    const analyzer = new MemecoinPatternAnalyzer();
    
    // Test individual platform analysis
    console.log('\n📱 Testing TikTok Analysis...');
    const tiktokReport = await analyzer.analyzeTikTokTokenCorrelation();
    console.log('✅ TikTok analysis completed');
    console.log(`   Videos analyzed: ${tiktokReport.summary.totalVideos}`);
    console.log(`   Tokens found: ${tiktokReport.summary.totalTokens}`);
    console.log(`   Keyword matches: ${tiktokReport.summary.keywordMatches}`);
    console.log(`   Average correlation: ${tiktokReport.summary.averageCorrelation.toFixed(3)}`);
    
    console.log('\n📡 Testing Telegram Analysis...');
    const telegramReport = await analyzer.analyzeTelegramTokenCorrelation();
    console.log('✅ Telegram analysis completed');
    console.log(`   Messages analyzed: ${telegramReport.summary.totalMessages}`);
    console.log(`   Tokens found: ${telegramReport.summary.totalTokens}`);
    console.log(`   Keyword matches: ${telegramReport.summary.keywordMatches}`);
    console.log(`   Average correlation: ${telegramReport.summary.averageCorrelation.toFixed(3)}`);
    
    // Test comprehensive analysis
    console.log('\n🚀 Testing Comprehensive Analysis...');
    const comprehensiveReport = await analyzer.runComprehensiveAnalysis();
    console.log('✅ Comprehensive analysis completed');
    
    // Display top recommendations
    if (comprehensiveReport.topRecommendations.length > 0) {
      console.log('\n🏆 TOP TRADING RECOMMENDATIONS:');
      comprehensiveReport.topRecommendations.slice(0, 5).forEach((rec, index) => {
        console.log(`\n   ${index + 1}. ${rec.token} (${rec.keyword})`);
        console.log(`      Correlation: ${rec.correlation.toFixed(3)}`);
        console.log(`      Risk Level: ${rec.risk}`);
        console.log(`      Recommendation: ${rec.recommendation}`);
      });
    } else {
      console.log('\n⚠️ No strong correlations found in current data');
    }
    
    console.log('\n🎉 Pattern analysis test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test
testPatternAnalysis();
