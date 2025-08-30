import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_ANON_SECRET || ""
    );

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error", env: { 
          SUPABASE_URL: !!process.env.SUPABASE_URL, 
          SUPABASE_ANON_SECRET: !!process.env.SUPABASE_ANON_SECRET 
        }},
        { status: 500 }
      );
    }

    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('tokens')
      .select('count(*)', { count: 'exact' })
      .limit(1);

    if (testError) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: testError.message,
        code: testError.code
      }, { status: 500 });
    }

    // Check table structure
    const { data: tokens, error: tokensError } = await supabase
      .from('tokens')
      .select('*')
      .limit(1);

    const { data: prices, error: pricesError } = await supabase
      .from('prices')
      .select('*')
      .limit(1);

    const { data: mentions, error: mentionsError } = await supabase
      .from('mentions')
      .select('*')
      .limit(1);

    return NextResponse.json({
      success: true,
      connection: 'OK',
      tables: {
        tokens: {
          exists: !tokensError,
          count: testData,
          sample: tokens?.[0] || null,
          error: tokensError?.message || null
        },
        prices: {
          exists: !pricesError,
          sample: prices?.[0] || null,
          error: pricesError?.message || null
        },
        mentions: {
          exists: !mentionsError,
          sample: mentions?.[0] || null,
          error: mentionsError?.message || null
        }
      },
      env: {
        SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Missing',
        SUPABASE_ANON_SECRET: process.env.SUPABASE_ANON_SECRET ? 'Set' : 'Missing'
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
