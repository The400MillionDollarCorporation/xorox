import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get last analysis timestamp
    const { data: lastAnalysis, error: lastAnalysisError } = await supabase
      .from('pattern_analysis_results')
      .select('timestamp')
      .order('timestamp', { ascending: false })
      .limit(1);

    // Get total correlations count
    const { count: totalCorrelations, error: correlationsError } = await supabase
      .from('pattern_correlations')
      .select('*', { count: 'exact', head: true });

    // Get total recommendations count
    const { count: totalRecommendations, error: recommendationsError } = await supabase
      .from('pattern_correlations')
      .select('*', { count: 'exact', head: true })
      .gte('correlation_score', 0.7); // High correlation threshold

    if (lastAnalysisError || correlationsError || recommendationsError) {
      console.error('Error fetching analysis summary:', { 
        lastAnalysisError, 
        correlationsError, 
        recommendationsError 
      });
      return NextResponse.json(
        { error: 'Failed to fetch analysis summary' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      lastAnalysis: lastAnalysis?.[0]?.timestamp || 'Never',
      totalCorrelations: totalCorrelations || 0,
      totalRecommendations: totalRecommendations || 0
    });

  } catch (error) {
    console.error('Error fetching analysis summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis summary' },
      { status: 500 }
      );
  }
}
