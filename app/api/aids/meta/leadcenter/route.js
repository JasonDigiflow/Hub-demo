import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie || !selectedAccountCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated or no account selected'
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accountId = selectedAccountCookie.value;
    
    console.log('=== FETCHING LEADS FROM LEAD CENTER ===');
    console.log('Account ID:', accountId);
    
    const allLeads = [];
    
    // Method 1: Get all lead forms for the ad account
    const leadFormsUrl = `https://graph.facebook.com/v18.0/${accountId}/leadgen_forms?` +
      `fields=id,name,status,created_time,leads_count,page{id,name,access_token}&` +
      `limit=100&` +
      `access_token=${session.accessToken}`;
    
    console.log('Fetching lead forms...');
    const formsResponse = await fetch(leadFormsUrl);
    const formsData = await formsResponse.json();
    
    if (formsData.error) {
      console.error('Error fetching forms:', formsData.error);
    }
    
    console.log(`Found ${formsData.data?.length || 0} lead forms`);
    
    // For each form, get ALL leads
    if (formsData.data && formsData.data.length > 0) {
      for (const form of formsData.data) {
        console.log(`\nProcessing form: ${form.name} (${form.leads_count} leads)`);
        
        // Use page token if available
        const accessToken = form.page?.access_token || session.accessToken;
        
        // Get ALL leads from this form
        let nextUrl = `https://graph.facebook.com/v18.0/${form.id}/leads?` +
          `fields=id,created_time,field_data,form_id,campaign_name,campaign_id,ad_id,ad_name,adset_id,adset_name&` +
          `limit=200&` + // Maximum limit
          `access_token=${accessToken}`;
        
        let formLeads = [];
        let pageCount = 0;
        
        // Paginate through ALL leads
        while (nextUrl && pageCount < 10) { // Limit to 10 pages for safety
          pageCount++;
          console.log(`Fetching page ${pageCount} of leads for form ${form.name}...`);
          
          const leadsResponse = await fetch(nextUrl);
          const leadsData = await leadsResponse.json();
          
          if (leadsData.error) {
            console.error(`Error fetching leads for form ${form.name}:`, leadsData.error);
            break;
          }
          
          if (leadsData.data && leadsData.data.length > 0) {
            console.log(`Got ${leadsData.data.length} leads from page ${pageCount}`);
            
            // Process each lead
            for (const lead of leadsData.data) {
              const fieldData = {};
              if (lead.field_data) {
                lead.field_data.forEach(field => {
                  fieldData[field.name] = field.values?.[0] || '';
                });
              }
              
              // Extract name - try multiple field variations
              const fullName = fieldData['full_name'] || 
                             fieldData['FULL_NAME'] || 
                             fieldData['name'] || 
                             fieldData['NAME'] || '';
              
              const firstName = fieldData['first_name'] || 
                              fieldData['FIRST_NAME'] || 
                              fieldData['prenom'] || 
                              fieldData['prénom'] || '';
              
              const lastName = fieldData['last_name'] || 
                             fieldData['LAST_NAME'] || 
                             fieldData['nom'] || '';
              
              const finalName = fullName || 
                              (firstName || lastName ? `${firstName} ${lastName}`.trim() : '') ||
                              fieldData['email']?.split('@')[0] ||
                              `Lead ${lead.id}`;
              
              const email = fieldData['email'] || 
                          fieldData['EMAIL'] || 
                          fieldData['work_email'] || 
                          fieldData['e-mail'] || '';
              
              const phone = fieldData['phone_number'] || 
                          fieldData['PHONE'] || 
                          fieldData['phone'] || 
                          fieldData['mobile'] || 
                          fieldData['tel'] || '';
              
              const company = fieldData['company_name'] || 
                            fieldData['COMPANY'] || 
                            fieldData['company'] || 
                            fieldData['entreprise'] || '';
              
              formLeads.push({
                id: `LEAD_${lead.id}`,
                metaId: lead.id,
                name: finalName,
                email: email,
                phone: phone,
                company: company,
                source: 'Meta Lead Center',
                formId: form.id,
                formName: form.name,
                pageId: form.page?.id,
                pageName: form.page?.name,
                campaignId: lead.campaign_id || '',
                campaignName: lead.campaign_name || '',
                adId: lead.ad_id || '',
                adName: lead.ad_name || '',
                adsetId: lead.adset_id || '',
                adsetName: lead.adset_name || '',
                createdTime: lead.created_time,
                date: lead.created_time,
                status: 'new',
                rawFieldData: fieldData
              });
            }
            
            // Check for next page
            nextUrl = leadsData.paging?.next || null;
          } else {
            break;
          }
        }
        
        console.log(`Total leads from form ${form.name}: ${formLeads.length}`);
        allLeads.push(...formLeads);
      }
    }
    
    // Method 2: Also try getting leads from pages directly
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${session.accessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();
    
    if (pagesData.data) {
      for (const page of pagesData.data) {
        const pageToken = page.access_token || session.accessToken;
        
        // Get page's lead forms
        const pageFormsUrl = `https://graph.facebook.com/v18.0/${page.id}/leadgen_forms?` +
          `fields=id,name,leads_count&` +
          `limit=100&` +
          `access_token=${pageToken}`;
        
        const pageFormsResponse = await fetch(pageFormsUrl);
        const pageFormsData = await pageFormsResponse.json();
        
        if (pageFormsData.data) {
          for (const form of pageFormsData.data) {
            if (form.leads_count > 0) {
              // Check if we already processed this form
              const alreadyProcessed = allLeads.some(l => l.formId === form.id);
              if (alreadyProcessed) continue;
              
              console.log(`\nProcessing page form: ${form.name} from ${page.name}`);
              
              // Get leads from this form
              const formLeadsUrl = `https://graph.facebook.com/v18.0/${form.id}/leads?` +
                `fields=id,created_time,field_data&` +
                `limit=200&` +
                `access_token=${pageToken}`;
              
              const formLeadsResponse = await fetch(formLeadsUrl);
              const formLeadsData = await formLeadsResponse.json();
              
              if (formLeadsData.data) {
                console.log(`Got ${formLeadsData.data.length} leads from page form`);
                
                for (const lead of formLeadsData.data) {
                  // Check if lead already exists
                  if (allLeads.some(l => l.metaId === lead.id)) continue;
                  
                  const fieldData = {};
                  if (lead.field_data) {
                    lead.field_data.forEach(field => {
                      fieldData[field.name] = field.values?.[0] || '';
                    });
                  }
                  
                  const fullName = fieldData['full_name'] || 
                                 fieldData['name'] || 
                                 `Lead ${lead.id}`;
                  
                  allLeads.push({
                    id: `LEAD_${lead.id}`,
                    metaId: lead.id,
                    name: fullName,
                    email: fieldData['email'] || '',
                    phone: fieldData['phone_number'] || fieldData['phone'] || '',
                    company: fieldData['company_name'] || '',
                    source: 'Meta Lead Center (Page)',
                    formId: form.id,
                    formName: form.name,
                    pageId: page.id,
                    pageName: page.name,
                    createdTime: lead.created_time,
                    date: lead.created_time,
                    status: 'new',
                    rawFieldData: fieldData
                  });
                }
              }
            }
          }
        }
      }
    }
    
    console.log(`\n=== TOTAL LEADS FOUND: ${allLeads.length} ===`);
    
    // Save to Firebase if authenticated
    let savedCount = 0;
    let skippedCount = 0;
    
    try {
      const authCookie = cookieStore.get('auth-token');
      if (authCookie && allLeads.length > 0) {
        const decoded = jwt.verify(authCookie.value, process.env.JWT_SECRET);
        const userId = decoded.uid;
        
        // Get user's organization and ad account
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        // Create user doc if it doesn't exist
        if (!userDoc.exists) {
          console.log('Creating user document...');
          await db.collection('users').doc(userId).set({
            email: decoded.email || `user${userId}@example.com`,
            orgIds: [],
            primaryOrgId: null,
            createdAt: new Date().toISOString()
          });
        }
        
        let orgId = userData?.primaryOrgId;
        let adAccountId;
        
        // Create organization if needed
        if (!orgId) {
          console.log('Creating organization for user...');
          orgId = `org_${userId}_${Date.now()}`;
          const orgName = userData?.email?.split('@')[0] || 'Mon Organisation';
          
          await db.collection('organizations').doc(orgId).set({
            name: orgName,
            slug: orgName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            owner: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          
          // Add user as admin
          await db.collection('organizations').doc(orgId)
            .collection('members').doc(userId).set({
              uid: userId,
              role: 'admin',
              invitedBy: userId,
              createdAt: new Date().toISOString()
            });
          
          // Update user doc
          await db.collection('users').doc(userId).update({
            orgIds: [orgId],
            primaryOrgId: orgId
          });
        }
        
        // Get or create Meta ad account
        const adAccountsSnapshot = await db
          .collection('organizations').doc(orgId)
          .collection('adAccounts')
          .where('platform', '==', 'meta')
          .limit(1)
          .get();
        
        if (adAccountsSnapshot.empty) {
          console.log('Creating Meta ad account...');
          adAccountId = `adacc_meta_${Date.now()}`;
          await db.collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountId).set({
              platform: 'meta',
              externalId: accountId,
              name: 'Compte Meta',
              currency: 'EUR',
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
        } else {
          adAccountId = adAccountsSnapshot.docs[0].id;
        }
        
        console.log(`Saving to org: ${orgId}, adAccount: ${adAccountId}`);
        
        // Get existing leads in new structure
        const prospectsRef = db
          .collection('organizations').doc(orgId)
          .collection('adAccounts').doc(adAccountId)
          .collection('prospects');
        
        const existingSnapshot = await prospectsRef
          .where('syncedFromMeta', '==', true)
          .get();
        
        const existingMetaIds = new Set();
        existingSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.metaId) {
            existingMetaIds.add(data.metaId);
          }
        });
        
        // Save new leads
        const batch = db.batch();
        
        for (const lead of allLeads) {
          if (!existingMetaIds.has(lead.metaId)) {
            const prospectData = {
              ...lead,
              syncedFromMeta: true,
              createdAt: lead.date || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              syncedAt: new Date().toISOString()
            };
            
            const docRef = prospectsRef.doc();
            batch.set(docRef, prospectData);
            savedCount++;
          } else {
            skippedCount++;
          }
        }
        
        if (savedCount > 0) {
          await batch.commit();
          console.log(`✅ Saved ${savedCount} new prospects to Firebase (org: ${orgId})`);
        }
      }
    } catch (error) {
      console.error('Error saving to Firebase:', error);
    }
    
    return NextResponse.json({
      success: true,
      leads: allLeads,
      totalCount: allLeads.length,
      savedToFirebase: savedCount,
      skipped: skippedCount,
      source: 'lead_center',
      message: allLeads.length > 0 
        ? `✅ ${allLeads.length} prospects trouvés dans le Lead Center`
        : '⚠️ Aucun prospect trouvé dans le Lead Center'
    });
    
  } catch (error) {
    console.error('Lead Center API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch leads from Lead Center',
      details: error.message
    }, { status: 500 });
  }
}