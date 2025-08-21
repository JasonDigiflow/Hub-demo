import { NextResponse } from 'next/server';

// In-memory storage for demo
let savedSettings = {
  meta: {
    accessToken: '',
    adAccountId: '',
    pixelId: '',
    isConfigured: false
  },
  llm: {
    provider: 'anthropic',
    apiKey: '',
    model: 'claude-3-opus-20240229',
    isConfigured: false
  },
  image: {
    provider: 'openai',
    apiKey: '',
    model: 'dall-e-3',
    quality: 'hd',
    isConfigured: false
  },
  storage: {
    provider: 's3',
    bucket: '',
    region: 'us-east-1',
    accessKey: '',
    secretKey: '',
    isConfigured: false
  },
  automation: {
    enabled: false,
    frequency: 'daily',
    timeOfDay: '09:00',
    autoValidation: true,
    autoLaunch: false,
    budgetLimit: 1000
  }
};

export async function GET() {
  try {
    // Check environment variables for API keys
    const envSettings = {
      ...savedSettings,
      meta: {
        ...savedSettings.meta,
        accessToken: process.env.META_ACCESS_TOKEN || savedSettings.meta.accessToken,
        adAccountId: process.env.META_AD_ACCOUNT_ID || savedSettings.meta.adAccountId,
        isConfigured: !!(process.env.META_ACCESS_TOKEN || savedSettings.meta.accessToken)
      },
      llm: {
        ...savedSettings.llm,
        apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || savedSettings.llm.apiKey,
        isConfigured: !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || savedSettings.llm.apiKey)
      },
      image: {
        ...savedSettings.image,
        apiKey: process.env.OPENAI_API_KEY || savedSettings.image.apiKey,
        isConfigured: !!(process.env.OPENAI_API_KEY || savedSettings.image.apiKey)
      }
    };

    // Mask sensitive data for response
    const maskedSettings = {
      ...envSettings,
      meta: {
        ...envSettings.meta,
        accessToken: maskToken(envSettings.meta.accessToken)
      },
      llm: {
        ...envSettings.llm,
        apiKey: maskToken(envSettings.llm.apiKey)
      },
      image: {
        ...envSettings.image,
        apiKey: maskToken(envSettings.image.apiKey)
      },
      storage: {
        ...envSettings.storage,
        secretKey: maskToken(envSettings.storage.secretKey)
      }
    };

    return NextResponse.json({ settings: maskedSettings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch settings' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Update saved settings
    savedSettings = {
      ...savedSettings,
      ...body,
      meta: {
        ...body.meta,
        isConfigured: !!body.meta.accessToken
      },
      llm: {
        ...body.llm,
        isConfigured: !!body.llm.apiKey
      },
      image: {
        ...body.image,
        isConfigured: !!body.image.apiKey
      },
      storage: {
        ...body.storage,
        isConfigured: !!body.storage.accessKey
      }
    };

    // In production, you would save to database or environment config
    
    return NextResponse.json({ 
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ 
      error: 'Failed to save settings' 
    }, { status: 500 });
  }
}

function maskToken(token) {
  if (!token) return '';
  if (token.length <= 8) return '****';
  return token.substring(0, 4) + '****' + token.substring(token.length - 4);
}