#!/usr/bin/env node

/**
 * Test Telegram Real-time API
 * 
 * This script tests the Telegram real-time API endpoint to ensure
 * it's working correctly and can stream data.
 */

import fetch from 'node-fetch';

async function testTelegramRealtimeAPI() {
  console.log('🧪 Testing Telegram Real-time API...\n');
  
  try {
    // Test 1: Regular API call (non-realtime)
    console.log('📋 Test 1: Testing regular API call...');
    const regularResponse = await fetch('http://localhost:3000/api/dashboard/telegram-recent?timeRange=24h');
    
    if (regularResponse.ok) {
      const data = await regularResponse.json();
      console.log('✅ Regular API call successful');
      console.log(`📊 Data: ${data.totalMessages} messages, ${data.activeChannels} channels, ${data.keywords.length} keywords`);
    } else {
      console.log('❌ Regular API call failed:', regularResponse.status, regularResponse.statusText);
    }
    
    // Test 2: Real-time API call (SSE)
    console.log('\n📋 Test 2: Testing real-time API call (SSE)...');
    const realtimeResponse = await fetch('http://localhost:3000/api/dashboard/telegram-recent?timeRange=24h&realtime=true');
    
    if (realtimeResponse.ok) {
      console.log('✅ Real-time API call successful');
      console.log('📡 Starting to listen for real-time updates...');
      
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
                      totalMessages: parsed.totalMessages,
                      activeChannels: parsed.activeChannels,
                      keywords: parsed.keywords?.length || 0
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
    
    console.log('\n🎉 Telegram real-time API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testTelegramRealtimeAPI().catch(console.error);
