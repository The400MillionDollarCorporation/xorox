#!/usr/bin/env node

/**
 * Test TikTok Hashtags API
 * 
 * This script tests the TikTok hashtags API endpoint to ensure
 * it's working correctly and can extract trending hashtags.
 */

import fetch from 'node-fetch';

async function testTikTokHashtagsAPI() {
  console.log('🧪 Testing TikTok Hashtags API...\n');
  
  try {
    // Test 1: Regular API call (non-realtime)
    console.log('📋 Test 1: Testing regular API call...');
    const regularResponse = await fetch('http://localhost:3000/api/dashboard/tiktok-hashtags?timeRange=24h');
    
    if (regularResponse.ok) {
      const data = await regularResponse.json();
      console.log('✅ Regular API call successful');
      console.log(`📊 Data: ${data.totalHashtags} hashtags, ${data.totalVideos} videos, ${data.totalViews} total views`);
      
      if (data.hashtags && data.hashtags.length > 0) {
        console.log('\n🏷️ Top 10 Trending Hashtags:');
        data.hashtags.slice(0, 10).forEach((hashtag, index) => {
          console.log(`  ${index + 1}. ${hashtag.hashtag} - ${hashtag.count} videos, ${hashtag.totalViews.toLocaleString()} views`);
        });
      } else {
        console.log('⚠️ No hashtags found in the data');
      }
    } else {
      console.log('❌ Regular API call failed:', regularResponse.status, regularResponse.statusText);
    }
    
    // Test 2: Real-time API call (SSE)
    console.log('\n📋 Test 2: Testing real-time API call (SSE)...');
    const realtimeResponse = await fetch('http://localhost:3000/api/dashboard/tiktok-hashtags?timeRange=24h&realtime=true');
    
    if (realtimeResponse.ok) {
      console.log('✅ Real-time API call successful');
      console.log('📡 Starting to listen for real-time hashtag updates...');
      
      const reader = realtimeResponse.body.getReader();
      const decoder = new TextDecoder();
      let messageCount = 0;
      
      // Listen for messages for 10 seconds
      const timeout = setTimeout(() => {
        console.log('⏰ Test timeout reached, stopping...');
        reader.cancel();
      }, 10000);
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('📡 Stream ended');
            break;
          }
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data.trim()) {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === 'keepalive') {
                    console.log('💓 Keepalive received');
                  } else {
                    messageCount++;
                    console.log(`📨 Message ${messageCount}:`, {
                      totalHashtags: parsed.totalHashtags,
                      totalVideos: parsed.totalVideos,
                      topHashtags: parsed.hashtags?.slice(0, 3).map(h => `${h.hashtag} (${h.count})`) || []
                    });
                  }
                } catch (error) {
                  console.log('⚠️ Failed to parse message:', data);
                }
              }
            }
          }
        }
      } catch (error) {
        console.log('❌ Error reading stream:', error.message);
      } finally {
        clearTimeout(timeout);
        reader.releaseLock();
      }
      
      console.log(`📊 Total messages received: ${messageCount}`);
    } else {
      console.log('❌ Real-time API call failed:', realtimeResponse.status, realtimeResponse.statusText);
    }
    
    console.log('\n🎉 TikTok hashtags API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testTikTokHashtagsAPI().catch(console.error);
