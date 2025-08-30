import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // This is a placeholder endpoint - in a real app, you'd fetch from your database
    // For now, return mock data to prevent errors
    return NextResponse.json({
      lastAnalysis: new Date().toISOString(),
      totalCorrelations: 42,
      totalRecommendations: 15,
      analysisStatus: "active"
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to fetch analysis summary",
      lastAnalysis: "Never",
      totalCorrelations: 0,
      totalRecommendations: 0,
      analysisStatus: "error"
    }, { status: 500 });
  }
}
