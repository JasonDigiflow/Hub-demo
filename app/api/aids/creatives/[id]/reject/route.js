import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/aids/services/storage';
import { ConfigService } from '@/lib/aids/services/config';

const config = new ConfigService();
const storage = new StorageService(config);

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Get the creative from storage
    const creatives = await storage.getCreatives();
    const creative = creatives.find(c => c.id === id);
    
    if (!creative) {
      return NextResponse.json({ 
        error: 'Creative not found' 
      }, { status: 404 });
    }

    // In a real app, we'd update the database to mark as rejected
    // For demo, we'll just return success with rejection details

    return NextResponse.json({
      success: true,
      rejection: {
        creativeId: id,
        reason: body.reason || 'Does not meet quality standards',
        rejectedBy: 'Octavia AI',
        rejectedAt: new Date().toISOString(),
        recommendations: [
          'Improve text readability',
          'Align with brand guidelines',
          'Increase contrast between elements'
        ]
      }
    });
  } catch (error) {
    console.error('Error rejecting creative:', error);
    return NextResponse.json({ 
      error: 'Failed to reject creative' 
    }, { status: 500 });
  }
}