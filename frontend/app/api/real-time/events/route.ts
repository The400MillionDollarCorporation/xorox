import { NextRequest } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  // Get the base URL from the request
  const baseUrl = request.nextUrl.origin;
  
  const stream = new ReadableStream({
    start(controller) {
      let isStreamActive = true;
      
      // Send initial connection message
      if (isStreamActive) {
        controller.enqueue(encoder.encode('data: {"type":"connected","payload":{"message":"Real-time connection established"}}\n\n'));
      }
      
      // Set up interval to check for database changes
      const interval = setInterval(async () => {
        try {
          // Check if stream is still active before writing
          if (!isStreamActive) {
            clearInterval(interval);
            return;
          }

          // Check for new TikTok data
          const tiktokResponse = await fetch(`${baseUrl}/api/supabase/get-tiktoks?limit=1`);
          if (tiktokResponse.ok && isStreamActive) {
            const tiktokData = await tiktokResponse.json();
            if (tiktokData.data && tiktokData.data.length > 0) {
              const latestVideo = tiktokData.data[0];
              try {
                controller.enqueue(encoder.encode(`data: {"type":"tiktok_update","payload":${JSON.stringify(latestVideo)}}\n\n`));
              } catch (enqueueError) {
                if (enqueueError instanceof Error && 'code' in enqueueError && enqueueError.code === 'ERR_INVALID_STATE') {
                  isStreamActive = false;
                  clearInterval(interval);
                  return;
                }
                throw enqueueError;
              }
            }
          }

          // Check for new trending coins data
          const trendingResponse = await fetch(`${baseUrl}/api/dashboard/trending-coins?limit=1`);
          if (trendingResponse.ok && isStreamActive) {
            const trendingData = await trendingResponse.json();
            if (trendingData.coins && trendingData.coins.length > 0) {
              try {
                controller.enqueue(encoder.encode(`data: {"type":"trending_update","payload":${JSON.stringify(trendingData.coins[0])}}\n\n`));
              } catch (enqueueError) {
                if (enqueueError instanceof Error && 'code' in enqueueError && enqueueError.code === 'ERR_INVALID_STATE') {
                  isStreamActive = false;
                  clearInterval(interval);
                  return;
                }
                throw enqueueError;
              }
            }
          }

        } catch (error) {
          console.error('Error checking for updates:', error);
          // If there's an error, check if we should close the stream
          if (error instanceof Error && 'code' in error && error.code === 'ERR_INVALID_STATE') {
            isStreamActive = false;
            clearInterval(interval);
            try {
              controller.close();
            } catch (closeError) {
              // Stream already closed, ignore
            }
          }
        }
      }, 10000); // Check every 10 seconds to reduce stream pressure

      // Clean up interval when connection closes
      request.signal.addEventListener('abort', () => {
        isStreamActive = false;
        clearInterval(interval);
        try {
          controller.close();
        } catch (closeError) {
          // Stream already closed, ignore
        }
      });

      // Handle stream close events
      request.signal.addEventListener('close', () => {
        isStreamActive = false;
        clearInterval(interval);
        try {
          controller.close();
        } catch (closeError) {
          // Stream already closed, ignore
        }
      });

      // Additional safety: check if stream is still active before each interval
      const checkStreamActive = () => {
        if (!isStreamActive) {
          clearInterval(interval);
        }
      };
      
      // Check stream state every second as additional safety
      const safetyInterval = setInterval(checkStreamActive, 1000);
      
      // Clean up safety interval
      request.signal.addEventListener('abort', () => {
        clearInterval(safetyInterval);
      });
      
      request.signal.addEventListener('close', () => {
        clearInterval(safetyInterval);
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
