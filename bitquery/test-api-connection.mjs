import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function testBitqueryConnection() {
  console.log("🧪 Testing Bitquery API Connection...");
  
  // Check environment variables
  console.log("\n🔑 Environment Variables:");
  console.log("  BITQUERY_API_KEY:", process.env.BITQUERY_API_KEY ? "✅ Set" : "❌ Missing");
  console.log("  ACCESS_TOKEN:", process.env.ACCESS_TOKEN ? "✅ Set" : "❌ Missing");
  
  if (!process.env.BITQUERY_API_KEY || !process.env.ACCESS_TOKEN) {
    console.error("❌ Missing required environment variables");
    return;
  }
  
  // Test with a simple query
  const testQuery = {
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
            Block: {Time: {since: "2024-01-01T00:00:00Z"}}
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
                MarketCap
                TotalSupply
              }
            }
          }
          Block {
            Time
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
    data: JSON.stringify(testQuery),
  };
  
  try {
    console.log("\n🚀 Making API request...");
    console.log("  URL:", config.url);
    console.log("  Headers:", Object.keys(config.headers));
    
    const response = await axios.request(config);
    
    console.log("\n✅ API Response Received:");
    console.log("  Status:", response.status);
    console.log("  Status Text:", response.statusText);
    console.log("  Response Headers:", Object.keys(response.headers));
    
    if (response.data) {
      console.log("\n📊 Response Data Structure:");
      console.log("  Root Keys:", Object.keys(response.data));
      
      if (response.data.errors) {
        console.error("❌ API Errors:", response.data.errors);
      }
      
      if (response.data.data) {
        console.log("  Data Keys:", Object.keys(response.data.data));
        
        if (response.data.data.Solana) {
          console.log("  Solana Keys:", Object.keys(response.data.data.Solana));
          
          if (response.data.data.Solana.DEXTrades) {
            console.log("  DEXTrades Count:", response.data.data.Solana.DEXTrades.length);
            
            if (response.data.data.Solana.DEXTrades.length > 0) {
              const firstTrade = response.data.data.Solana.DEXTrades[0];
              console.log("\n📈 First Trade Sample:");
              console.log("  Trade Structure:", Object.keys(firstTrade));
              
              if (firstTrade.Trade) {
                console.log("  Trade.Buy Structure:", Object.keys(firstTrade.Trade.Buy || {}));
                console.log("  Trade.Buy.Currency Structure:", Object.keys(firstTrade.Trade.Buy?.Currency || {}));
              }
              
              if (firstTrade.Block) {
                console.log("  Block Structure:", Object.keys(firstTrade.Block));
              }
            }
          }
        }
      }
      
      // Save full response for inspection
      const fs = await import('fs/promises');
      await fs.writeFile(
        'test-response.json',
        JSON.stringify(response.data, null, 2),
        'utf-8'
      );
      console.log("\n💾 Full response saved to: test-response.json");
    }
    
  } catch (error) {
    console.error("\n❌ API Request Failed:");
    
    if (error.response) {
      console.error("  Status:", error.response.status);
      console.error("  Status Text:", error.response.statusText);
      console.error("  Response Data:", error.response.data);
    } else if (error.request) {
      console.error("  Network Error:", error.message);
    } else {
      console.error("  Other Error:", error.message);
    }
  }
}

// Run the test
testBitqueryConnection()
  .then(() => {
    console.log("\n✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
