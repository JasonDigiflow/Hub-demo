import { NextResponse } from 'next/server';
import { ConfigService } from '@/lib/aids/services/config';

export async function GET() {
  try {
    const config = new ConfigService();
    const status = config.getStatus();
    
    return NextResponse.json({
      ...status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Config status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get config status',
        mode: 'DEMO',
        isLive: false
      },
      { status: 500 }
    );
  }
}