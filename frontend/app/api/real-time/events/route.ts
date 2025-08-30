import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode('data: {"type":"connected","payload":{"message":"Real-time connection established"}}\n\n'));
      
      // Set up interval to check for database changes
      const interval = setInterval(async () => {
        try {
          // Check for new TikTok data
          const tiktokResponse = await fetch(`${request.nextUrl.origin}/api/supabase/get-tiktoks?limit=1`);
          if (tiktokResponse.ok) {
            const tiktokData = await tiktokResponse.json();
            if (tiktokData.data && tiktokData.data.length > 0) {
              const latestVideo = tiktokData.data[0];
              controller.enqueue(encoder.encode(`data: {"type":"tiktok_update","payload":${JSON.stringify(latestVideo)}}\n\n`));
            }
          }

          // Check for new trending coins data
          const trendingResponse = await fetch(`${request.nextUrl.origin}/api/dashboard/trending-coins?limit=1`);
          if (trendingResponse.ok) {
            const trendingData = await trendingResponse.json();
            if (trendingData.coins && trendingData.coins.length > 0) {
              controller.enqueue(encoder.encode(`data: {"type":"trending_update","payload":${JSON.stringify(trendingData.coins[0])}}\n\n`));
            }
          }

        } catch (error) {
          console.error('Error checking for updates:', error);
        }
      }, 5000); // Check every 5 seconds

      // Clean up interval when connection closes
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
