import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';

export async function GET(request) {
  try {
    // Check if force parameter is set
    const { searchParams } = new URL(request.url);
    const forceSync = searchParams.get('force') === 'true';
    
    // Get session and selected account
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        leads: []
      }, { status: 401 });
    }
    
    if (!selectedAccountCookie) {
      return NextResponse.json({ 
        error: 'No account selected',
        leads: []
      }, { status: 400 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accountId = selectedAccountCookie.value;
    
    // UTILISER LE TOKEN VERCEL EN PRIORITÉ !
    const accessToken = process.env.META_ACCESS_TOKEN || accessToken;
    
    console.log('=== FETCHING LEADS FOR ACCOUNT ===');
    console.log('Account ID:', accountId);
    console.log('Force sync:', forceSync);
    console.log('Using Vercel token:', !!process.env.META_ACCESS_TOKEN);
    
    // Method 1: Try getting ads with leads directly - GET FULL FIELD DATA
    const adsWithLeadsUrl = `https://graph.facebook.com/v18.0/${accountId}/ads?` +
      `fields=id,name,adset{id,name},campaign{id,name},leads{id,created_time,field_data}&` +
      `limit=500&` +
      `access_token=${accessToken}`;
    
    console.log('Getting ads with leads...');
    const adsResponse = await fetch(adsWithLeadsUrl);
    const adsData = await adsResponse.json();
    
    console.log('=== ADS WITH LEADS ===');
    console.log('Total ads found:', adsData.data?.length || 0);
    
    let allLeadsFromAds = [];
    if (adsData.data) {
      for (const ad of adsData.data) {
        if (ad.leads && ad.leads.data && ad.leads.data.length > 0) {
          console.log(`Ad "${ad.name}" has ${ad.leads.data.length} leads`);
          
          // Process each lead properly
          for (const lead of ad.leads.data) {
            const fieldData = {};
            if (lead.field_data) {
              lead.field_data.forEach(field => {
                fieldData[field.name] = field.values?.[0] || '';
              });
            }
            
            // Extract name from various possible fields
            const fullName = fieldData['full_name'] || 
                           fieldData['FULL_NAME'] || 
                           fieldData['name'] || '';
            
            const firstName = fieldData['first_name'] || 
                            fieldData['FIRST_NAME'] || '';
            
            const lastName = fieldData['last_name'] || 
                           fieldData['LAST_NAME'] || '';
            
            const finalName = fullName || 
                            (firstName || lastName ? `${firstName} ${lastName}`.trim() : '') ||
                            'Prospect sans nom';
            
            const email = fieldData['email'] || 
                        fieldData['EMAIL'] || 
                        fieldData['work_email'] || '';
            
            const phone = fieldData['phone_number'] || 
                        fieldData['PHONE'] || 
                        fieldData['phone'] || '';
            
            const company = fieldData['company_name'] || 
                          fieldData['COMPANY_NAME'] || 
                          fieldData['company'] || '';
            
            allLeadsFromAds.push({
              id: `LEAD_${lead.id}`,
              name: finalName,
              email: email,
              phone: phone,
              company: company,
              source: 'Facebook Ads',
              ad_name: ad.name,
              ad_id: ad.id,
              campaign_name: ad.campaign?.name,
              campaign_id: ad.campaign?.id,
              adset_name: ad.adset?.name,
              adset_id: ad.adset?.id,
              date: lead.created_time,
              status: 'new',
              rawData: fieldData
            });
          }
        }
      }
    }
    
    console.log('Total leads from ads:', allLeadsFromAds.length);
    
    // Check if we have cached pages data (to reduce API calls)
    const cachedPages = session.cachedPages;
    let pagesData;
    
    if (cachedPages && Date.now() - (session.cacheTimestamp || 0) < 5 * 60 * 1000) {
      // Use cached data if less than 5 minutes old
      console.log('Using cached pages data to reduce API calls');
      pagesData = { data: cachedPages };
    } else {
      // Method 2: Try getting pages and their forms - USE PAGE ACCESS TOKEN
      const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?` +
        `access_token=${accessToken}`;
      
      console.log('Getting user pages...');
      const pagesResponse = await fetch(pagesUrl);
      pagesData = await pagesResponse.json();
      console.log('User pages found:', pagesData.data?.length || 0);
    }
    
    let allLeadsFromPages = [];
    if (pagesData.data) {
      for (const page of pagesData.data) {
        console.log(`\n=== CHECKING PAGE: ${page.name} (${page.id}) ===`);
        console.log('Page has access_token:', !!page.access_token);
        console.log('Page tasks:', page.tasks);
        
        // IMPORTANT: Use PAGE access token which has MANAGE_LEADS permission
        const pageToken = page.access_token || accessToken;
        
        // Get lead forms for this page
        const pageFormsUrl = `https://graph.facebook.com/v18.0/${page.id}/leadgen_forms?` +
          `fields=id,name,status,leads_count,created_time&` +
          `limit=100&` +
          `filtering=[{field:"time_created",operator:"GREATER_THAN",value:${Math.floor(Date.now()/1000) - 180*24*60*60}}]&` + // Récupérer les leads des 6 derniers mois
          `access_token=${pageToken}`;
        
        console.log('Getting forms with page token...');
        const pageFormsResponse = await fetch(pageFormsUrl);
        const pageFormsData = await pageFormsResponse.json();
        
        if (pageFormsData.error) {
          console.error('Error getting forms:', pageFormsData.error);
          continue;
        }
        
        if (pageFormsData.data && pageFormsData.data.length > 0) {
          console.log(`Page ${page.name} has ${pageFormsData.data.length} forms`);
          
          for (const form of pageFormsData.data) {
            if (form.leads_count > 0) {
              console.log(`\n=== FORM: "${form.name}" (${form.leads_count} leads) ===`);
              
              // Get leads from this form using PAGE TOKEN
              const formLeadsUrl = `https://graph.facebook.com/v18.0/${form.id}/leads?` +
                `fields=id,created_time,field_data&` +
                `limit=500&` + // Augmenté à 500 pour récupérer TOUS les leads
                `access_token=${pageToken}`; // USE PAGE TOKEN!
              
              console.log('Fetching leads with page access token...');
              const formLeadsResponse = await fetch(formLeadsUrl);
              const formLeadsData = await formLeadsResponse.json();
              
              if (formLeadsData.error) {
                console.error('Error getting leads:', formLeadsData.error);
                console.log('Trying with user token instead...');
                
                // Retry with user token if page token fails
                const retryUrl = formLeadsUrl.replace(pageToken, accessToken);
                const retryResponse = await fetch(retryUrl);
                const retryData = await retryResponse.json();
                
                if (retryData.data) {
                  console.log(`Success with user token! Got ${retryData.data.length} leads`);
                  allLeadsFromPages.push(...retryData.data.map(lead => ({
                    ...lead,
                    form_id: form.id,
                    form_name: form.name,
                    page_id: page.id,
                    page_name: page.name
                  })));
                }
              } else if (formLeadsData.data) {
                console.log(`Success! Got ${formLeadsData.data.length} leads from form`);
                
                // Log first lead as sample
                if (formLeadsData.data.length > 0) {
                  console.log('Sample lead field_data:', formLeadsData.data[0].field_data);
                }
                
                allLeadsFromPages.push(...formLeadsData.data.map(lead => ({
                  ...lead,
                  form_id: form.id,
                  form_name: form.name,
                  page_id: page.id,
                  page_name: page.name
                })));
              }
            }
          }
        }
      }
    }
    
    console.log('Total leads from pages:', allLeadsFromPages.length);
    
    // Method 3: Original method - Get lead forms from ad account
    const leadFormsUrl = `https://graph.facebook.com/v18.0/${accountId}/leadgen_forms?` +
      `fields=id,name,status,created_time,leads_count,page,questions&` +
      `limit=100&` +
      `access_token=${accessToken}`;
    
    console.log('Lead Forms URL:', leadFormsUrl.replace(accessToken, 'TOKEN'));
    
    const formsResponse = await fetch(leadFormsUrl);
    const formsData = await formsResponse.json();
    
    console.log('=== LEAD FORMS RESPONSE ===');
    console.log('Forms found:', formsData.data?.length || 0);
    if (formsData.data?.length > 0) {
      console.log('Form names:', formsData.data.map(f => f.name));
    }
    
    if (formsData.error) {
      console.error('Error fetching lead forms:', formsData.error);
      // Try alternative: get leads from ads
      return await getLeadsFromAds(accountId, accessToken);
    }
    
    // Prioritize real leads from ads (they have actual field data)
    let allLeads = [];
    
    // First priority: leads from ads (they have the actual prospect data)
    if (allLeadsFromAds.length > 0) {
      console.log(`\n=== USING LEADS FROM ADS ===`);
      console.log(`Got ${allLeadsFromAds.length} real leads from ads with full data`);
      allLeads = allLeadsFromAds;
    }
    // Second priority: leads from pages 
    else if (allLeadsFromPages.length > 0) {
      console.log(`\n=== USING LEADS FROM PAGES (WITH PAGE TOKEN) ===`);
      console.log(`Got ${allLeadsFromPages.length} leads with page access token`);
      allLeads = allLeadsFromPages;
    }
    
    console.log(`\n=== COMBINED LEADS ===`);
    console.log(`From ads: ${allLeadsFromAds.length}`);
    console.log(`From pages (with page token): ${allLeadsFromPages.length}`);
    console.log(`Total selected: ${allLeads.length}`);
    
    // For each form, get the leads (original method - only if no leads yet)
    if (allLeads.length === 0 && formsData.data && formsData.data.length > 0) {
      for (const form of formsData.data) {
        const leadsUrl = `https://graph.facebook.com/v18.0/${form.id}/leads?` +
          `fields=id,created_time,field_data,campaign_name,campaign_id,ad_id,ad_name,adset_id,adset_name,form_id,is_organic,platform&` +
          `limit=100&` +
          `access_token=${accessToken}`;
        
        console.log(`\n=== FETCHING LEADS FOR FORM: ${form.name} ===`);
        console.log('Leads URL:', leadsUrl.replace(accessToken, 'TOKEN'));
        
        const leadsResponse = await fetch(leadsUrl);
        const leadsData = await leadsResponse.json();
        
        console.log(`Leads found in form ${form.name}:`, leadsData.data?.length || 0);
        
        if (leadsData.data && leadsData.data.length > 0) {
          console.log('\n=== SAMPLE LEAD DATA (First Lead) ===');
          const sampleLead = leadsData.data[0];
          console.log('Lead ID:', sampleLead.id);
          console.log('Created Time:', sampleLead.created_time);
          console.log('Campaign:', sampleLead.campaign_name);
          console.log('Ad:', sampleLead.ad_name);
          
          if (sampleLead.field_data) {
            console.log('\n=== FIELD DATA ===');
            sampleLead.field_data.forEach(field => {
              console.log(`Field "${field.name}":`, field.values?.[0] || 'empty');
            });
          }
          
          // Process each lead
          const processedLeads = leadsData.data.map((lead, index) => {
            const fieldData = {};
            if (lead.field_data) {
              lead.field_data.forEach(field => {
                fieldData[field.name] = field.values?.[0] || '';
              });
            }
            
            if (index === 0) {
              console.log('\n=== PROCESSED FIELD DATA (First Lead) ===');
              console.log('All fields:', Object.keys(fieldData));
              console.log('Field values:', fieldData);
            }
            
            // Try many possible field names - prioritize FIRST_NAME
            const firstName = fieldData['FIRST_NAME'] || fieldData['first_name'] || fieldData.first_name || 
                            fieldData['First Name'] || fieldData['First name'] || fieldData.prenom || '';
            const lastName = fieldData['LAST_NAME'] || fieldData['last_name'] || fieldData.last_name || 
                           fieldData['Last Name'] || fieldData['Last name'] || fieldData.nom || '';
            
            const possibleName = firstName || lastName ? 
              `${firstName} ${lastName}`.trim() :
              fieldData.full_name || 
              fieldData['full_name'] ||
              fieldData.name || 
              fieldData['nom_complet'] ||
              fieldData['nom_prenom'] ||
              Object.keys(fieldData).find(key => key.toLowerCase().includes('name') || key.toLowerCase().includes('nom')) ?
                fieldData[Object.keys(fieldData).find(key => key.toLowerCase().includes('name') || key.toLowerCase().includes('nom'))] : null ||
              fieldData.email?.split('@')[0] || 
              'Prospect sans nom';
            
            if (index === 0) {
              console.log('\n=== NAME EXTRACTION (First Lead) ===');
              console.log('Extracted name:', possibleName);
            }
            
            // Extract email with multiple field name variations
            const email = fieldData.EMAIL || fieldData.email || fieldData['E-MAIL'] || fieldData['e_mail'] || 
                         fieldData['work_email'] || fieldData['WORK_EMAIL'] || fieldData['Work Email'] || '';
            
            // Extract phone with multiple field name variations  
            const phone = fieldData.PHONE || fieldData.phone || fieldData['phone_number'] || fieldData['PHONE_NUMBER'] ||
                         fieldData['work_phone'] || fieldData['WORK_PHONE'] || fieldData['Work Phone'] ||
                         fieldData.mobile_number || fieldData.telephone || fieldData.tel || '';
            
            // Extract company with multiple field name variations
            const company = fieldData['COMPANY_NAME'] || fieldData['company_name'] || fieldData.company || 
                          fieldData['Company Name'] || fieldData['Company name'] || fieldData.entreprise || 
                          fieldData.societe || '';
            
            return {
              id: `LEAD_${lead.id}`,
              name: possibleName,
              email: email,
              phone: phone,
              company: company,
              source: lead.platform || 'Facebook',
              campaignId: lead.campaign_id || '',
              campaignName: lead.campaign_name || '',
              adId: lead.ad_id || '',
              adName: lead.ad_name || '',
              formId: form.id,
              formName: form.name,
              date: lead.created_time,
              status: 'new',
              notes: `Lead form: ${form.name}`,
              rawData: fieldData
            };
          });
          
          allLeads.push(...processedLeads);
        }
      }
    }
    
    // If no leads from forms, try to get from ads/campaigns
    if (allLeads.length === 0) {
      console.log('WARNING: No real leads found, falling back to aggregated data from ads');
      return await getLeadsFromAds(accountId, accessToken);
    }
    
    console.log('\n=== FINAL RESULTS ===');
    console.log(`Total leads found: ${allLeads.length}`);
    if (allLeads.length > 0) {
      console.log('First 3 leads:');
      allLeads.slice(0, 3).forEach(lead => {
        console.log(`- ${lead.id}: ${lead.name} (${lead.source})`);
      });
    }
    
    // Save leads to Firebase if authenticated
    let savedCount = 0;
    let skippedCount = 0;
    
    try {
      const authCookie = cookieStore.get('auth-token');
      console.log('Auth cookie present:', !!authCookie);
      
      if (authCookie) {
        const decoded = jwt.verify(authCookie.value, process.env.JWT_SECRET);
        const userId = decoded.uid;
        console.log('User ID for saving:', userId);
        
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
        console.log(`Preparing to save ${allLeads.length} leads to Firebase`);
        
        for (const lead of allLeads) {
          const prospectData = {
            ...lead,
            userId,
            metaId: lead.id,
            syncedFromMeta: true,
            createdAt: lead.date || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncedAt: new Date().toISOString()
          };
          
          // If force sync or doesn't exist, save it
          if (forceSync || !existingMetaIds.has(lead.id)) {
            const docRef = prospectsRef.doc();
            console.log(`Adding to batch: ${lead.name} (${lead.id})`);
            batch.set(docRef, prospectData);
            savedCount++;
          } else {
            skippedCount++;
          }
        }
        
        if (savedCount > 0) {
          await batch.commit();
          console.log(`✅ Saved ${savedCount} ${forceSync ? 'forced' : 'new'} prospects to Firebase`);
        }
        if (skippedCount > 0) {
          console.log(`⏩ Skipped ${skippedCount} existing prospects`);
        }
      }
    } catch (firebaseError) {
      console.error('Error saving to Firebase:', firebaseError);
      // Continue even if Firebase save fails
    }
    
    // Filtrer les données agrégées avant de retourner
    const realLeads = allLeads.filter(lead => 
      !lead.isAggregated && 
      !lead.name?.includes('[Données agrégées') &&
      !lead.name?.includes('[Données campagne')
    );
    
    return NextResponse.json({
      success: true,
      leads: realLeads,
      totalCount: realLeads.length,
      savedToFirebase: savedCount,
      skipped: skippedCount,
      source: 'lead_forms',
      forceSync: forceSync,
      message: forceSync 
        ? `✅ Force sync: ${savedCount} prospects importés, ${skippedCount} ignorés`
        : savedCount > 0 
          ? `✅ ${savedCount} nouveaux prospects sauvegardés dans Firebase`
          : `ℹ️ Tous les prospects sont déjà importés (${skippedCount} existants)`
    });
    
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch leads',
      details: error.message,
      leads: []
    }, { status: 500 });
  }
}

// Alternative method: Get conversion/lead data from ads
async function getLeadsFromAds(accountId, accessToken) {
  try {
    // Get ads with conversions
    const adsUrl = `https://graph.facebook.com/v18.0/${accountId}/ads?` +
      `fields=id,name,campaign{id,name},adset{id,name},insights{actions,conversions,clicks,impressions}&` +
      `limit=100&` +
      `access_token=${accessToken}`;
    
    const adsResponse = await fetch(adsUrl);
    const adsData = await adsResponse.json();
    
    const prospects = [];
    
    if (adsData.data) {
      // Process ads that have conversions or actions
      adsData.data.forEach(ad => {
        if (ad.insights && ad.insights.data && ad.insights.data[0]) {
          const insight = ad.insights.data[0];
          
          // Check for lead-related actions
          const leadActions = insight.actions?.filter(action => 
            action.action_type.includes('lead') || 
            action.action_type.includes('contact') ||
            action.action_type.includes('submit') ||
            action.action_type.includes('complete_registration')
          ) || [];
          
          // Create prospect entries for ads with lead actions
          if (leadActions.length > 0 || insight.conversions) {
            const leadCount = leadActions.reduce((sum, action) => sum + parseInt(action.value || 0), 0);
            
            // Create aggregated prospect entry for this ad
            if (leadCount > 0 || insight.conversions) {
              prospects.push({
                id: `PROS_${ad.id}`,
                name: `[Données agrégées - ${leadCount || insight.clicks || 0} interactions]`,
                email: '',
                phone: '',
                company: ad.name || 'Publicité Facebook',
                source: 'Facebook Ads (Stats)',
                campaignId: ad.campaign?.id || '',
                campaignName: ad.campaign?.name || '',
                adId: ad.id,
                adName: ad.name,
                date: new Date().toISOString(),
                status: 'new',
                notes: `Publicité: "${ad.name}". ${leadCount || 0} conversions, ${insight.clicks || 0} clics, CTR: ${((insight.clicks/insight.impressions)*100).toFixed(2)}%. Pour avoir les noms individuels, utilisez les Facebook Lead Forms.`,
                isAggregated: true,
                leadCount: leadCount || 0
              });
            }
          }
        }
      });
    }
    
    // If still no prospects, get campaign level data
    if (prospects.length === 0) {
      const campaignsUrl = `https://graph.facebook.com/v18.0/${accountId}/campaigns?` +
        `fields=id,name,status,insights{impressions,clicks,actions}&` +
        `limit=50&` +
        `access_token=${accessToken}`;
      
      const campaignsResponse = await fetch(campaignsUrl);
      const campaignsData = await campaignsResponse.json();
      
      if (campaignsData.data) {
        campaignsData.data.forEach(campaign => {
          if (campaign.status === 'ACTIVE' && campaign.insights?.data?.[0]) {
            const insight = campaign.insights.data[0];
            if (parseInt(insight.clicks) > 0) {
              prospects.push({
                id: `CAMP_${campaign.id}`,
                name: `[Données campagne - ${insight.clicks} clics]`,
                email: '',
                phone: '',
                company: campaign.name || 'Campagne Facebook',
                source: 'Facebook Campaign (Stats)',
                campaignId: campaign.id,
                campaignName: campaign.name,
                adId: '',
                adName: '',
                date: new Date().toISOString(),
                status: 'new',
                notes: `Campagne: "${campaign.name}". ${insight.clicks} clics, ${insight.impressions} impressions, CTR: ${((insight.clicks/insight.impressions)*100).toFixed(2)}%. Configurez des Lead Forms pour capturer les informations individuelles.`,
                isAggregated: true,
                clickCount: parseInt(insight.clicks) || 0
              });
            }
          }
        });
      }
    }
    
    console.log(`Found ${prospects.length} prospects from ads/campaigns`);
    
    return NextResponse.json({
      success: true,
      leads: prospects,
      totalCount: prospects.length,
      source: 'ads_insights',
      message: prospects.length === 0 
        ? 'Aucun lead trouvé. Vérifiez que vous avez des formulaires de leads configurés sur vos campagnes.'
        : 'Données agrégées récupérées. Pour avoir les noms individuels des prospects, configurez des Facebook Lead Forms dans vos campagnes.'
    });
    
  } catch (error) {
    console.error('Error getting leads from ads:', error);
    return NextResponse.json({
      success: false,
      leads: [],
      error: error.message
    });
  }
}