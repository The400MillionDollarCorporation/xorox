import axios from "axios";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Polyfill for Node.js compatibility
import fetch from 'node-fetch';
import { Headers } from 'node-fetch';

// Set global fetch and Headers for Supabase compatibility
global.fetch = fetch;
global.Headers = Headers;

dotenv.config();

export async function fetchMarketData(tokenMintAddress) {
  // Validate environment variables
  if (!process.env.BITQUERY_API_KEY) {
    throw new Error("BITQUERY_API_KEY environment variable is not set");
  }
  
  if (!process.env.ACCESS_TOKEN) {
    throw new Error("ACCESS_TOKEN environment variable is not set");
  }

  const query = {
    query: `{
      Solana {
        TokenSupplyUpdates(
          where: {
            TokenSupplyUpdate: {
              Currency: { MintAddress: { is: "${tokenMintAddress}" } }
            }
          }
          limit: { count: 1 }
          orderBy: { descending: Block_Time }
        ) {
          TokenSupplyUpdate {
            Currency {
              Name
              Symbol
              MintAddress
              Decimals
            }
            PostBalance          # Total supply
            PostBalanceInUSD     # Market cap (if available)
          }
        }
      }
      Trading {
        Tokens(
          limit: { count: 1 }
          where: {
            Price: { IsQuotedInUsd: true }
            Interval: { Time: { Duration: { eq: 1 } } }
            Token: { Address: { is: "${tokenMintAddress}" } }
          }
        ) {
          Block {
            Time(maximum: Block_Time)
          }
          Price {
            Average {
              Mean             # Current price
            }
          }
        }
      }
    }`,
    variables: "{}"
  };

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://streaming.bitquery.io/eap",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.BITQUERY_API_KEY,
      "Authorization": "Bearer " + process.env.ACCESS_TOKEN,
    },
    data: JSON.stringify(query),
  };

  try {
    console.log(`🔍 Fetching market data for token: ${tokenMintAddress}`);
    
    const response = await axios.request(config);
    
    // Debug: Log the response structure
    console.log("🔍 API Response Status:", response.status);
    console.log("🔍 Response Data Keys:", Object.keys(response.data || {}));
    
    // Validate response structure
    if (!response.data) {
      throw new Error("No response data received from Bitquery API");
    }
    
    // Check for API errors
    if (response.data.errors) {
      console.error("❌ Bitquery API Errors:", response.data.errors);
      throw new Error(`Bitquery API returned errors: ${JSON.stringify(response.data.errors)}`);
    }
    
    // Check for rate limiting or authentication issues
    if (response.status === 401) {
      throw new Error("Bitquery API authentication failed - check API key and access token");
    }
    
    if (response.status === 403) {
      throw new Error("Bitquery API access denied - check API permissions");
    }
    
    if (response.status === 429) {
      throw new Error("Bitquery API rate limit exceeded - try again later");
    }
    
    // Validate the expected data structure
    if (!response.data.data) {
      throw new Error("Bitquery API response missing 'data' field");
    }
    
    const marketData = {
      tokenMintAddress,
      supply: null,
      marketCap: null,
      currentPrice: null,
      name: null,
      symbol: null,
      decimals: null
    };
    
    // Extract supply and market cap data
    if (response.data.data.Solana && response.data.data.Solana.TokenSupplyUpdates) {
      const supplyUpdate = response.data.data.Solana.TokenSupplyUpdates[0];
      if (supplyUpdate && supplyUpdate.TokenSupplyUpdate) {
        const update = supplyUpdate.TokenSupplyUpdate;
        marketData.supply = update.PostBalance;
        marketData.marketCap = update.PostBalanceInUSD;
        
        if (update.Currency) {
          marketData.name = update.Currency.Name;
          marketData.symbol = update.Currency.Symbol;
          marketData.decimals = update.Currency.Decimals;
        }
      }
    }
    
    // Extract current price data
    if (response.data.data.Trading && response.data.data.Trading.Tokens) {
      const tokenData = response.data.data.Trading.Tokens[0];
      if (tokenData && tokenData.Price && tokenData.Price.Average) {
        marketData.currentPrice = tokenData.Price.Average.Mean;
      }
    }
    
    console.log("📊 Market Data Extracted:", marketData);
    return marketData;
    
  } catch (error) {
    console.error("❌ Error fetching market data:", error);
    
    // Enhanced error logging
    if (error.response) {
      console.error("❌ HTTP Response Error:");
      console.error("  Status:", error.response.status);
      console.error("  Status Text:", error.response.statusText);
      console.error("  Data:", error.response.data);
    } else if (error.request) {
      console.error("❌ Network Request Error:");
      console.error("  Request:", error.request);
    } else {
      console.error("❌ Other Error:", error.message);
    }
    
    throw error;
  }
}

// Function to update token market data in Supabase
export async function updateTokenMarketData(marketData) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_SECRET;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_SECRET in environment variables");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Find token by mint address
    const { data: tokens, error: tokenError } = await supabase
      .from("tokens")
      .select("id, uri")
      .eq("address", marketData.tokenMintAddress);
    
    if (tokenError) {
      console.error("Error fetching token:", tokenError);
      return;
    }
    
    if (!tokens || tokens.length === 0) {
      console.warn(`Token not found for mint address: ${marketData.tokenMintAddress}`);
      return;
    }
    
    const token = tokens[0];
    
    // Update token with market data
    const updateData = {};
    if (marketData.name) updateData.name = marketData.name;
    if (marketData.symbol) updateData.symbol = marketData.symbol;
    if (marketData.supply) updateData.total_supply = marketData.supply;
    if (marketData.marketCap) updateData.market_cap = marketData.marketCap;
    updateData.last_updated = new Date().toISOString();
    
    const { error: updateError } = await supabase
      .from("tokens")
      .update(updateData)
      .eq("id", token.id);
    
    if (updateError) {
      console.error("Error updating token market data:", updateError);
    } else {
      console.log(`✅ Token ${token.id} market data updated successfully`);
    }
    
  } catch (error) {
    console.error("Error updating token market data:", error);
  }
}

// Test function
async function testMarketDataFetch() {
  try {
    // Test with a sample Solana token mint address
    const testMintAddress = "11111111111111111111111111111111"; // Replace with actual token address
    const marketData = await fetchMarketData(testMintAddress);
    console.log("✅ Market data fetch test successful:", marketData);
  } catch (error) {
    console.error("❌ Market data fetch test failed:", error);
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testMarketDataFetch()
    .then(() => {
      console.log("✅ Test completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}
