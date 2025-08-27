import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { Headers } from 'node-fetch';

// Polyfill global fetch and Headers
global.fetch = fetch;
global.Headers = Headers;

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_SECRET;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_SECRET in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to sanitize strings
const sanitize = (str) => (str ? str.replace(/\u0000/g, "") : "");

// Helper function to format views
function formatViews(views) {
  if (!views) return 0;
  
  const unitMultiplier = {
    k: 1_000,
    m: 1_000_000,
    b: 1_000_000_000,
  };

  const unit = views.slice(-1).toLowerCase();
  if (unit in unitMultiplier) {
    return Math.floor(parseFloat(views.slice(0, -1)) * unitMultiplier[unit]);
  }
  return Math.floor(parseFloat(views)) || 0;
}

// Helper function to extract TikTok ID from URL
function getTiktokId(url) {
  if (!url) return null;
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

// Function to store TikTok data
async function storeTikTokData(tiktokData) {
  try {
    const tiktokId = getTiktokId(tiktokData.video_url);
    if (!tiktokId) {
      console.log('Skipping: Invalid TikTok URL');
      return null;
    }

    const tiktokRecord = {
      id: tiktokId,
      username: sanitize(tiktokData.author || ''),
      url: sanitize(tiktokData.video_url),
      thumbnail: sanitize(tiktokData.thumbnail_url || ''),
      created_at: tiktokData.posted_timestamp ? new Date(tiktokData.posted_timestamp * 1000).toISOString() : new Date().toISOString(),
      fetched_at: new Date().toISOString(),
      views: formatViews(tiktokData.views?.toString() || "0"),
      comments: tiktokData.comments?.count || 0,
    };

    // Insert or update TikTok record
    const { data: tiktokResult, error: tiktokError } = await supabase
      .from('tiktoks')
      .upsert(tiktokRecord, { onConflict: 'id' })
      .select();

    if (tiktokError) {
      console.error('Error storing TikTok:', tiktokError);
      return null;
    }

    console.log(`Stored TikTok: ${tiktokId}`);
    return tiktokResult[0];
  } catch (error) {
    console.error('Error processing TikTok data:', error);
    return null;
  }
}

// Function to store token mentions
async function storeTokenMentions(tiktokId, comments) {
  if (!comments || !comments.tickers) return;

  try {
    // Get all tokens from database
    const { data: tokens, error: tokensError } = await supabase
      .from('tokens')
      .select('id, symbol')
      .order('id', { ascending: true });

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      return;
    }

    // Create a map of symbol to token IDs
    const symbolToTokens = new Map();
    tokens.forEach((token) => {
      if (!symbolToTokens.has(token.symbol)) {
        symbolToTokens.set(token.symbol, []);
      }
      symbolToTokens.get(token.symbol).push(token.id);
    });

    const mentionAt = new Date().toISOString();
    const mentionsData = [];

    // Process each mentioned token
    for (const [symbol, count] of Object.entries(comments.tickers)) {
      const tokenIds = symbolToTokens.get(symbol);
      if (!tokenIds) {
        console.log(`Token not found for symbol: ${symbol}`);
        continue;
      }

      // Add mention entry for each token ID associated with the symbol
      for (const tokenId of tokenIds) {
        mentionsData.push({
          tiktok_id: tiktokId,
          count: count,
          token_id: tokenId,
          mention_at: mentionAt,
        });
      }
    }

    if (mentionsData.length > 0) {
      const { error: mentionsError } = await supabase
        .from('mentions')
        .insert(mentionsData);

      if (mentionsError) {
        console.error('Error inserting mentions:', mentionsError);
      } else {
        console.log(`Stored ${mentionsData.length} mentions for TikTok ${tiktokId}`);
      }
    }
  } catch (error) {
    console.error('Error storing token mentions:', error);
  }
}

// Main function to process scraped data
async function processScrapedData(filePath) {
  try {
    console.log(`Processing file: ${filePath}`);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    console.log(`Found ${data.results.length} search results`);
    
    let totalTikToks = 0;
    let totalMentions = 0;
    
    for (const result of data.results) {
      console.log(`Processing search: ${result.search}`);
      console.log(`Found ${result.videos.length} videos`);
      
      for (const video of result.videos) {
        try {
          // Store TikTok data
          const storedTikTok = await storeTikTokData(video);
          if (storedTikTok) {
            totalTikToks++;
            
            // Store token mentions if available
            if (video.comments && video.comments.tickers) {
              await storeTokenMentions(storedTikTok.id, video.comments);
              totalMentions++;
            }
          }
        } catch (error) {
          console.error('Error processing video:', error);
        }
      }
    }
    
    console.log(`\nProcessing complete!`);
    console.log(`Total TikToks stored: ${totalTikToks}`);
    console.log(`Total mentions processed: ${totalMentions}`);
    
  } catch (error) {
    console.error('Error processing scraped data:', error);
  }
}

// Function to process all scraped data files
async function processAllScrapedData() {
  try {
    const files = await fs.readdir('.');
    const jsonFiles = files.filter(file => 
      file.startsWith('combined_results_') && file.endsWith('.json')
    );
    
    console.log(`Found ${jsonFiles.length} scraped data files`);
    
    for (const file of jsonFiles) {
      console.log(`\n=== Processing ${file} ===`);
      await processScrapedData(file);
    }
    
    console.log('\nAll files processed successfully!');
    
  } catch (error) {
    console.error('Error processing all files:', error);
  }
}

// Main execution
async function main() {
  try {
    console.log('Starting to store scraped data in Supabase...');
    await processAllScrapedData();
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { processScrapedData, processAllScrapedData };
