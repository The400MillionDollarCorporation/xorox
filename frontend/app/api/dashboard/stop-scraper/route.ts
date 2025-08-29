import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();

    if (!type || !['tiktok', 'telegram', 'pattern'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid scraper type' },
        { status: 400 }
      );
    }

    // In a real implementation, this would communicate with the backend services
    // For now, we'll simulate the response
    let message = '';

    switch (type) {
      case 'tiktok':
        message = 'TikTok scraper stopped successfully';
        break;
      case 'telegram':
        message = 'Telegram scraper stopped successfully';
        break;
      case 'pattern':
        message = 'Pattern analysis stopped successfully';
        break;
    }

    console.log(`Stopping ${type} scraper`);

    // Here you would typically:
    // 1. Send a stop command to the backend service
    // 2. Update the database with stopped status
    // 3. Return the actual status

    return NextResponse.json({
      success: true,
      message,
      type,
      status: 'stopped',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error stopping scraper:', error);
    return NextResponse.json(
      { error: 'Failed to stop scraper' },
      { status: 500 }
    );
  }
}
