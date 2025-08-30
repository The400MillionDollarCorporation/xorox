import { TelegramChannelScraper } from './telegram_scraper.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function testTelegramScraper() {
  try {
    console.log('🧪 Testing Telegram Scraper...\n');
    
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
    
    // Create scraper instance
    const scraper = new TelegramChannelScraper();
    
    // Test database initialization
    console.log('\n🔍 Testing database initialization...');
    await scraper.initializeDatabase();
    
    // Test channel loading
    console.log('\n🔍 Testing channel loading...');
    const channels = await scraper.loadChannels();
    console.log(`📋 Found ${channels.length} channels in database`);
    
    // Test adding a test channel
    console.log('\n🔍 Testing channel addition...');
    const testChannel = await scraper.addChannel({
      username: 'test_channel_' + Date.now(),
      display_name: 'Test Channel for Testing',
      enabled: true,
      scrape_media: false,
      scrape_interval_minutes: 15
    });
    
    if (testChannel) {
      console.log('✅ Test channel added successfully');
    }
    
    // Test message storage with sample data
    console.log('\n🔍 Testing message storage...');
    const sampleMessages = [
      {
        channel_id: 'test_channel',
        channel_title: 'Test Channel',
        message_id: Date.now(),
        text: 'This is a test message about #memecoin and $SOL tokens',
        date: Math.floor(Date.now() / 1000),
        author_signature: 'Test User',
        has_photo: false,
        has_video: false,
        views: 100,
        reactions_count: 5,
        scraped_at: new Date().toISOString()
      }
    ];
    
    await scraper.storeMessages(sampleMessages);
    console.log('✅ Sample messages stored successfully');
    
    // Test token mention extraction
    console.log('\n🔍 Testing token mention extraction...');
    await scraper.extractAndStoreTokenMentions(sampleMessages);
    console.log('✅ Token mention extraction completed');
    
    console.log('\n🎉 All Telegram scraper tests passed!');
    console.log('\n📊 Next steps:');
    console.log('1. Run: npm run scrape-telegram');
    console.log('2. Check your Supabase dashboard for stored data');
    console.log('3. View the data in your frontend dashboard');
    
    return true;
    
  } catch (error) {
    console.error('❌ Telegram scraper test failed:', error);
    return false;
  }
}

// Run test
testTelegramScraper().then(success => {
  if (success) {
    console.log('\n✅ Telegram scraper is ready to use!');
  } else {
    console.log('\n❌ Please fix the issues before running the scraper');
    process.exit(1);
  }
});
