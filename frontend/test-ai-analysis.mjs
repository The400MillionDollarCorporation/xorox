#!/usr/bin/env node

/**
 * Test AI Memecoin Analysis API
 * 
 * This script tests the AI analysis API endpoint to ensure
 * it's working correctly with OpenAI integration.
 */

import fetch from 'node-fetch';

async function testAIAnalysisAPI() {
  console.log('🧪 Testing AI Memecoin Analysis API...\n');
  
  try {
    // Test data
    const testData = {
      tiktok_data: [
        {
          url: "https://tiktok.com/@crypto_whale_2024/video/1234567890",
          username: "crypto_whale_2024",
          views: 125000,
          comments: ["🚀🚀🚀", "This is going to moon!", "Diamond hands!", "When lambo?"],
          hashtags: ["#memecoin", "#pump", "#moon", "#crypto"],
          description: "Just discovered this new memecoin that's about to explode! 🚀",
          timestamp: new Date().toISOString()
        },
        {
          url: "https://tiktok.com/@memecoin_hunter/video/1234567891",
          username: "memecoin_hunter",
          views: 89000,
          comments: ["LFG!", "To the moon!", "This is the one!"],
          hashtags: ["#memecoin", "#solana", "#pump"],
          description: "Another gem found! This one has serious potential 💎",
          timestamp: new Date().toISOString()
        }
      ],
      token_data: [
        {
          name: "Pepe Coin",
          symbol: "PEPE",
          uri: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          market_cap: 1500000,
          volume_24h: 250000,
          price_change_24h: 0.15,
          created_timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: "Doge Killer",
          symbol: "DOGEK",
          uri: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
          market_cap: 800000,
          volume_24h: 180000,
          price_change_24h: -0.05,
          created_timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      keyword_matches: [
        {
          keyword: "memecoin",
          tiktok_mentions: 15,
          token_names: ["PEPE", "DOGEK"]
        },
        {
          keyword: "pump",
          tiktok_mentions: 8,
          token_names: ["PEPE"]
        }
      ]
    };

    // Test 1: POST request for AI analysis
    console.log('📋 Test 1: Testing AI analysis (POST)...');
    const analysisResponse = await fetch('http://localhost:3000/api/ai/memecoin-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      console.log('✅ AI analysis successful');
      console.log(`📊 Analysis Summary:`);
      console.log(`   Recommendation: ${analysisData.analysis_summary?.overall_recommendation || 'N/A'}`);
      console.log(`   Confidence: ${analysisData.analysis_summary?.confidence_score ? Math.round(analysisData.analysis_summary.confidence_score * 100) + '%' : 'N/A'}`);
      console.log(`   Key Insights: ${analysisData.analysis_summary?.key_insights?.length || 0} insights`);
      
      if (analysisData.token_analysis && analysisData.token_analysis.length > 0) {
        console.log(`\n🪙 Token Analysis:`);
        analysisData.token_analysis.forEach((token, index) => {
          console.log(`   ${index + 1}. ${token.token_symbol}:`);
          console.log(`      Sentiment: ${token.sentiment_score}/10`);
          console.log(`      Viral Potential: ${token.viral_potential}/10`);
          console.log(`      Risk Level: ${token.risk_level}/10`);
          console.log(`      Recommendation: ${token.recommendation}`);
        });
      }
      
      if (analysisData.creator_analysis && analysisData.creator_analysis.length > 0) {
        console.log(`\n👥 Creator Analysis:`);
        analysisData.creator_analysis.forEach((creator, index) => {
          console.log(`   ${index + 1}. @${creator.username}:`);
          console.log(`      Credibility: ${creator.credibility_score}/10`);
          console.log(`      Success Rate: ${Math.round(creator.historical_success_rate * 100)}%`);
          console.log(`      Follower Quality: ${creator.follower_quality}`);
        });
      }
      
      if (analysisData.market_signals) {
        console.log(`\n📈 Market Signals:`);
        console.log(`   Momentum: ${analysisData.market_signals.momentum_indicator}`);
        console.log(`   Manipulation Risk: ${analysisData.market_signals.manipulation_risk}`);
        console.log(`   Viral Trajectory: ${analysisData.market_signals.viral_trajectory}`);
        console.log(`   Recommended Action: ${analysisData.market_signals.recommended_action}`);
      }
      
      if (analysisData.predictions) {
        console.log(`\n🔮 Predictions:`);
        console.log(`   24h Outlook: ${analysisData.predictions['24h_outlook']}`);
        console.log(`   Viral Probability: ${Math.round(analysisData.predictions.viral_probability * 100)}%`);
        console.log(`   Price Movement: ${analysisData.predictions.price_movement_prediction}`);
        console.log(`   Timeline to Peak: ${analysisData.predictions.timeline_to_peak}`);
      }
      
      if (analysisData.metadata) {
        console.log(`\n📊 Metadata:`);
        console.log(`   Model Used: ${analysisData.metadata.model_used}`);
        console.log(`   TikTok Videos: ${analysisData.metadata.data_sources?.tiktok_videos || 0}`);
        console.log(`   Tokens Analyzed: ${analysisData.metadata.data_sources?.tokens_analyzed || 0}`);
        console.log(`   Analysis Time: ${analysisData.metadata.analysis_timestamp}`);
      }
      
    } else {
      console.log('❌ AI analysis failed:', analysisResponse.status, analysisResponse.statusText);
      const errorText = await analysisResponse.text();
      console.log('Error details:', errorText);
    }
    
    // Test 2: GET request for recent analysis
    console.log('\n📋 Test 2: Testing recent analysis fetch (GET)...');
    const recentResponse = await fetch('http://localhost:3000/api/ai/memecoin-analysis');
    
    if (recentResponse.ok) {
      const recentData = await recentResponse.json();
      console.log('✅ Recent analysis fetch successful');
      console.log(`📊 Recent Analysis:`);
      console.log(`   Recommendation: ${recentData.analysis_summary?.overall_recommendation || 'N/A'}`);
      console.log(`   Confidence: ${recentData.analysis_summary?.confidence_score ? Math.round(recentData.analysis_summary.confidence_score * 100) + '%' : 'N/A'}`);
      console.log(`   Model: ${recentData.metadata?.model_used || 'N/A'}`);
    } else {
      console.log('❌ Recent analysis fetch failed:', recentResponse.status, recentResponse.statusText);
    }
    
    // Test 3: Error handling test
    console.log('\n📋 Test 3: Testing error handling...');
    const errorResponse = await fetch('http://localhost:3000/api/ai/memecoin-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Empty data to trigger error
    });
    
    if (!errorResponse.ok) {
      console.log('✅ Error handling working correctly');
      const errorData = await errorResponse.json();
      console.log(`   Error message: ${errorData.error || 'Unknown error'}`);
    } else {
      console.log('⚠️ Error handling test - API accepted invalid data');
    }
    
    console.log('\n🎉 AI Memecoin Analysis API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testAIAnalysisAPI().catch(console.error);
