// Place these at the very top of the file, before any other imports
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-extra'; // 👈 CHANGED
import StealthPlugin from 'puppeteer-extra-plugin-stealth'; // 👈 ADDED
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { Headers } from 'node-fetch';
import fs from 'fs';
import { extractComments, VideoScraper } from "./scraper.mjs";

// 👇 ADD STEALTH PLUGIN
puppeteer.use(StealthPlugin());

// Polyfill global fetch and Headers
global.fetch = fetch;
global.Headers = Headers;

dotenv.config();

// Initialize Supabase client for immediate storage
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configure logging
const logger = {
  info: (...args) => console.log(new Date().toISOString(), "INFO:", ...args),
  error: (...args) =>
    console.error(new Date().toISOString(), "ERROR:", ...args),
};

const processedUrls = new Set();

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

// Function to store TikTok data immediately
async function storeTikTokDataImmediately(tiktokData) {
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

    // Insert or update TikTok record immediately
    const { data: tiktokResult, error: tiktokError } = await supabase
      .from('tiktoks')
      .upsert(tiktokRecord, { onConflict: 'id' })
      .select();

    if (tiktokError) {
      console.error('Error storing TikTok:', tiktokError);
      return null;
    }

    console.log(`✅ Stored TikTok: ${tiktokId} (${tiktokRecord.username})`);
    return tiktokResult[0];
  } catch (error) {
    console.error('Error processing TikTok data:', error);
    return null;
  }
}

// Function to store token mentions immediately
async function storeTokenMentionsImmediately(tiktokId, comments) {
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
        console.log(`🔗 Stored ${mentionsData.length} mentions for TikTok ${tiktokId}`);
      }
    }
  } catch (error) {
    console.error('Error storing token mentions:', error);
  }
}

// 👇 Helper: Random delay to simulate human behavior
const randomDelay = (minMs, maxMs) => {
  return new Promise(resolve => setTimeout(resolve, Math.random() * (maxMs - minMs) + minMs));
};

async function initBrowser() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-blink-features=AutomationControlled',
      ]
    });
    return browser;
  } catch (error) {
    console.error('Failed to launch browser:', error);
    throw error;
  }
}

const verifyPageLoaded = async (page, url, timeout = 60000) => {
  try {
    logger.info(`Loading ${url}...`);
    
    await page.goto(url, { 
      waitUntil: "networkidle0", 
      timeout 
    });

    // 👇 Check for human verification or bot detection
    const isBlocked = await page.$('text=Verify to continue') || 
                      await page.$('text=Please verify you are a human');

    if (isBlocked) {
      logger.error('🚨 TikTok is blocking access — likely detected as bot. Try residential proxy.');
      return false;
    }

    await page.waitForSelector("body", { timeout: 10000 });
    await randomDelay(3000, 7000); // 👈 Human-like pause
    logger.info(`Successfully loaded ${url}`);
    return true;
  } catch (e) {
    logger.error(`Error loading page: ${e.message}`);
    return false;
  }
};

const extractVideoData = async (element) => {
  try {
    const videoData = await VideoScraper.extractVideoData(element);
    console.log(videoData);
    return videoData;
  } catch (e) {
    return null;
  }
};

const processSearchTerm = async (page, keyword, maxResults = 50) => {
  const searchUrl = `https://www.tiktok.com/search?q=${keyword}`;
  const results = [];
  const scrollPauseTime = 2000;

  try {
    console.log(`\nProcessing search term: ${keyword}`);
    console.log(`Navigating to: ${searchUrl}`);

    if (await verifyPageLoaded(page, searchUrl)) {
      console.log("\nWaiting for video feed...");

      while (results.length < maxResults) {
        const videoElements = await page.$$('div[class*="DivItemContainerForSearch"]');

        if (!videoElements.length) {
          console.log("No video elements found. Waiting...");
          await randomDelay(4000, 8000); // 👈 Randomized wait
          continue;
        }

        console.log("Count of Video elements")
        console.log(videoElements.length);

        for (const element of videoElements) {
          if (results.length >= maxResults) break;

          const videoData = await extractVideoData(element);
          if (
            videoData &&
            videoData?.video_url &&
            !processedUrls.has(videoData.video_url)
          ) {
            console.log(
              `Found video ${results.length}/${maxResults}: ${videoData.video_url}`
            );

            const postId = videoData.video_url.split("/").pop();
            videoData.comments = await extractComments(postId);
            console.log(`Found ${videoData.comments.count} comments`);

            processedUrls.add(videoData.video_url);
            results.push(videoData);
          }
        }

        if (results.length >= maxResults) {
          console.log(`\nReached target number of videos for '${keyword}'`);
          break;
        }

        const previousHeight = await page.evaluate(
          "document.documentElement.scrollHeight"
        );
        
        await page.evaluate(
          "window.scrollTo(0, document.documentElement.scrollHeight)"
        );
        
        await randomDelay(2000, 5000); // 👈 Human-like scroll delay

        const newHeight = await page.evaluate(
          "document.documentElement.scrollHeight"
        );
        if (newHeight === previousHeight) {
          console.log(`\nReached end of feed for '${keyword}'`);
          break;
        }
      }
    }

    return results;
  } catch (e) {
    console.error(`\nError processing search term '${keyword}': ${e.message}`);
    return results;
  }
};

const processHashtagTerm = async (page, keyword, maxResults = 50) => {
  // 👇 FIXED: Removed extra whitespace
  const hashtagUrl = `https://www.tiktok.com/tag/${keyword}`;
  const results = [];
  const scrollPauseTime = 2000;

  try {
    console.log(`\nProcessing hashtag term: ${keyword}`);
    console.log(`Navigating to: ${hashtagUrl}`);

    if (await verifyPageLoaded(page, hashtagUrl)) {
      console.log("\nWaiting for video feed...");

      while (results.length < maxResults) {
        const videoElements = await page.$$('div[class*="DivItemContainerV2"]');

        if (!videoElements.length) {
          console.log("No video elements found. Waiting...");
          await randomDelay(4000, 8000);
          continue;
        }

        for (const element of videoElements) {
          if (results.length >= maxResults) break;

          const videoData = await extractVideoData(element);
          if (videoData?.video_url && !processedUrls.has(videoData.video_url)) {
            console.log(
              `Found video ${results.length}/${maxResults}: ${videoData.video_url}`
            );

            const postId = videoData.video_url.split("/").pop();
            videoData.comments = await extractComments(postId);
            console.log(`Found ${videoData.comments.count} comments`);

            processedUrls.add(videoData.video_url);
            results.push(videoData);
          }
        }

        if (results.length >= maxResults) {
          console.log(`\nReached target number of videos for '${keyword}'`);
          break;
        }

        const previousHeight = await page.evaluate(
          "document.documentElement.scrollHeight"
        );
        await page.evaluate(
          "window.scrollTo(0, document.documentElement.scrollHeight)"
        );
        await randomDelay(2000, 5000);

        const newHeight = await page.evaluate(
          "document.documentElement.scrollHeight"
        );
        if (newHeight === previousHeight) {
          console.log(`\nReached end of feed for '${keyword}'`);
          break;
        }
      }
    }

    return results;
  } catch (e) {
    console.error(`\nError processing hashtag term '${keyword}': ${e.message}`);
    return results;
  }
};

const saveCombinedResults = (results) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `combined_results_${timestamp}.json`;
    fs.writeFileSync(
      filename,
      JSON.stringify(
        {
          extraction_time: new Date().toISOString(),
          total_searches: results.length,
          results: results,
        },
        null,
        2
      )
    );
    return filename;
  } catch (e) {
    console.error("Error saving results:", e);
    return null;
  }
};

const main = async () => {
  const searchTerms = ["memecoin", "pumpfun", "solana", "crypto", "meme", "bags", "bonk"];
  const hashtagTerms = ["memecoin", "solana", "crypto", "pumpfun", "meme", "bags", "bonk"];

  const selectedProfile = "Profile 3";
  logger.info(`Using Chrome profile: ${selectedProfile}`);

  try {
    logger.info("Starting Chrome with profile...");
    const browser = await initBrowser();

    if (!browser) {
      logger.error("Failed to create Chrome browser");
      return;
    }

    const page = await browser.newPage();

    // 👇 ADD REALISTIC BROWSER FINGERPRINT
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://www.tiktok.com/',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    });

    await page.emulateTimezone('America/New_York');
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'language', { get: () => 'en-US' });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      // Hide webdriver flag
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    logger.info("Chrome started successfully");

    const allResults = [];
    let totalStored = 0;
    let totalErrors = 0;

    // Process search terms
    for (const search of searchTerms) {
      const results = await processSearchTerm(page, search, 100);
      if (results.length) {
        allResults.push({
          search,
          total_videos: results.length,
          videos: results,
        });
        console.log(
          `Successfully processed ${results.length} videos for '${search}'`
        );

        // Store each video immediately in Supabase
        for (const video of results) {
          try {
            const storedTikTok = await storeTikTokDataImmediately(video);
            if (storedTikTok) {
              totalStored++;
              // Store token mentions if available
              if (video.comments && video.comments.tickers) {
                await storeTokenMentionsImmediately(storedTikTok.id, video.comments);
              }
            }
          } catch (error) {
            totalErrors++;
            console.error(`Error storing video ${video.video_url}:`, error.message);
          }
        }
      }
      await randomDelay(5000, 10000);
    }

    console.log("\nAll search terms processed!");

    // Process hashtag terms
    for (const hashtag of hashtagTerms) {
      const results = await processHashtagTerm(page, hashtag, 200);
      if (results.length) {
        allResults.push({
          search: "#" + hashtag,
          total_videos: results.length,
          videos: results,
        });
        console.log(
          `Successfully processed ${results.length} videos for '#${hashtag}'`
        );

        // Store each video immediately in Supabase
        for (const video of results) {
          try {
            const storedTikTok = await storeTikTokDataImmediately(video);
            if (storedTikTok) {
              totalStored++;
              // Store token mentions if available
              if (video.comments && video.comments.tickers) {
                await storeTokenMentionsImmediately(storedTikTok.id, video.comments);
              }
            }
          } catch (error) {
            totalErrors++;
            console.error(`Error storing video ${video.video_url}:`, error.message);
          }
        }
      }
      await randomDelay(5000, 10000);
    }

    if (allResults.length) {
      const savedPath = saveCombinedResults(allResults);
      if (savedPath) {
        console.log("\nSuccessfully saved all results to file!");
      }
      
      // Summary of database operations
      console.log("\n📊 DATABASE STORAGE SUMMARY:");
      console.log(`✅ Successfully stored: ${totalStored} TikTok videos`);
      console.log(`❌ Storage errors: ${totalErrors}`);
      console.log(`📁 Total processed: ${allResults.reduce((sum, result) => sum + result.total_videos, 0)} videos`);
      
      if (totalStored > 0) {
        console.log("\n🎉 TikTok data has been successfully stored in Supabase database!");
        console.log("You can now view this data in your frontend dashboard.");
      }
    }

    console.log("\nAll hashtag terms processed!");
    console.log("Press Enter to close browser...");
    await new Promise((resolve) => process.stdin.once("data", resolve));
  } catch (e) {
    logger.error(`Unexpected error: ${e.message}`);
  } finally {
    try {
      if (browser) {
        await browser.close();
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
};

main();