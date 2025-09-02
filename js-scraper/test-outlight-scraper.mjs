import { OutlightScraper } from './outlight-scraper.mjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testOutlightScraper() {
  console.log('🧪 Testing Outlight.fun Telegram Scraper...\n');
  
  try {
    const scraper = new OutlightScraper();
    
    // Test 1: Scrape Outlight.fun homepage
    console.log('📋 Test 1: Scraping Outlight.fun homepage...');
    const channels = await scraper.scrapeOutlightHomepage();
    console.log(`✅ Found ${channels.length} channels from homepage`);
    
    if (channels.length > 0) {
      console.log('📋 Sample channels found:');
      channels.slice(0, 5).forEach((channel, index) => {
        console.log(`  ${index + 1}. @${channel.username} - ${channel.display_name}`);
      });
    }
    
    // Test 2: Scrape with Cheerio
    console.log('\n📋 Test 2: Scraping with Cheerio...');
    const cheerioChannels = await scraper.scrapeOutlightWithCheerio();
    console.log(`✅ Found ${cheerioChannels.length} channels with Cheerio`);
    
    if (cheerioChannels.length > 0) {
      console.log('📋 Sample Cheerio channels found:');
      cheerioChannels.slice(0, 5).forEach((channel, index) => {
        console.log(`  ${index + 1}. @${channel.username} - ${channel.display_name}`);
      });
    }
    
    // Test 3: Test channel storage (if channels found or use fallback)
    let allChannels = [...channels, ...cheerioChannels];
    
    // If no channels found, use fallback channels for testing
    if (allChannels.length === 0) {
      console.log('\n📋 Test 3a: No channels found, testing fallback channels...');
      const fallbackChannels = await scraper.getFallbackChannels();
      allChannels = [...allChannels, ...fallbackChannels];
    }
    
    if (allChannels.length > 0) {
      console.log('\n💾 Test 3: Testing channel storage...');
      const uniqueChannels = allChannels.filter((channel, index, self) => 
        index === self.findIndex(c => c.username === channel.username)
      );
      
      console.log(`📊 Total unique channels: ${uniqueChannels.length}`);
      
      // Test storing first channel
      if (uniqueChannels.length > 0) {
        const testChannel = uniqueChannels[0];
        console.log(`💾 Testing storage for: @${testChannel.username}`);
        const storedChannel = await scraper.storeChannel(testChannel);
        
        if (storedChannel) {
          console.log(`✅ Successfully stored channel: @${storedChannel.username}`);
        } else {
          console.log(`⚠️ Channel already exists or storage failed`);
        }
      }
    }
    
    // Test 4: Test message scraping (if we have a channel)
    if (allChannels.length > 0) {
      console.log('\n📨 Test 4: Testing message scraping...');
      const testChannel = allChannels[0];
      console.log(`🔍 Testing message scraping for: @${testChannel.username}`);
      
      const messages = await scraper.scrapeTelegramChannel(testChannel.username, 10);
      console.log(`✅ Scraped ${messages.length} messages from @${testChannel.username}`);
      
      if (messages.length > 0) {
        console.log('📨 Sample messages:');
        messages.slice(0, 3).forEach((message, index) => {
          const preview = message.text ? message.text.substring(0, 100) + '...' : '[Media]';
          console.log(`  ${index + 1}. ${preview}`);
        });
        
        // Test message storage
        console.log('\n💾 Testing message storage...');
        await scraper.storeMessages(messages);
        console.log('✅ Messages stored successfully');
      }
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testOutlightScraper().catch(console.error);
