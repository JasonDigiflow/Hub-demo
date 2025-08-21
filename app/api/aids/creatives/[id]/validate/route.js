import { NextResponse } from 'next/server';
import { ValidationService } from '@/lib/aids/services/validation';
import { StorageService } from '@/lib/aids/services/storage';
import { ConfigService } from '@/lib/aids/services/config';

const config = new ConfigService();
const validation = new ValidationService(config);
const storage = new StorageService(config);

export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    // Get the creative from storage
    const creatives = await storage.getCreatives();
    const creative = creatives.find(c => c.id === id);
    
    if (!creative) {
      return NextResponse.json({ 
        error: 'Creative not found' 
      }, { status: 404 });
    }

    // Validate the creative
    const validationResult = await validation.validateCreative(
      { url: creative.url || creative.imageUrl },
      creative.metadata || {}
    );

    // Check Meta compliance
    const compliance = await validation.checkMetaCompliance({
      headline: creative.metadata?.headline || '',
      description: creative.metadata?.description || ''
    });

    // Update creative status if valid
    if (validationResult.isValid && compliance.compliant) {
      // In a real app, we'd update the database
      // For demo, we'll just return success
    }

    return NextResponse.json({
      success: true,
      validation: {
        ...validationResult,
        compliance,
        validatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error validating creative:', error);
    return NextResponse.json({ 
      error: 'Failed to validate creative' 
    }, { status: 500 });
  }
}