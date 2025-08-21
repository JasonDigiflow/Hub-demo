import { NextResponse } from 'next/server';
import { AdService } from '@/lib/aids/services/ads';
import { StorageService } from '@/lib/aids/services/storage';
import { ConfigService } from '@/lib/aids/services/config';

const config = new ConfigService();
const ads = new AdService(config);
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

    // Launch the creative as an ad
    const launchedAd = await ads.createAd({
      campaignId: body.campaignId || 'default_campaign',
      adSetId: body.adSetId || 'default_adset',
      creative: {
        imageUrl: creative.url || creative.imageUrl,
        headline: creative.metadata?.headline || 'New Offer',
        description: creative.metadata?.description || 'Limited time only',
        ctaButton: creative.metadata?.cta || 'Shop Now'
      }
    });

    return NextResponse.json({
      success: true,
      ad: launchedAd,
      launchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error launching creative:', error);
    return NextResponse.json({ 
      error: 'Failed to launch creative' 
    }, { status: 500 });
  }
}