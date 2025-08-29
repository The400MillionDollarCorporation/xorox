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
    
    // Create the prices file path
    const pricesFilePath = path.join(resultsDir, `prices-${Date.now()}.json`);
    
    await fs.writeFile(
      pricesFilePath,
      JSON.stringify(response.data, null, 2),
      "utf-8"
    );
    
    console.log(`✅ Prices data saved to: ${pricesFilePath}`);
    
    metadata.sinceTimestamp = latestFetchTimestamp.toISOString();
    metadata.latestFetchTimestamp =
      response.data.data.Solana.DEXTrades[0].Block.Time;
    
    console.log("📊 NEW PRICES METADATA");
    console.log(metadata);
    console.log("🚀 PUSHING TO SUPABASE");
    console.log(`📈 Found ${response.data.data.Solana.DEXTrades.length} DEX trades`);
    
    await updateMetadata(metadata);
    await pushPrices("", response.data);
    
    console.log("✅ Prices data successfully processed and stored!");
  } catch (e) {
    console.error("❌ Error fetching data:", e);
    throw e;
  }
}

// fetchAndPushPrices();
