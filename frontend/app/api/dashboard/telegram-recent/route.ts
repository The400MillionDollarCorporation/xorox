import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://srsapzqvwxgrohisrwnm.supabase.co',
  process.env.SUPABASE_ANON_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyc2FwenF2d3hncm9oaXNyd25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODg4MTUsImV4cCI6MjA2NzM2NDgxNX0.IGGaJcpeEGj-Y7Drb-HRvSL7bnsJdX1dFrHtvnfyKLI'
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent messages
    const { data: messages, error: messagesError } = await supabase
      .from('telegram_messages')
      .select('*')
      .order('scraped_at', { ascending: false })
      .limit(limit);

    // Get active channels
    const { data: channels, error: channelsError } = await supabase
      .from('telegram_channels')
      .select('*')
      .eq('enabled', true)
      .limit(10);

    // Get trending keywords
    const { data: keywords, error: keywordsError } = await supabase
      .from('trending_keywords')
      .select('*')
      .eq('platform', 'telegram')
      .order('frequency', { ascending: false })
      .limit(10);

    if (messagesError || channelsError || keywordsError) {
      console.error('Error fetching Telegram data:', { messagesError, channelsError, keywordsError });
      return NextResponse.json(
        { error: 'Failed to fetch Telegram data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: messages || [],
      channels: channels || [],
      keywords: keywords || []
    });

  } catch (error) {
    console.error('Error fetching Telegram data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Telegram data' },
      { status: 500 }
    );
  }
}
