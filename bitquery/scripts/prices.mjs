import axios from "axios";
import dotenv from "dotenv";
import * as fs from "fs/promises";
import path from "path";
import { pushPrices } from "./supabase/prices.mjs";

// Polyfill for Node.js compatibility
import fetch from 'node-fetch';
import { Headers } from 'node-fetch';

// Set global fetch and Headers for Supabase compatibility
global.fetch = fetch;
global.Headers = Headers;

dotenv.config();

// Ensure results directory exists
const resultsDir = path.join(process.cwd(), 'results', 'prices');
const metadataPath = path.join(resultsDir, 'metadata.json');

// Create results directory if it doesn't exist
await fs.mkdir(resultsDir, { recursive: true });

const getMetadata = async () => {
  try {
    return JSON.parse(await fs.readFile(metadataPath, "utf-8"));
  } catch (error) {
    console.log("Creating new metadata file...");
    // Return default metadata if file doesn't exist or is invalid
    return {
      sinceTimestamp: "2024-12-20T03:46:24Z",
      latestFetchTimestamp: "2024-12-20T03:46:24Z",
    };
  }
};

async function updateMetadata(metadata) {
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");
}

// axios
//   .request(config)
//   .then((response) => {
//     // Save the response data as a JSON file
//     fs.writeFileSync(
//       "results/prices-5.json",
//       JSON.stringify(response.data, null, 2),
//       "utf-8"
//     );
//     console.log("Data saved to response.json");
//     pushPrices("./results/prices-" + Date.now() + ".json");
//   })
//   .catch((error) => {
//     console.error("Error fetching data:", error);
//   });

export async function fetchAndPushPrices() {
  // Validate environment variables
  if (!process.env.BITQUERY_API_KEY) {
    throw new Error("BITQUERY_API_KEY environment variable is not set");
  }
  
  if (!process.env.ACCESS_TOKEN) {
    throw new Error("ACCESS_TOKEN environment variable is not set");
  }
  
  console.log("🔑 API Configuration:");
  console.log("  BITQUERY_API_KEY:", process.env.BITQUERY_API_KEY ? "✅ Set" : "❌ Missing");
  console.log("  ACCESS_TOKEN:", process.env.ACCESS_TOKEN ? "✅ Set" : "❌ Missing");
  
  const metadata = await getMetadata();
  const latestFetchTimestamp = new Date(metadata.latestFetchTimestamp);
  latestFetchTimestamp.setSeconds(latestFetchTimestamp.getSeconds() + 1);

  const data = JSON.stringify({
    query: `{
    Solana {
      DEXTrades(
        limitBy: { by: Trade_Buy_Currency_MintAddress, count: 1 }
        orderBy: { descending: Block_Time }
        where: {
          Trade: {
            Dex: { ProtocolName: { is: "pump" } }
            Buy: {
              Currency: {
                MintAddress: { notIn: ["11111111111111111111111111111111"] }
              }
            }
          }
          Transaction: { Result: { Success: true } }
          Block: {Time: {since: "${latestFetchTimestamp.toISOString()}"}}
        }
      ) {
        Trade {
          Buy {
            Price
            PriceInUSD
            Currency {
              Uri
              MintAddress
              Name
              Symbol
            }
          }
        }
        Block {
          Time
        }
      }
    }
  }
  `,
    variables: "{}",
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://streaming.bitquery.io/eap",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.BITQUERY_API_KEY,
      Authorization: "Bearer " + process.env.ACCESS_TOKEN,
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    
    // Debug: Log the response structure
    console.log("🔍 API Response Status:", response.status);
    console.log("🔍 API Response Headers:", Object.keys(response.headers));
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
      console.error("❌ Unexpected response structure - no 'data' field");
      console.error("Response structure:", JSON.stringify(response.data, null, 2));
      throw new Error("Bitquery API response missing 'data' field");
    }
    
    if (!response.data.data.Solana) {
      console.error("❌ Unexpected response structure - no 'Solana' field");
      console.error("Available data fields:", Object.keys(response.data.data));
      throw new Error("Bitquery API response missing 'Solana' field");
    }
    
    if (!response.data.data.Solana.DEXTrades) {
      console.error("❌ Unexpected response structure - no 'DEXTrades' field");
      console.error("Solana fields:", Object.keys(response.data.data.Solana));
      throw new Error("Bitquery API response missing 'DEXTrades' field");
    }
    
    if (!Array.isArray(response.data.data.Solana.DEXTrades)) {
      console.error("❌ Unexpected response structure - 'DEXTrades' is not an array");
      console.error("DEXTrades type:", typeof response.data.data.Solana.DEXTrades);
      throw new Error("Bitquery API response 'DEXTrades' is not an array");
    }
    
    if (response.data.data.Solana.DEXTrades.length === 0) {
      console.warn("⚠️ No DEX trades found for the specified time range");
      console.log("Time range:", latestFetchTimestamp.toISOString(), "to now");
      
      // Update metadata to avoid infinite loops
      metadata.sinceTimestamp = latestFetchTimestamp.toISOString();
      metadata.latestFetchTimestamp = new Date().toISOString();
      await updateMetadata(metadata);
      
      console.log("✅ Metadata updated - no trades to process");
      return;
    }
    
    // Create the prices file path
    const pricesFilePath = path.join(resultsDir, `prices-${Date.now()}.json`);
    
    await fs.writeFile(
      pricesFilePath,
      JSON.stringify(response.data, null, 2),
      "utf-8"
    );
    
    console.log(`✅ Prices data saved to: ${pricesFilePath}`);
    
    // Safely access the first trade's block time
    const firstTrade = response.data.data.Solana.DEXTrades[0];
    if (!firstTrade || !firstTrade.Block || !firstTrade.Block.Time) {
      console.error("❌ First trade missing required fields");
      console.error("First trade structure:", JSON.stringify(firstTrade, null, 2));
      throw new Error("First DEX trade missing Block.Time field");
    }
    
    metadata.sinceTimestamp = latestFetchTimestamp.toISOString();
    metadata.latestFetchTimestamp = firstTrade.Block.Time;
    
    console.log("📊 NEW PRICES METADATA");
    console.log(metadata);
    console.log("🚀 PUSHING TO SUPABASE");
    console.log(`📈 Found ${response.data.data.Solana.DEXTrades.length} DEX trades`);
    
    await updateMetadata(metadata);
    await pushPrices("", response.data);
    
    console.log("✅ Prices data successfully processed and stored!");
  } catch (e) {
    console.error("❌ Error fetching data:", e);
    
    // Enhanced error logging
    if (e.response) {
      console.error("❌ HTTP Response Error:");
      console.error("  Status:", e.response.status);
      console.error("  Status Text:", e.response.statusText);
      console.error("  Headers:", e.response.headers);
      console.error("  Data:", e.response.data);
    } else if (e.request) {
      console.error("❌ Network Request Error:");
      console.error("  Request:", e.request);
    } else {
      console.error("❌ Other Error:", e.message);
    }
    
    throw e;
  }
}

// fetchAndPushPrices();
