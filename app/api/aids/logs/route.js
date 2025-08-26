import { NextResponse } from 'next/server';
import logger from '@/lib/aids/logger';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const context = searchParams.get('context');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const logs = logger.getLogs(context, limit);
    const errors = logger.getRecentErrors(50);
    
    return NextResponse.json({
      success: true,
      logs,
      errors,
      totalLogs: logs.length,
      totalErrors: errors.length
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    logger.clear();
    return NextResponse.json({
      success: true,
      message: 'Logs effacés'
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}