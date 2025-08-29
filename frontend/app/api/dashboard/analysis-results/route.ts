import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const platform = searchParams.get('platform');

    let query = supabase
      .from('pattern_analysis_results')
      .select(`
        *,
        pattern_correlations (
          keyword,
          token_name,
          token_symbol,
          correlation_score,
          risk_level,
          recommendation_text
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (platform && platform !== 'all') {
      query = query.eq('platform', platform);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching analysis results:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analysis results' },
        { status: 500 }
      );
    }

    // Transform the data to include recommendations
    const transformedData = data?.map(result => {
      const recommendations = result.pattern_correlations?.map(corr => ({
        token: corr.token_name || corr.token_symbol,
        keyword: corr.keyword,
        correlation: corr.correlation_score,
        risk: corr.risk_level,
        recommendation: corr.recommendation_text || `High correlation (${(corr.correlation_score * 100).toFixed(1)}%) with ${corr.keyword}`
      })) || [];

      return {
        ...result,
        recommendations: recommendations.sort((a, b) => b.correlation - a.correlation).slice(0, 5)
      };
    }) || [];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching analysis results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis results' },
      { status: 500 }
    );
  }
}
