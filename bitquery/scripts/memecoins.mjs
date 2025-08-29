import axios from "axios";
import dotenv from "dotenv";
import * as fs from "fs/promises";
import { pushMemecoins } from "./supabase/memecoins.mjs";
import path from "path";

// Polyfill for Node.js compatibility
import fetch from 'node-fetch';
import { Headers } from 'node-fetch';

// Set global fetch and Headers for Supabase compatibility
global.fetch = fetch;
global.Headers = Headers;

dotenv.config();

// Ensure results directory exists
const resultsDir = path.join(process.cwd(), 'results', 'memecoins');
const metadataPath = path.join(resultsDir, 'metadata.json');

// Create results directory if it doesn't exist
await fs.mkdir(resultsDir, { recursive: true });

const getMetadata = async () => {
  try {
    return JSON.parse(await fs.readFile(metadataPath, "utf-8"));
  } catch (error) {
    console.error("Error reading metadata:", error);
    return {
      sinceTimestamp: "2024-12-20T03:46:24Z",
      latestFetchTimestamp: null,
    };
  }
};

async function updateMetadata(metadata) {
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");
}

export async function fetchAndPushMemecoins() {
  console.log("Starting memecoins fetch...");
  
  const metadata = await getMetadata();
  const latestFetchTimestamp = metadata.latestFetchTimestamp 
    ? new Date(metadata.latestFetchTimestamp) 
    : new Date("2024-12-20T03:46:24Z");
  
  latestFetchTimestamp.setSeconds(latestFetchTimestamp.getSeconds() + 1);

  const data = JSON.stringify({
    query: `{
    Solana {
      Instructions(
        where: {Instruction: {Program: {Method: {is: "create"}, Name: {is: "pump"}}}, Block: {Time: {since: "${latestFetchTimestamp.toISOString()}"}}}
        orderBy: {descending: Block_Time}
      ) {
        Instruction {
          Program {
            Address
            Arguments {
              Value {
                ... on Solana_ABI_Json_Value_Arg {
                  json
                }
                ... on Solana_ABI_Float_Value_Arg {
                  float
                }
                ... on Solana_ABI_Boolean_Value_Arg {
                  bool
                }
                ... on Solana_ABI_Bytes_Value_Arg {
                  hex
                }
                ... on Solana_ABI_BigInt_Value_Arg {
                  bigInteger
                }
                ... on Solana_ABI_Address_Value_Arg {
                  address
                }
                ... on Solana_ABI_String_Value_Arg {
                  string
                }
                ... on Solana_ABI_Integer_Value_Arg {
                  integer
                }
              }
            }
          }
        }
        Transaction {
          Signature
        }
        Block {
          Time
        }
      }
    }
  }`,
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
    console.log("Making request to Bitquery...");
    const response = await axios.request(config);
    
    console.log("Response received, processing data...");
    
    // Save results to file
    const resultFilename = path.join(resultsDir, `next-memecoins-${Date.now()}.json`);
    await fs.writeFile(
      resultFilename,
      JSON.stringify(response.data, null, 2),
      "utf-8"
    );

    console.log(`Results saved to: ${resultFilename}`);

    // Update metadata
    metadata.sinceTimestamp = latestFetchTimestamp.toISOString();
    metadata.latestFetchTimestamp = 
      response.data.data.Solana.Instructions[0]?.Block?.Time || 
      new Date().toISOString();

    console.log("NEW MEMECOINS METADATA");
    console.log(metadata);
    
    await updateMetadata(metadata);
    
    console.log("PUSHING TO SUPABASE");
    console.log(`Number of instructions: ${response.data.data.Solana.Instructions.length}`);
    
    await pushMemecoins("", response.data);
    
    console.log("Data successfully pushed to Supabase!");
    return response.data;
  } catch (e) {
    console.error("Error fetching data:", e);
    throw e;
  }
}

// Main function to run the script directly
async function main() {
  try {
    console.log("Starting Bitquery Memecoins Fetch...");
    const result = await fetchAndPushMemecoins();
    console.log("Fetch completed successfully!");
    console.log("Number of instructions:", result.data.Solana.Instructions.length);
  } catch (error) {
    console.error("Error in main function:", error);
    process.exit(1);
  }
}

// Run the main function if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
