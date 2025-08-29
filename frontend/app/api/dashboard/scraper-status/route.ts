import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://srsapzqvwxgrohisrwnm.supabase.co',
  process.env.SUPABASE_ANON_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyc2FwenF2d3hncm9oaXNyd25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODg4MTUsImV4cCI6MjA2NzM2NDgxNX0.IGGaJcpeEGj-Y7Drb-HRvSL7bnsJdX1dFrHtvnfyKLI'
);

export async function GET() {
  try {
    // Get TikTok data
    const { data: tiktokData, error: tiktokError } = await supabase
      .from('tiktoks')
      .select('fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1);

    // Get Telegram data
    const { data: telegramData, error: telegramError } = await supabase
      .from('telegram_messages')
      .select('scraped_at')
      .order('scraped_at', { ascending: false })
      .limit(1);

    // Get pattern analysis data
    const { data: analysisData, error: analysisError } = await supabase
      .from('pattern_analysis_results')
      .select('timestamp')
      .order('timestamp', { ascending: false })
      .limit(1);

    // Get today's counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: tiktokToday } = await supabase
      .from('tiktoks')
      .select('*', { count: 'exact', head: true })
      .gte('fetched_at', today.toISOString());

    const { count: telegramToday } = await supabase
      .from('telegram_messages')
      .select('*', { count: 'exact', head: true })
      .gte('scraped_at', today.toISOString());

    const { count: analysisToday } = await supabase
      .from('pattern_analysis_results')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', today.toISOString());

    // Get total counts
    const { count: totalTiktok } = await supabase
      .from('tiktoks')
      .select('*', { count: 'exact', head: true });

    const { count: totalTelegram } = await supabase
      .from('telegram_messages')
      .select('*', { count: 'exact', head: true });

    const { count: totalAnalysis } = await supabase
      .from('pattern_analysis_results')
      .select('*', { count: 'exact', head: true });

    const status = {
      tiktok: {
        isRunning: false, // This would need to be tracked separately
        lastRun: tiktokData?.[0]?.fetched_at || 'Never',
        totalVideos: totalTiktok || 0,
        videosToday: tiktokToday || 0,
        status: tiktokError ? 'error' : 'idle'
      },
      telegram: {
        isRunning: false, // This would need to be tracked separately
        lastRun: telegramData?.[0]?.scraped_at || 'Never',
        totalMessages: totalTelegram || 0,
        messagesToday: telegramToday || 0,
        status: telegramError ? 'error' : 'idle'
      },
      patternAnalysis: {
        isRunning: false, // This would need to be tracked separately
        lastRun: analysisData?.[0]?.timestamp || 'Never',
        totalAnalyses: totalAnalysis || 0,
        analysesToday: analysisToday || 0,
        status: analysisError ? 'error' : 'idle'
      }
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching scraper status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scraper status' },
      { status: 500 }
    );
  }
}
