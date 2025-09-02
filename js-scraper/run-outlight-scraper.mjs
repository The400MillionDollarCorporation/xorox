#!/usr/bin/env node

/**
 * Outlight.fun Telegram Scraper Runner
 * 
 * This script runs the complete Outlight.fun Telegram scraping pipeline:
 * 1. Discovers Telegram channels from Outlight.fun homepage
 * 2. Stores channels in the database
 * 3. Scrapes messages from discovered channels
 * 4. Stores messages and extracts token mentions
 * 
 * Usage:
 *   node run-outlight-scraper.mjs
 *   npm run scrape-outlight
 */

import { OutlightScraper } from './outlight-scraper.mjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🚀 Starting Outlight.fun Telegram Scraper...\n');
  
  try {
    // Validate environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.error('❌ Missing required environment variables:');
      console.error('   SUPABASE_URL and SUPABASE_KEY must be set in .env file');
      process.exit(1);
    }
    
    console.log('✅ Environment variables validated');
    console.log('✅ Supabase connection configured');
    
    // Create scraper instance
    const scraper = new OutlightScraper();
    
    // Run the complete scraping pipeline
    await scraper.main();
    
    console.log('\n🎉 Outlight.fun Telegram scraping completed successfully!');
    console.log('📊 Check your Supabase database for the scraped data.');
    console.log('🌐 View the data in your frontend dashboard.');
    
  } catch (error) {
    console.error('\n❌ Scraper failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n⚠️ Scraper interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️ Scraper terminated');
  process.exit(0);
});

// Run the main function
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
