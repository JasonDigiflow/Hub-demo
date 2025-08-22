import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

// Route de test direct pour récupérer les leads avec le Page Token
export async function GET(request) {
  try {
    // Hardcoded values from your test
    const PAGE_ID = '711569915366519';
    const FORM_ID = '1227304415302753'; // Forms 1-copy-copy avec 106 leads
    
    // Page Access Token from your test (has MANAGE_LEADS permission)
    const PAGE_TOKEN = 'EAAcV9ZAoq4jsBPC3B9IaUBm2gMKK0ckO8BJ6coJ4Sa5uZCoegZADkqZCwhIgJ8pYe6yyDAl4ZAOIT0Vyh5cwBunwCDBMXf71sd81PlZCPZCbJoDBkKAlkrBpOqZAceMwD7Vor6mNYhuYq4pISETOf1SRKseBA98ZAgBwCAIvZBfVbZBAdurCZBDzsfwNMA3tw1NH5wWB6W2uOsgIRG5x8tFfMECC2O3E';
    
    console.log('=== DIRECT LEADS TEST ===');
    console.log('Page ID:', PAGE_ID);
    console.log('Form ID:', FORM_ID);
    console.log('Using hardcoded Page Token with MANAGE_LEADS permission');
    
    // Get leads directly from the form
    const leadsUrl = `https://graph.facebook.com/v18.0/${FORM_ID}/leads?` +
      `fields=id,created_time,field_data&` +
      `limit=200&` +
      `access_token=${PAGE_TOKEN}`;
    
    console.log('Fetching leads from:', leadsUrl.replace(PAGE_TOKEN, 'PAGE_TOKEN'));
    
    const response = await fetch(leadsUrl);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error('Facebook API Error:', data.error);
      return NextResponse.json({
        success: false,
        error: data.error,
        message: 'Erreur lors de la récupération des leads. Vérifiez les logs.',
        debugInfo: {
          pageId: PAGE_ID,
          formId: FORM_ID,
          errorCode: data.error.code,
          errorMessage: data.error.message
        }
      });
    }
    
    if (data.data && data.data.length > 0) {
      console.log(`\n=== SUCCESS! Got ${data.data.length} leads ===`);
      
      // Process leads
      const processedLeads = data.data.map((lead, index) => {
        const fieldData = {};
        if (lead.field_data) {
          lead.field_data.forEach(field => {
            fieldData[field.name] = field.values?.[0] || '';
          });
        }
        
        // Log first 3 leads for debugging
        if (index < 3) {
          console.log(`\nLead ${index + 1}:`);
          console.log('ID:', lead.id);
          console.log('Created:', lead.created_time);
          console.log('Fields:', Object.keys(fieldData));
          console.log('Field values:', fieldData);
        }
        
        // Extract name with all possible variations
        const firstName = 
          fieldData['first_name'] || 
          fieldData['FIRST_NAME'] || 
          fieldData['First Name'] || 
          fieldData['prénom'] || 
          fieldData['Prénom'] || '';
          
        const lastName = 
          fieldData['last_name'] || 
          fieldData['LAST_NAME'] || 
          fieldData['Last Name'] || 
          fieldData['nom'] || 
          fieldData['Nom'] || '';
        
        const fullName = firstName || lastName ? 
          `${firstName} ${lastName}`.trim() : 
          fieldData['full_name'] || 
          fieldData['FULL_NAME'] || 
          'Prospect sans nom';
        
        const email = 
          fieldData['email'] || 
          fieldData['EMAIL'] || 
          fieldData['work_email'] || 
          fieldData['WORK_EMAIL'] || '';
        
        const phone = 
          fieldData['phone'] || 
          fieldData['PHONE'] || 
          fieldData['phone_number'] || 
          fieldData['PHONE_NUMBER'] || 
          fieldData['work_phone'] || 
          fieldData['WORK_PHONE'] || '';
        
        const company = 
          fieldData['company_name'] || 
          fieldData['COMPANY_NAME'] || 
          fieldData['company'] || 
          fieldData['COMPANY'] || '';
        
        return {
          id: `LEAD_${lead.id}`,
          name: fullName,
          email: email,
          phone: phone,
          company: company,
          source: 'Facebook',
          formId: FORM_ID,
          formName: 'Forms 1-copy-copy',
          pageId: PAGE_ID,
          pageName: 'Digiflow',
          date: lead.created_time,
          status: 'new',
          rawData: fieldData
        };
      });
      
      // Save to Firebase if authenticated
      let savedCount = 0;
      let skippedCount = 0;
      
      try {
        const cookieStore = cookies();
        const authCookie = cookieStore.get('auth-token');
        if (authCookie) {
          const decoded = jwt.verify(authCookie.value, process.env.JWT_SECRET);
          const userId = decoded.uid;
          
          // Get existing Meta IDs to avoid duplicates
          const prospectsRef = db.collection('aids_prospects');
          const existingSnapshot = await prospectsRef
            .where('userId', '==', userId)
            .where('syncedFromMeta', '==', true)
            .get();
          
          const existingMetaIds = new Set();
          existingSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.metaId) {
              existingMetaIds.add(data.metaId);
            }
          });
          
          // Save new leads to Firebase
          const batch = db.batch();
          
          for (const lead of processedLeads) {
            // Skip if already exists
            if (existingMetaIds.has(lead.id)) {
              skippedCount++;
              continue;
            }
            
            const prospectData = {
              ...lead,
              userId,
              metaId: lead.id,
              syncedFromMeta: true,
              createdAt: lead.date || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              syncedAt: new Date().toISOString()
            };
            
            const docRef = prospectsRef.doc();
            batch.set(docRef, prospectData);
            savedCount++;
          }
          
          if (savedCount > 0) {
            await batch.commit();
            console.log(`✅ Saved ${savedCount} new prospects to Firebase`);
          }
          console.log(`⏩ Skipped ${skippedCount} existing prospects`);
        }
      } catch (firebaseError) {
        console.error('Error saving to Firebase:', firebaseError);
      }
      
      return NextResponse.json({
        success: true,
        leads: processedLeads,
        totalCount: processedLeads.length,
        savedToFirebase: savedCount,
        skipped: skippedCount,
        source: 'direct_page_token',
        message: `✅ ${savedCount} nouveaux prospects sauvegardés dans Firebase (${skippedCount} déjà existants)`,
        debugInfo: {
          pageId: PAGE_ID,
          formId: FORM_ID,
          formName: 'Forms 1-copy-copy',
          method: 'Page Access Token Direct'
        }
      });
    }
    
    // No leads found
    return NextResponse.json({
      success: false,
      leads: [],
      message: 'Aucun lead trouvé dans le formulaire',
      debugInfo: {
        pageId: PAGE_ID,
        formId: FORM_ID,
        responseData: data
      }
    });
    
  } catch (error) {
    console.error('Direct leads error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      message: 'Erreur serveur lors de la récupération des leads'
    }, { status: 500 });
  }
}