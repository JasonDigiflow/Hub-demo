import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/aids/services/storage';
import { CreativeService } from '@/lib/aids/services/creative';
import { ValidationService } from '@/lib/aids/services/validation';
import { ConfigService } from '@/lib/aids/services/config';

const config = new ConfigService();
const storage = new StorageService(config);
const creative = new CreativeService(config);
const validation = new ValidationService(config);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = {
      status: searchParams.get('status'),
      campaignId: searchParams.get('campaignId')
    };

    const creatives = await storage.getCreatives(filter);

    // Generate demo creatives if none exist
    if (creatives.length === 0) {
      const demoCreatives = generateDemoCreatives();
      return NextResponse.json({ creatives: demoCreatives });
    }

    return NextResponse.json({ creatives });
  } catch (error) {
    console.error('Error fetching creatives:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch creatives',
      creatives: generateDemoCreatives()
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { context } = body;

    // Generate prompt based on context
    const prompt = await creative.generatePrompt(context);

    // Generate image
    const image = await creative.generateImage(prompt);

    // Validate the creative
    const validationResult = await validation.validateCreative(image, context);

    // Store the creative
    const storedUrl = await storage.uploadCreative(image, {
      ...context,
      status: validationResult.isValid ? 'validated' : 'generated',
      validationScore: validationResult.score,
      validationIssues: validationResult.issues
    });

    return NextResponse.json({
      success: true,
      creative: {
        url: storedUrl,
        prompt,
        validation: validationResult,
        status: validationResult.isValid ? 'validated' : 'generated',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating creative:', error);
    return NextResponse.json({ 
      error: 'Failed to create creative' 
    }, { status: 500 });
  }
}

function generateDemoCreatives() {
  const statuses = ['generated', 'validated', 'launched', 'rejected'];
  const campaigns = ['Summer Sale 2025', 'Black Friday', 'New Product Launch', 'Brand Awareness'];
  const formats = ['Feed', 'Story', 'Reel', 'Carousel'];
  
  return Array.from({ length: 12 }, (_, i) => ({
    id: `creative_demo_${i}`,
    name: `Creative ${i + 1}`,
    imageUrl: `https://picsum.photos/400/400?random=${Date.now() + i}`,
    status: statuses[i % statuses.length],
    campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
    format: formats[Math.floor(Math.random() * formats.length)],
    headline: `Special Offer ${i + 1}`,
    description: `Limited time offer - Save up to ${20 + i * 5}% today!`,
    cta: 'Shop Now',
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    performance: {
      impressions: Math.floor(Math.random() * 50000),
      clicks: Math.floor(Math.random() * 1500),
      ctr: (Math.random() * 5 + 1).toFixed(2),
      conversions: Math.floor(Math.random() * 100),
      spend: (Math.random() * 500).toFixed(2)
    },
    validation: {
      score: Math.random(),
      issues: i % 3 === 0 ? ['Low contrast', 'Text too small'] : [],
      validatedAt: statuses[i % statuses.length] === 'validated' 
        ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() 
        : null
    }
  }));
}