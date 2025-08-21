import { NextResponse } from 'next/server';
import { pipeline } from '@/lib/aids/pipeline';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Run the pipeline
    const result = await pipeline.run(body);
    
    return NextResponse.json({
      success: result.success,
      summary: {
        decisionsGenerated: result.decisions?.length || 0,
        metricsProcessed: result.metrics?.campaigns || 0,
        logs: result.logs?.slice(-10) // Last 10 logs
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Pipeline run error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}