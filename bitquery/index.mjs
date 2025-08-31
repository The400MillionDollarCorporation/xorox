import { fetchAndPushMemecoins } from "./scripts/memecoins.mjs";
import { fetchAndPushPrices } from "./scripts/prices.mjs";
import { fetchMarketData, updateTokenMarketData } from "./scripts/market-data.mjs";

async function main() {
  try {
    console.log("🚀 Starting Bitquery data collection...");
    
    // Step 1: Fetch and push memecoins
    console.log("\n📈 Step 1: Fetching and pushing memecoins...");
    await fetchAndPushMemecoins();
    
    // Step 2: Fetch and push prices
    console.log("\n💰 Step 2: Fetching and pushing prices...");
    await fetchAndPushPrices();
    
    // Step 3: Fetch and push market data (market cap & total supply)
    console.log("\n📊 Step 3: Fetching and pushing market data...");
    await fetchAndPushMarketData();
    
    console.log("\n✅ All data collection completed successfully!");
  } catch (e) {
    console.error("❌ Error during data collection:", e);
  }
}

async function fetchAndPushMarketData() {
  try {
    // Get tokens from Supabase that need market data updates
    const tokens = await getTokensForMarketDataUpdate();
    
    if (!tokens || tokens.length === 0) {
      console.log("ℹ️ No tokens found that need market data updates");
      return;
    }
    
    console.log(`📊 Found ${tokens.length} tokens to update with market data`);
    
    // Process tokens in batches to avoid overwhelming the API
    const batchSize = 5; // Process 5 tokens at a time
    let processedCount = 0;
    
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(tokens.length / batchSize)}`);
      
      // Process batch concurrently
      const batchPromises = batch.map(async (token) => {
        try {
          console.log(`  🔍 Fetching market data for ${token.symbol || token.uri} (${token.address})`);
          
          const marketData = await fetchMarketData(token.address);
          
          if (marketData && (marketData.supply || marketData.marketCap || marketData.name || marketData.symbol)) {
            console.log(`  ✅ Market data fetched:`, {
              supply: marketData.supply,
              marketCap: marketData.marketCap,
              name: marketData.name,
              symbol: marketData.symbol
            });
            
            // Update token in Supabase with market data
            await updateTokenMarketData(marketData);
            processedCount++;
          } else {
            console.log(`  ⚠️ No market data available for ${token.symbol || token.uri}`);
          }
          
          // Add delay between API calls to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`  ❌ Error processing token ${token.symbol || token.uri}:`, error.message);
        }
      });
      
      // Wait for batch to complete
      await Promise.all(batchPromises);
      
      // Add delay between batches
      if (i + batchSize < tokens.length) {
        console.log(`  ⏳ Waiting 2 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n✅ Market data update completed. Processed ${processedCount} tokens.`);
    
  } catch (error) {
    console.error("❌ Error in fetchAndPushMarketData:", error);
    throw error;
  }
}

async function getTokensForMarketDataUpdate() {
  try {
    // Import Supabase client and environment variables
    const { createClient } = await import("@supabase/supabase-js");
    const dotenv = await import("dotenv");
    
    dotenv.config();
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_SECRET;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_ANON_SECRET in environment variables");
      return [];
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get tokens that either:
    // 1. Don't have market cap or total supply data
    // 2. Haven't been updated recently (older than 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { data: tokens, error } = await supabase
      .from("tokens")
      .select("id, uri, symbol, address, market_cap, total_supply, last_updated")
      .or(`market_cap.is.null,total_supply.is.null,last_updated.lt.${twentyFourHoursAgo.toISOString()}`)
      .not("address", "is", null)
      .limit(50); // Limit to 50 tokens per run
    
    if (error) {
      console.error("Error fetching tokens for market data update:", error);
      return [];
    }
    
    return tokens || [];
    
  } catch (error) {
    console.error("Error in getTokensForMarketDataUpdate:", error);
    return [];
  }
}

main();
