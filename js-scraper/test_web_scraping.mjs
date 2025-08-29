import { TelegramChannelScraper } from './telegram_scraper.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function testWebScraping() {
  try {
    console.log('🧪 Testing Telegram Dual Method Scraping...');
    
    const scraper = new TelegramChannelScraper();
    
    // Test with a public channel
    const testChannel = 'telegram'; // Official Telegram channel
    
    console.log(`\n🔍 Testing dual method scraping for @${testChannel}...`);
    
    // Test individual methods
    console.log(`\n🌐 Testing METHOD 1: Web Scraping...`);
    const webMessages = await scraper.scrapePublicChannelWeb(testChannel, 10);
    console.log(`✅ Web scraping: ${webMessages.length} messages`);
    
    console.log(`\n📡 Testing METHOD 2: RSS Scraping...`);
    const rssMessages = await scraper.scrapeChannelRSS(testChannel);
    console.log(`✅ RSS scraping: ${rssMessages.length} messages`);
    
    // Test combined approach
    console.log(`\n🚀 Testing COMBINED approach...`);
    const combinedMessages = await scraper.scrapeChannel(testChannel, 20);
    console.log(`✅ Combined result: ${combinedMessages.length} messages`);
    
    // Show sample messages
    if (combinedMessages.length > 0) {
      console.log(`\n📝 Sample messages:`);
      combinedMessages.slice(0, 3).forEach((msg, index) => {
        console.log(`\n   Message ${index + 1}:`);
        console.log(`     ID: ${msg.message_id}`);
        console.log(`     Text: ${msg.text?.substring(0, 80)}${msg.text?.length > 80 ? '...' : ''}`);
        console.log(`     Date: ${new Date(msg.date * 1000).toISOString()}`);
        console.log(`     Views: ${msg.views || 'N/A'}`);
        console.log(`     Source: ${msg.raw_data?.source || 'Web'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testWebScraping();
