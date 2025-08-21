import { NextResponse } from 'next/server';

// In-memory storage for demo
let experiments = [
  {
    id: 'exp_1',
    name: 'Headline Test - Urgency vs Benefits',
    status: 'running',
    hypothesis: 'Urgency-based headlines will outperform benefit-focused ones',
    startDate: '2024-01-15',
    duration: 7,
    progress: 65,
    variants: [
      {
        name: 'Control - Benefits',
        metrics: { impressions: 45678, clicks: 1234, ctr: 2.7, conversions: 45, spend: 234 }
      },
      {
        name: 'Test - Urgency',
        metrics: { impressions: 44321, clicks: 1456, ctr: 3.3, conversions: 62, spend: 228 },
        isWinning: true
      }
    ],
    confidence: 87,
    estimatedCompletion: '2 days'
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      experiments,
      total: experiments.length,
      active: experiments.filter(e => e.status === 'running').length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Experiments API error:', error);
    return NextResponse.json(
      { error: 'Failed to load experiments' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const newExperiment = {
      id: `exp_${Date.now()}`,
      ...body,
      status: 'scheduled',
      progress: 0,
      createdAt: new Date().toISOString()
    };
    
    experiments.push(newExperiment);
    
    return NextResponse.json({
      success: true,
      experiment: newExperiment
    });
  } catch (error) {
    console.error('Create experiment error:', error);
    return NextResponse.json(
      { error: 'Failed to create experiment' },
      { status: 500 }
    );
  }
}