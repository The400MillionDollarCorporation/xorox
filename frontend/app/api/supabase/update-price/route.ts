import { getQuery } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

// Validate required environment variables
const BITQUERY_API_KEY = process.env.BITQUERY_API_KEY;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

if (!BITQUERY_API_KEY || !ACCESS_TOKEN) {
  console.warn("⚠️ Missing Bitquery API credentials:");
  console.warn("   BITQUERY_API_KEY:", BITQUERY_API_KEY ? "✅ Set" : "❌ Missing");
  console.warn("   ACCESS_TOKEN:", ACCESS_TOKEN ? "✅ Set" : "❌ Missing");
  console.warn("   Price updates will be limited to existing data only");
}

export const dynamic = 'force-dynamic';

// Helper function to clean up duplicate is_latest flags
async function cleanupDuplicateLatestFlags(supabase: any, tokenId: number) {
  try {
    console.log("🧹 Cleaning up duplicate is_latest flags for token:", tokenId);
    
    // Get all price records for this token
    const { data: allPrices, error: fetchError } = await supabase
      .from("prices")
      .select(`id, trade_at, is_latest`)
      .eq("token_id", tokenId)
      .order("trade_at", { ascending: false });
      
    if (fetchError) {
      console.error("Error fetching prices for cleanup:", fetchError);
      return;
    }
    
    if (!allPrices || allPrices.length === 0) {
      console.log("No prices found for cleanup");
      return;
    }
    
    console.log(`Found ${allPrices.length} price records for cleanup`);
    
    // Find records that should not have is_latest = true
    const recordsToUpdate = allPrices.slice(1).filter((p: { id: number; trade_at: string; is_latest: boolean }) => p.is_latest);
    
    if (recordsToUpdate.length === 0) {
      console.log("No duplicate is_latest flags found");
      return;
    }
    
    console.log(`Found ${recordsToUpdate.length} records with incorrect is_latest flag`);
    
    // Update all records to set is_latest = false
    const { error: updateError } = await supabase
      .from("prices")
      .update({ is_latest: false })
      .in('id', recordsToUpdate.map((p: { id: number; trade_at: string; is_latest: boolean }) => p.id));
      
    if (updateError) {
      console.error("Error updating is_latest flags:", updateError);
      return;
    }
    
    console.log(`✅ Successfully cleaned up ${recordsToUpdate.length} duplicate is_latest flags`);
    
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tokenId } = await request.json();
    console.log("Starting POST request handler");
    console.log("Received request with tokenId:", tokenId);

    if (!tokenId) {
      return NextResponse.json(
        { error: "Token ID is required" },
        { status: 400 }
      );
    }

    console.log("Fetching data for token ID:", tokenId);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_ANON_SECRET || ""
    );
    console.log("Supabase client created");

    // First check if the token exists
    const { data: tokenData, error: tokenError } = await supabase
      .from("tokens")
      .select(`id, address`)
      .eq("id", parseInt(tokenId))
      .single();

    if (tokenError) {
      console.error("Error fetching token:", tokenError);
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    // Then get the latest price data - use timestamp ordering instead of is_latest flag
    let { data, error } = await supabase
      .from("prices")
      .select(`price_usd, price_sol, trade_at`)
      .eq("token_id", parseInt(tokenId))
      .order("trade_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching token data:", error);
      
      // Handle specific database errors
      if (error.code === 'PGRST116') {
        console.warn("⚠️ Multiple price records found - cleaning up database and retrying");
        
        // Clean up duplicate is_latest flags
        await cleanupDuplicateLatestFlags(supabase, parseInt(tokenId));
        
        // Try the original query again after cleanup
        const { data: retryData, error: retryError } = await supabase
          .from("prices")
          .select(`price_usd, price_sol, trade_at`)
          .eq("token_id", parseInt(tokenId))
          .eq("is_latest", true)
          .single();
          
        if (retryError) {
          console.error("Query still failed after cleanup:", retryError);
          return NextResponse.json(
            { error: "Failed to fetch price data after cleanup" },
            { status: 500 }
          );
        }
        
        // Use the retry data
        data = retryData;
      } else {
        return NextResponse.json(
          { error: "Failed to fetch token data" },
          { status: 500 }
        );
      }
    }

    console.log("Token data fetched successfully:", tokenData);
    const now = Date.now();
    const requestBodies = [];
    console.log("Current timestamp:", new Date(now).toISOString());

    // Check if we have the required API credentials
    if (!BITQUERY_API_KEY || !ACCESS_TOKEN) {
      console.log("⚠️ Skipping external API calls due to missing credentials");
      console.log("   Returning existing price data only");
      
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: "Price update skipped - missing API credentials",
        existingData: data
      });
    }

    // Always get current price
    console.log("Adding request for current price");
    requestBodies.push({
      query: getQuery(tokenData.address, true, 0),
      variables: "{}",
    });

    const sincePriceFetch =
      data && data.trade_at ? new Date(data.trade_at).getTime() : 0;
    const timeDiff = now - sincePriceFetch;
    console.log(
      "Time since last price fetch:",
      timeDiff / (60 * 1000),
      "minutes"
    );

    // Helper function to add request bodies based on time intervals
    if (!sincePriceFetch || timeDiff > 12 * 60 * 60 * 1000) {
      console.log("Adding 12h and 6h requests");
      requestBodies.push({
        query: getQuery(tokenData.address, false, 0),
        variables: "{}",
      });
      requestBodies.push({
        query: getQuery(tokenData.address, false, 1200),
        variables: "{}",
      });
    } else if (timeDiff > 30 * 60 * 1000) {
      console.log("Adding 30min request");
      requestBodies.push({
        query: getQuery(tokenData.address, true, 2000),
        variables: "{}",
      });
    } else if (timeDiff > 0) {
      console.log("Adding 5min request");
      requestBodies.push({
        query: getQuery(tokenData.address, true, 1000),
        variables: "{}",
      });
    }

    console.log(`Preparing to make ${requestBodies.length} API requests`);
    const axiosConfig = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://streaming.bitquery.io/eap",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": BITQUERY_API_KEY,
        Authorization: "Bearer " + ACCESS_TOKEN,
      },
    };

    console.log("Making API requests...");
    const responses = await Promise.all(
      requestBodies.map((body) =>
        axios.request({ ...axiosConfig, data: JSON.stringify(body) })
      )
    );
    console.log(`Received ${responses.length} API responses`);

    const insertData = responses.reduce((acc: Array<{
      token_id: number;
      price_sol: number;
      price_usd: number;
      trade_at: string;
      is_latest: boolean;
    }>, response, index) => {
      console.log(`Processing response ${index + 1}/${responses.length}`);
      if (response.data.errors) {
        console.error(`Error in response ${index + 1}:`, response.data.errors);
        throw new Error(JSON.stringify(response.data.errors));
      }

      const trades = response.data.data?.Solana.DEXTrades;
      if (trades?.[0]) {
        const trade = trades[0];
        console.log(`Found trade data in response ${index + 1}:`, trade);
        acc.push({
          token_id: tokenData.id,
          price_sol: trade.Trade.Buy.Price,
          price_usd: trade.Trade.Buy.PriceInUSD,
          trade_at: trade.Block.Time,
          is_latest: true,
        });
      } else {
        console.log(`No trade data found in response ${index + 1}`);
      }
      return acc;
    }, []);

    if (insertData.length > 0) {
      console.log("Preparing to insert price data:", insertData);
      
      // First, set all existing prices for this token to is_latest = false
      const { error: updateError } = await supabase
        .from("prices")
        .update({ is_latest: false })
        .eq("token_id", tokenData.id);
        
      if (updateError) {
        console.error("Error updating existing prices:", updateError);
        // Continue with insert anyway
      } else {
        console.log("✅ Set all existing prices to is_latest = false");
      }
      
      // Now insert the new price data
      const { error: insertError } = await supabase
        .from("prices")
        .insert(insertData);

      if (insertError) {
        console.error("Error inserting prices:", insertError);
        throw new Error(`Failed to insert prices: ${insertError.message}`);
      }

      console.log(`Successfully inserted ${insertData.length} price records`);
    } else {
      console.log("No price data to insert");
    }

    return NextResponse.json({ success: true, data: insertData });
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json(
          { error: "API authentication failed - check Bitquery credentials" },
          { status: 401 }
        );
      }
      if (error.message.includes("Request failed with status code 401")) {
        return NextResponse.json(
          { error: "Bitquery API authentication failed - check API keys" },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

