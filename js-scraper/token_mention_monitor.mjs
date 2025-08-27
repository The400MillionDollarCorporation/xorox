import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
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

// Configuration
const MONITORING_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 30 * 1000; // 30 seconds

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

// Function to check if TikTok already exists
async function checkTikTokExists(tiktokId) {
  try {
    const { data, error } = await supabase
      .from('tiktoks')
      .select('id, last_mention_check')
      .eq('id', tiktokId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking TikTok existence:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in checkTikTokExists:', error);
    return null;
  }
}

// Function to store new TikTok data
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
      last_mention_check: new Date().toISOString(),
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

    console.log(`Stored/Updated TikTok: ${tiktokId}`);
    return tiktokResult[0];
  } catch (error) {
    console.error('Error processing TikTok data:', error);
    return null;
  }
}

// Function to update TikTok mention check timestamp
async function updateTikTokMentionCheck(tiktokId) {
  try {
    const { error } = await supabase
      .from('tiktoks')
      .update({ last_mention_check: new Date().toISOString() })
      .eq('id', tiktokId);

    if (error) {
      console.error('Error updating mention check timestamp:', error);
    }
  } catch (error) {
    console.error('Error in updateTikTokMentionCheck:', error);
  }
}

// Function to store token mentions
async function storeTokenMentions(tiktokId, comments) {
  if (!comments || !comments.tickers) return 0;

  try {
    // Get all tokens from database
    const { data: tokens, error: tokensError } = await supabase
      .from('tokens')
      .select('id, symbol')
      .order('id', { ascending: true });

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      return 0;
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
    let newMentionsCount = 0;

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
        newMentionsCount++;
      }
    }

    if (mentionsData.length > 0) {
      // Check for existing mentions to avoid duplicates
      const { data: existingMentions, error: checkError } = await supabase
        .from('mentions')
        .select('id')
        .eq('tiktok_id', tiktokId);

      if (checkError) {
        console.error('Error checking existing mentions:', checkError);
        return 0;
      }

      if (existingMentions.length === 0) {
        // Insert new mentions
        const { error: mentionsError } = await supabase
          .from('mentions')
          .insert(mentionsData);

        if (mentionsError) {
          console.error('Error inserting mentions:', mentionsError);
          return 0;
        } else {
          console.log(`Stored ${mentionsData.length} new mentions for TikTok ${tiktokId}`);
          return newMentionsCount;
        }
      } else {
        console.log(`Mentions already exist for TikTok ${tiktokId}`);
        return 0;
      }
    }

    return newMentionsCount;
  } catch (error) {
    console.error('Error storing token mentions:', error);
    return 0;
  }
}

// Function to get TikToks that need mention checking
async function getTikToksForMentionCheck() {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('tiktoks')
      .select('id, url, last_mention_check')
      .or(`last_mention_check.is.null,last_mention_check.lt.${fiveMinutesAgo}`)
      .order('last_mention_check', { ascending: true, nullsFirst: true })
      .limit(10); // Process 10 at a time

    if (error) {
      console.error('Error fetching TikToks for mention check:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTikToksForMentionCheck:', error);
    return [];
  }
}

// Function to fetch TikTok comments and mentions
async function fetchTikTokMentions(tiktokUrl) {
  try {
    // This would integrate with your TikTok scraping logic
    // For now, we'll simulate the process
    console.log(`Fetching mentions for: ${tiktokUrl}`);
    
    // TODO: Implement actual TikTok comment scraping
    // This should call your existing scraping logic
    
    return {
      count: 0,
      tickers: {}
    };
  } catch (error) {
    console.error('Error fetching TikTok mentions:', error);
    return null;
  }
}

// Main monitoring function
async function monitorTokenMentions() {
  try {
    console.log(`\n[${new Date().toISOString()}] Starting token mention monitoring...`);
    
    const tikToksToCheck = await getTikToksForMentionCheck();
    console.log(`Found ${tikToksToCheck.length} TikToks to check for mentions`);
    
    let totalNewMentions = 0;
    
    for (const tiktok of tikToksToCheck) {
      try {
        console.log(`Checking mentions for TikTok: ${tiktok.id}`);
        
        // Fetch mentions from TikTok
        const mentions = await fetchTikTokMentions(tiktok.url);
        
        if (mentions && mentions.tickers) {
          // Store new mentions
          const newMentions = await storeTokenMentions(tiktok.id, mentions);
          totalNewMentions += newMentions;
        }
        
        // Update mention check timestamp
        await updateTikTokMentionCheck(tiktok.id);
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing TikTok ${tiktok.id}:`, error);
      }
    }
    
    console.log(`Monitoring complete. New mentions found: ${totalNewMentions}`);
    return totalNewMentions;
    
  } catch (error) {
    console.error('Error in monitorTokenMentions:', error);
    return 0;
  }
}

// Function to start continuous monitoring
async function startMonitoring() {
  console.log('🚀 Starting Token Mention Monitor...');
  console.log(`Monitoring interval: ${MONITORING_INTERVAL / 1000} seconds`);
  
  let isRunning = true;
  let consecutiveErrors = 0;
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down monitor...');
    isRunning = false;
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down monitor...');
    isRunning = false;
    process.exit(0);
  });
  
  while (isRunning) {
    try {
      const newMentions = await monitorTokenMentions();
      consecutiveErrors = 0; // Reset error counter on success
      
      if (newMentions > 0) {
        console.log(`🎯 Found ${newMentions} new token mentions!`);
      }
      
    } catch (error) {
      consecutiveErrors++;
      console.error(`❌ Monitoring error (attempt ${consecutiveErrors}):`, error);
      
      if (consecutiveErrors >= MAX_RETRIES) {
        console.error(`🚨 Too many consecutive errors (${consecutiveErrors}). Stopping monitor.`);
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
    
    // Wait for next monitoring cycle
    await new Promise(resolve => setTimeout(resolve, MONITORING_INTERVAL));
  }
}

// Function to run a single monitoring cycle
async function runSingleCheck() {
  try {
    console.log('Running single mention check...');
    const newMentions = await monitorTokenMentions();
    console.log(`Single check complete. New mentions: ${newMentions}`);
    return newMentions;
  } catch (error) {
    console.error('Error in single check:', error);
    return 0;
  }
}

// Export functions for external use
export { 
  monitorTokenMentions, 
  startMonitoring, 
  runSingleCheck,
  storeTikTokData,
  storeTokenMentions
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.includes('--single')) {
    runSingleCheck().then(() => process.exit(0));
  } else if (args.includes('--continuous')) {
    startMonitoring();
  } else {
    console.log('Usage:');
    console.log('  node token_mention_monitor.mjs --single     # Run single check');
    console.log('  node token_mention_monitor.mjs --continuous # Start continuous monitoring');
    process.exit(1);
  }
}
