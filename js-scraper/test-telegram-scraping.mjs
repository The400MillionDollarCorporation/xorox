#!/usr/bin/env node

/**
 * Test Telegram Message Scraping
 * 
 * This script tests the Telegram message scraping functionality
 * using a known public channel to verify the scraper works correctly.
 */

import { OutlightScraper } from './outlight-scraper.mjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testTelegramScraping() {
  console.log('🧪 Testing Telegram Message Scraping...\n');
  
  try {
    const scraper = new OutlightScraper();
    
    // Test with a known public Telegram channel
    const testChannels = [
      'durov', // Telegram founder's channel (usually has messages)
      'telegram', // Official Telegram channel
      'memecoin_hunters', // Common memecoin channel
      'solana_memes' // Solana memes channel
    ];
    
    for (const channelUsername of testChannels) {
      console.log(`\n🔍 Testing channel: @${channelUsername}`);
      
      try {
        const messages = await scraper.scrapeTelegramChannel(channelUsername, 5);
        console.log(`✅ Scraped ${messages.length} messages from @${channelUsername}`);
        
        if (messages.length > 0) {
          console.log('📨 Sample messages:');
          messages.slice(0, 2).forEach((message, index) => {
            const preview = message.text ? message.text.substring(0, 80) + '...' : '[Media]';
            const date = new Date(message.date * 1000).toLocaleDateString();
            console.log(`  ${index + 1}. [${date}] ${preview}`);
          });
          
          // Test storing messages
          console.log('💾 Testing message storage...');
          await scraper.storeMessages(messages);
          console.log('✅ Messages stored successfully');
          
          // Break after first successful channel
          break;
        } else {
          console.log(`⚠️ No messages found for @${channelUsername}`);
        }
      } catch (error) {
        console.log(`❌ Error scraping @${channelUsername}: ${error.message}`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🎉 Telegram scraping test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testTelegramScraping().catch(console.error);
