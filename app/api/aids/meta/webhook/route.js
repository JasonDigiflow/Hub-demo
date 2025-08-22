import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import crypto from 'crypto';

// Verify webhook signature from Meta
function verifyWebhookSignature(payload, signature, appSecret) {
  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}

// Handle webhook verification (GET request from Meta)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Meta sends these parameters for verification
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');
    
    // Verify token matches (you should set this in Meta App dashboard)
    const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'digiflow_webhook_2024';
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully');
      // Return the challenge to complete verification
      return new Response(challenge, { status: 200 });
    } else {
      console.error('❌ Webhook verification failed');
      return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
    }
  } catch (error) {
    console.error('Webhook verification error:', error);
    return NextResponse.json({ error: 'Verification error' }, { status: 500 });
  }
}

// Handle webhook events (POST request from Meta)
export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    
    // Verify signature if app secret is configured
    const APP_SECRET = process.env.META_APP_SECRET;
    if (APP_SECRET && signature) {
      const isValid = verifyWebhookSignature(body, signature, APP_SECRET);
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }
    
    const data = JSON.parse(body);
    console.log('📨 Webhook received:', JSON.stringify(data, null, 2));
    
    // Process each entry
    if (data.entry) {
      for (const entry of data.entry) {
        // Check for leadgen field (new lead form submission)
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'leadgen') {
              await processNewLead(change.value);
            }
          }
        }
      }
    }
    
    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Meta from retrying
    return NextResponse.json({ success: true }, { status: 200 });
  }
}

// Process a new lead from webhook
async function processNewLead(leadData) {
  try {
    console.log('🆕 Processing new lead:', leadData);
    
    const { leadgen_id, page_id, form_id, created_time } = leadData;
    
    // Get the lead details from Meta API
    // Note: You'll need a page access token for this
    const PAGE_TOKEN = process.env.META_PAGE_ACCESS_TOKEN || 'YOUR_PAGE_TOKEN';
    
    const leadUrl = `https://graph.facebook.com/v18.0/${leadgen_id}?access_token=${PAGE_TOKEN}`;
    const response = await fetch(leadUrl);
    const lead = await response.json();
    
    if (lead.error) {
      console.error('Error fetching lead details:', lead.error);
      return;
    }
    
    // Process field data
    const fieldData = {};
    if (lead.field_data) {
      lead.field_data.forEach(field => {
        fieldData[field.name] = field.values?.[0] || '';
      });
    }
    
    // Extract prospect information
    const firstName = fieldData['FIRST_NAME'] || fieldData['first_name'] || '';
    const lastName = fieldData['LAST_NAME'] || fieldData['last_name'] || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Nouveau prospect';
    
    const prospectData = {
      metaId: `LEAD_${leadgen_id}`,
      name: fullName,
      email: fieldData['EMAIL'] || fieldData['email'] || '',
      phone: fieldData['PHONE'] || fieldData['phone'] || '',
      company: fieldData['COMPANY_NAME'] || fieldData['company_name'] || '',
      source: 'Facebook Webhook',
      formId: form_id,
      pageId: page_id,
      syncedFromMeta: true,
      createdAt: created_time || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: new Date().toISOString(),
      status: 'new',
      rawData: fieldData,
      webhookReceived: true
    };
    
    // Find all users who have this page connected
    // For now, we'll save to all users who have Meta connected
    // In production, you'd want to map page_id to specific users
    
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.get();
    
    let savedCount = 0;
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Check if user has Meta connected (you might want to check for specific page access)
      if (userData.metaConnected || userData.aids?.metaConnected) {
        // Check if prospect already exists for this user
        const existingProspect = await db.collection('aids_prospects')
          .where('userId', '==', userDoc.id)
          .where('metaId', '==', prospectData.metaId)
          .get();
        
        if (existingProspect.empty) {
          // Save new prospect
          await db.collection('aids_prospects').add({
            ...prospectData,
            userId: userDoc.id
          });
          savedCount++;
          console.log(`✅ Saved new prospect for user ${userDoc.id}`);
        }
      }
    }
    
    console.log(`📊 Lead saved for ${savedCount} users`);
    
    // Optional: Send notification to users about new lead
    // You could implement email notifications, push notifications, etc.
    
  } catch (error) {
    console.error('Error processing new lead:', error);
  }
}