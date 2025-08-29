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
    let command = '';

    switch (type) {
      case 'tiktok':
        message = 'TikTok scraper started successfully';
        command = 'npm run auto';
        break;
      case 'telegram':
        message = 'Telegram scraper started successfully';
        command = 'npm start';
        break;
      case 'pattern':
        message = 'Pattern analysis started successfully';
        command = 'npm run analyze';
        break;
    }

    console.log(`Starting ${type} scraper with command: ${command}`);

    // Here you would typically:
    // 1. Send a command to the backend service
    // 2. Update the database with running status
    // 3. Return the actual status

    return NextResponse.json({
      success: true,
      message,
      type,
      status: 'running',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error starting scraper:', error);
    return NextResponse.json(
      { error: 'Failed to start scraper' },
      { status: 500 }
    );
  }
}
