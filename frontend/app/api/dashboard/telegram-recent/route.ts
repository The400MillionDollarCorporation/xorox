import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // This is a placeholder endpoint - in a real app, you'd fetch from your database
    // For now, return mock data to prevent errors
    return NextResponse.json({
      messages: [
        { id: 1, text: "Sample message 1", timestamp: new Date().toISOString() },
        { id: 2, text: "Sample message 2", timestamp: new Date().toISOString() }
      ],
      channels: [
        { id: 1, name: "Channel 1", members: 1000 },
        { id: 2, name: "Channel 2", members: 2000 }
      ],
      keywords: ["memecoin", "pump", "trending", "viral", "moon"]
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to fetch Telegram data",
      messages: [],
      channels: [],
      keywords: []
    }, { status: 500 });
  }
}
