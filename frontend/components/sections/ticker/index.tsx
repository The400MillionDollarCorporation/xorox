"use client";
import { useEffect, useState, useCallback } from "react";
import Tiktoks from "./tiktoks";
import TimeSeriesChart from "./time-series-chart";
import Tweets from "./tweets";
import { TokenData } from "@/lib/types";
import Image from "next/image";
import { useEnvironmentStore } from "@/components/context";
import { IPFS_GATEWAY_URL } from "@/lib/constants";
import ClientOnly from "@/components/ui/client-only";
import { getRealTimeService } from "@/lib/real-time-service";

export default function Ticker({ params }: { params: { id: string } }) {
  const [coinData, setCoinData] = useState<TokenData | null>(null);
  const { setToken, tokens } = useEnvironmentStore((store) => store);
  const [imageFetched, setImageFetched] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
  }, []);

  // Memoized function to fetch coin data
  const fetchCoinData = useCallback(async () => {
    if (isUpdatingPrice || !isClient) return;

    try {
      setIsUpdatingPrice(true);
      
      // Use cached data if available
      const cachedToken = tokens[params.id];
      if (cachedToken) {
        setCoinData(cachedToken);

        const pricesResponse = await fetch(
          `/api/supabase/get-prices?tokenId=${params.id}`
        );
        const pricesData = await pricesResponse.json();

        setCoinData((prev) =>
          prev
            ? {
                ...prev,
                prices: pricesData.data,
              }
            : null
        );
        setToken(parseInt(params.id), {
          ...cachedToken,
          prices: pricesData.data,
        });
      } else {
        const coinResponse = await fetch(
          `/api/supabase/get-coin-data?tokenId=${params.id}`
        );
        const coinData = await coinResponse.json();
        setCoinData(coinData);
        setToken(parseInt(params.id), coinData);
      }

      // Initiate long-running update-price API call
      const updateResponse = await fetch(`/api/supabase/update-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId: params.id }),
      });
      const updateData = await updateResponse.json();

      // Update prices after `update-price` completes
      if (updateData.success) {
        setCoinData((prev) =>
          prev
            ? {
                ...prev,
                prices: [...(prev.prices || []), ...updateData.data].sort(
                  (a, b) =>
                    new Date(a.trade_at).getTime() -
                    new Date(b.trade_at).getTime()
                ),
              }
            : null
        );

        if (coinData) {
          setToken(parseInt(params.id), {
            ...coinData,
            prices: updateData.data || [],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching coin data:", error);
    } finally {
      setIsUpdatingPrice(false);
    }
  }, [isClient, params.id, setToken, tokens, isUpdatingPrice]);

  // First useEffect for fetching initial coin data - only run once
  useEffect(() => {
    if (!isClient || isInitialized) return;
    
    fetchCoinData();
    setIsInitialized(true);
  }, [isClient, isInitialized, fetchCoinData]);

  // Real-time updates useEffect - subscribe to real-time events
  useEffect(() => {
    if (!isClient || !isInitialized) return;

    const realTimeService = getRealTimeService();
    if (!realTimeService) return;

    // Subscribe to trending updates (which might include our token)
    const unsubscribeTrending = realTimeService.subscribe('trending_update', (newData) => {
      // Check if the update includes our token
      if (newData && newData.tokenId === parseInt(params.id)) {
        console.log('🔄 Real-time update received for token:', params.id);
        // Refresh the data
        fetchCoinData();
      }
    });

    // Subscribe to TikTok updates (which might mention our token)
    const unsubscribeTiktok = realTimeService.subscribe('tiktok_update', (newData) => {
      // Check if the TikTok mentions our token
      if (newData && newData.mentions && newData.mentions.some((mention: any) => 
        mention.tokens && mention.tokens.some((token: any) => token.id === parseInt(params.id))
      )) {
        console.log('🔄 TikTok update mentions our token:', params.id);
        // Refresh the data
        fetchCoinData();
      }
    });

    // Subscribe to individual token price updates
    const unsubscribeTokenPrice = realTimeService.subscribe('token_price_update', (newData) => {
      // Check if this is an update for our specific token
      if (newData && newData.tokenId === parseInt(params.id)) {
        console.log('🔄 Token price update received for:', params.id, newData.symbol);
        // Update the price data immediately
        setCoinData((prev) => {
          if (prev && newData.latestPrice) {
            return {
              ...prev,
              prices: [...(prev.prices || []), newData.latestPrice].sort(
                (a, b) => new Date(a.trade_at).getTime() - new Date(b.trade_at).getTime()
              ),
              latest_price_usd: newData.latestPrice.price_usd,
              latest_price_sol: newData.latestPrice.price_sol,
            };
          }
          return prev;
        });
      }
    });

    // Set up interval for periodic updates (every 30 seconds) as fallback
    const interval = setInterval(() => {
      if (!isUpdatingPrice) {
        fetchCoinData();
      }
    }, 30000); // 30 seconds

    return () => {
      unsubscribeTrending();
      unsubscribeTiktok();
      unsubscribeTokenPrice();
      clearInterval(interval);
    };
  }, [isClient, isInitialized, fetchCoinData, isUpdatingPrice, params.id]);

  // Second useEffect for fetching image - only run when coinData changes and we have a URI
  useEffect(() => {
    if (!isClient || !coinData?.uri || imageFetched) return;
    
    const fetchImage = async () => {
      try {
        const metadataResponse = await fetch(
          `${IPFS_GATEWAY_URL}${coinData.uri.split("/").at(-1) || ""}`
        );
        const metadata = await metadataResponse.json();

        setCoinData((prev) =>
          prev
            ? {
                ...prev,
                image: metadata.image,
              }
            : null
        );
        setImageFetched(true);
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchImage();
  }, [isClient, coinData?.uri, imageFetched]);

  if (!isClient) {
    return (
      <div className="w-full xl:w-[1250px] mx-auto mt-12 px-4">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (coinData === null) {
    return (
      <div className="w-full xl:w-[1250px] mx-auto mt-12 px-4">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="w-full xl:w-[1250px] mx-auto mt-12 px-4">
        <TimeSeriesChart tokenData={coinData} />
        <Tweets
          symbol={coinData.symbol}
          tweets={coinData.tweets}
          growth={
            coinData.tweets ? (coinData.tweets.length > 0 ? "1.5" : "0") : "0"
          }
        />
        <Tiktoks symbol={coinData.symbol} tiktoks={coinData.tiktoks} />
      </div>
    </ClientOnly>
  );
}
