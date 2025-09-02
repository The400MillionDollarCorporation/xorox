#!/usr/bin/env node

/**
 * Test Telegram Channels API
 * 
 * This script tests the Telegram channels API endpoint to ensure
 * it's working correctly and can fetch channel data.
 */

import fetch from 'node-fetch';

async function testTelegramChannelsAPI() {
  console.log('🧪 Testing Telegram Channels API...\n');
  
  try {
    // Test 1: Regular API call (non-realtime)
    console.log('📋 Test 1: Testing regular API call...');
    const regularResponse = await fetch('http://localhost:3000/api/dashboard/telegram-channels');
    
    if (regularResponse.ok) {
      const data = await regularResponse.json();
      console.log('✅ Regular API call successful');
      console.log(`📊 Data: ${data.summary.totalChannels} channels, ${data.summary.enabledChannels} enabled, ${data.summary.totalMessages} total messages`);
      
      if (data.channels && data.channels.length > 0) {
        console.log('\n📺 Telegram Channels:');
        data.channels.slice(0, 5).forEach((channel, index) => {
          console.log(`  ${index + 1}. @${channel.username} (${channel.display_name || 'No name'})`);
          console.log(`     Status: ${channel.enabled ? '✅ Enabled' : '❌ Disabled'}`);
          console.log(`     Messages: ${channel.stats.totalMessages.toLocaleString()}`);
          console.log(`     Last message: ${channel.stats.lastMessageAt ? new Date(channel.stats.lastMessageAt).toLocaleString() : 'Never'}`);
          console.log(`     Interval: ${channel.scrape_interval_minutes} minutes`);
          console.log('');
        });
      } else {
        console.log('⚠️ No channels found in the data');
      }
    } else {
      console.log('❌ Regular API call failed:', regularResponse.status, regularResponse.statusText);
    }
    
    // Test 2: Filter by enabled channels
    console.log('\n📋 Test 2: Testing enabled channels filter...');
    const enabledResponse = await fetch('http://localhost:3000/api/dashboard/telegram-channels?enabled=true');
    
    if (enabledResponse.ok) {
      const data = await enabledResponse.json();
      console.log('✅ Enabled channels filter successful');
      console.log(`📊 Enabled channels: ${data.summary.enabledChannels}`);
    } else {
      console.log('❌ Enabled channels filter failed:', enabledResponse.status, enabledResponse.statusText);
    }
    
    // Test 3: Real-time API call (SSE)
    console.log('\n📋 Test 3: Testing real-time API call (SSE)...');
    const realtimeResponse = await fetch('http://localhost:3000/api/dashboard/telegram-channels?realtime=true');
    
    if (realtimeResponse.ok) {
      console.log('✅ Real-time API call successful');
      console.log('📡 Starting to listen for real-time channel updates...');
      
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
                      totalChannels: parsed.summary?.totalChannels,
                      enabledChannels: parsed.summary?.enabledChannels,
                      totalMessages: parsed.summary?.totalMessages
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
    
    // Test 4: PATCH endpoint (update channel)
    console.log('\n📋 Test 4: Testing channel update (PATCH)...');
    
    // First get a channel to update
    const getResponse = await fetch('http://localhost:3000/api/dashboard/telegram-channels');
    if (getResponse.ok) {
      const data = await getResponse.json();
      if (data.channels && data.channels.length > 0) {
        const testChannel = data.channels[0];
        console.log(`🔄 Testing update for channel: @${testChannel.username}`);
        
        const updateResponse = await fetch('http://localhost:3000/api/dashboard/telegram-channels', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: testChannel.id,
            scrape_interval_minutes: 30 // Update interval to 30 minutes
          }),
        });
        
        if (updateResponse.ok) {
          const updatedChannel = await updateResponse.json();
          console.log('✅ Channel update successful');
          console.log(`📊 Updated interval: ${updatedChannel.scrape_interval_minutes} minutes`);
        } else {
          console.log('❌ Channel update failed:', updateResponse.status, updateResponse.statusText);
        }
      } else {
        console.log('⚠️ No channels available for update test');
      }
    }
    
    console.log('\n🎉 Telegram channels API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testTelegramChannelsAPI().catch(console.error);
