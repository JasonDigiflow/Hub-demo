import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/firebase-admin';
import aidsLogger, { LogCategories } from '@/lib/aids-logger';

export async function GET(request) {
  try {
    aidsLogger.info(LogCategories.META_API, 'Lead Center V2: Début récupération des prospects');
    
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('meta_session');
    const selectedAccountCookie = cookieStore.get('selected_ad_account');
    
    if (!sessionCookie || !selectedAccountCookie) {
      const error = 'Not authenticated or no account selected';
      aidsLogger.error(LogCategories.AUTH, 'Lead Center V2: Erreur authentification', {
        hasSession: !!sessionCookie,
        hasAccount: !!selectedAccountCookie
      });
      return NextResponse.json({ 
        error,
        success: false
      }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const accountId = selectedAccountCookie.value;
    const accessToken = session.accessToken;
    
    console.log('=== LEAD CENTER V2 - FETCHING LEADS ===');
    console.log('Account ID:', accountId);
    
    const allLeads = [];
    const processedLeadIds = new Set();
    
    // Method 1: Get leads directly from ads (WORKING METHOD)
    try {
      const adsUrl = `https://graph.facebook.com/v18.0/${accountId}/ads?` +
        `fields=id,name,status,leads{id,created_time,field_data,form_id,campaign_name,campaign_id,ad_id,ad_name,adset_id,adset_name}&` +
        `limit=100&` +
        `access_token=${accessToken}`;
      
      console.log('Fetching ads with leads...');
      aidsLogger.info(LogCategories.META_API, 'Lead Center V2: Récupération des ads avec leads', { accountId });
      
      let nextUrl = adsUrl;
      let adsPageCount = 0;
      
      while (nextUrl && adsPageCount < 20) { // Limit pages for safety
        adsPageCount++;
        
        const adsResponse = await fetch(nextUrl);
        const adsData = await adsResponse.json();
        
        if (adsData.error) {
          aidsLogger.error(LogCategories.META_API, 'Lead Center V2: Erreur récupération ads', {
            error: adsData.error,
            accountId
          });
          console.error('Error fetching ads:', adsData.error);
          break;
        }
        
        if (adsData.data) {
          console.log(`Page ${adsPageCount}: Found ${adsData.data.length} ads`);
          
          for (const ad of adsData.data) {
            if (ad.leads && ad.leads.data) {
              console.log(`Ad "${ad.name}" (${ad.id}): ${ad.leads.data.length} leads`);
              
              // Process each lead
              for (const lead of ad.leads.data) {
                // Skip if already processed
                if (processedLeadIds.has(lead.id)) continue;
                processedLeadIds.add(lead.id);
                
                const fieldData = {};
                if (lead.field_data) {
                  lead.field_data.forEach(field => {
                    fieldData[field.name] = field.values?.[0] || '';
                  });
                }
                
                // Extract name
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
                
                // Extract other fields
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
                
                allLeads.push({
                  id: `LEAD_${lead.id}`,
                  metaId: lead.id,
                  name: finalName,
                  email: email,
                  phone: phone,
                  company: company,
                  source: 'Meta Ads',
                  adId: ad.id,
                  adName: ad.name,
                  adStatus: ad.status,
                  formId: lead.form_id || '',
                  campaignId: lead.campaign_id || '',
                  campaignName: lead.campaign_name || '',
                  adsetId: lead.adset_id || '',
                  adsetName: lead.adset_name || '',
                  createdTime: lead.created_time,
                  date: lead.created_time,
                  status: 'new',
                  rawFieldData: fieldData
                });
              }
              
              // Check if there are more leads to paginate
              if (ad.leads.paging && ad.leads.paging.next) {
                let leadsNextUrl = ad.leads.paging.next;
                let leadsPageCount = 1;
                
                while (leadsNextUrl && leadsPageCount < 10) {
                  leadsPageCount++;
                  console.log(`Fetching page ${leadsPageCount} of leads for ad ${ad.name}...`);
                  
                  const moreLeadsResponse = await fetch(leadsNextUrl);
                  const moreLeadsData = await moreLeadsResponse.json();
                  
                  if (moreLeadsData.data) {
                    for (const lead of moreLeadsData.data) {
                      if (processedLeadIds.has(lead.id)) continue;
                      processedLeadIds.add(lead.id);
                      
                      const fieldData = {};
                      if (lead.field_data) {
                        lead.field_data.forEach(field => {
                          fieldData[field.name] = field.values?.[0] || '';
                        });
                      }
                      
                      const fullName = fieldData['full_name'] || fieldData['name'] || `Lead ${lead.id}`;
                      
                      allLeads.push({
                        id: `LEAD_${lead.id}`,
                        metaId: lead.id,
                        name: fullName,
                        email: fieldData['email'] || '',
                        phone: fieldData['phone_number'] || '',
                        company: fieldData['company_name'] || '',
                        source: 'Meta Ads',
                        adId: ad.id,
                        adName: ad.name,
                        adStatus: ad.status,
                        formId: lead.form_id || '',
                        campaignId: lead.campaign_id || '',
                        campaignName: lead.campaign_name || '',
                        createdTime: lead.created_time,
                        date: lead.created_time,
                        status: 'new',
                        rawFieldData: fieldData
                      });
                    }
                  }
                  
                  leadsNextUrl = moreLeadsData.paging?.next;
                }
              }
            }
          }
        }
        
        nextUrl = adsData.paging?.next;
      }
    } catch (error) {
      aidsLogger.error(LogCategories.META_API, 'Lead Center V2: Erreur récupération ads', error);
      console.error('Error in ads method:', error);
    }
    
    // Method 2: Try getting leads from campaigns
    try {
      const campaignsUrl = `https://graph.facebook.com/v18.0/${accountId}/campaigns?` +
        `fields=id,name,ads{id,name,leads{id,created_time,field_data}}&` +
        `limit=50&` +
        `access_token=${accessToken}`;
      
      console.log('Also checking campaigns for leads...');
      
      const campaignsResponse = await fetch(campaignsUrl);
      const campaignsData = await campaignsResponse.json();
      
      if (campaignsData.data) {
        for (const campaign of campaignsData.data) {
          if (campaign.ads && campaign.ads.data) {
            for (const ad of campaign.ads.data) {
              if (ad.leads && ad.leads.data) {
                console.log(`Campaign "${campaign.name}" - Ad "${ad.name}": ${ad.leads.data.length} leads`);
                
                for (const lead of ad.leads.data) {
                  if (processedLeadIds.has(lead.id)) continue;
                  processedLeadIds.add(lead.id);
                  
                  const fieldData = {};
                  if (lead.field_data) {
                    lead.field_data.forEach(field => {
                      fieldData[field.name] = field.values?.[0] || '';
                    });
                  }
                  
                  const fullName = fieldData['full_name'] || fieldData['name'] || `Lead ${lead.id}`;
                  
                  allLeads.push({
                    id: `LEAD_${lead.id}`,
                    metaId: lead.id,
                    name: fullName,
                    email: fieldData['email'] || '',
                    phone: fieldData['phone_number'] || '',
                    company: fieldData['company_name'] || '',
                    source: 'Meta Campaign',
                    adId: ad.id,
                    adName: ad.name,
                    campaignId: campaign.id,
                    campaignName: campaign.name,
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
    } catch (error) {
      aidsLogger.warning(LogCategories.META_API, 'Lead Center V2: Erreur méthode campaigns', error);
      console.error('Error in campaigns method:', error);
    }
    
    console.log(`\n=== TOTAL UNIQUE LEADS FOUND: ${allLeads.length} ===`);
    
    aidsLogger.info(LogCategories.PROSPECT, `Lead Center V2: Total prospects trouvés: ${allLeads.length}`, {
      totalLeads: allLeads.length,
      uniqueLeadIds: processedLeadIds.size
    });
    
    // Save to Firebase if authenticated
    let savedCount = 0;
    let skippedCount = 0;
    
    console.log('=== FIREBASE SAVE ATTEMPT ===');
    console.log('Total leads to save:', allLeads.length);
    
    try {
      const authCookie = cookieStore.get('auth-token');
      let userId = null;
      
      if (authCookie) {
        try {
          const decoded = jwt.verify(authCookie.value, process.env.JWT_SECRET || 'default-secret-key');
          userId = decoded.uid || decoded.userId || decoded.id;
          console.log('User ID from JWT:', userId);
        } catch (e) {
          console.log('JWT decode error, trying meta session:', e.message);
        }
      }
      
      // Fallback to meta session if no auth token
      if (!userId && session) {
        userId = session.userID || session.userId;
        console.log('User ID from Meta session:', userId);
      }
      
      if (!userId) {
        console.log('⚠️ No userId found - cannot save to Firebase');
        return NextResponse.json({
          success: true,
          leads: allLeads,
          totalCount: allLeads.length,
          savedToFirebase: 0,
          skipped: 0,
          source: 'lead_center_v2',
          message: `⚠️ ${allLeads.length} prospects trouvés mais impossible de sauvegarder (pas d'authentification)`,
          authIssue: true
        });
      }
      
      if (userId && allLeads.length > 0) {
        console.log(`Starting Firebase save for user: ${userId}`);
        
        // Get user's organization
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        console.log('User document exists:', userDoc.exists);
        console.log('User data:', userData);
        
        if (!userDoc.exists) {
          console.log('Creating user document...');
          const newUserData = {
            email: session?.userEmail || `user${userId}@example.com`,
            orgIds: [],
            primaryOrgId: null,
            createdAt: new Date().toISOString()
          };
          await db.collection('users').doc(userId).set(newUserData);
          console.log('User document created:', newUserData);
        }
        
        let orgId = userData?.primaryOrgId;
        let adAccountId;
        
        console.log('Current orgId:', orgId);
        
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
          
          await db.collection('organizations').doc(orgId)
            .collection('members').doc(userId).set({
              uid: userId,
              role: 'admin',
              invitedBy: userId,
              createdAt: new Date().toISOString()
            });
          
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
        
        // Get existing leads
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
        
        console.log(`Existing Meta IDs count: ${existingMetaIds.size}`);
        
        // Save new leads
        const batch = db.batch();
        let batchCount = 0;
        
        console.log('Processing leads for save...');
        
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
            batchCount++;
            
            if (savedCount <= 3) {
              console.log(`Saving prospect ${savedCount}:`, lead.name, lead.metaId);
            }
            
            // Commit batch every 400 documents (Firebase limit is 500)
            if (batchCount >= 400) {
              await batch.commit();
              console.log(`Committed batch of ${batchCount} leads`);
              batchCount = 0;
            }
          } else {
            skippedCount++;
          }
        }
        
        // Commit remaining documents
        if (batchCount > 0) {
          await batch.commit();
          console.log(`Committed final batch of ${batchCount} leads`);
        }
        
        if (savedCount > 0) {
          console.log(`✅ Saved ${savedCount} new prospects to Firebase (org: ${orgId})`);
          aidsLogger.success(LogCategories.PROSPECT, `Lead Center V2: ${savedCount} nouveaux prospects sauvegardés`, {
            orgId,
            adAccountId,
            savedCount,
            skippedCount
          });
        }
      }
    } catch (error) {
      aidsLogger.error(LogCategories.PROSPECT, 'Lead Center V2: Erreur sauvegarde Firebase', {
        errorMessage: error.message,
        errorStack: error.stack
      }, error);
      console.error('Error saving to Firebase:', error);
    }
    
    return NextResponse.json({
      success: true,
      leads: allLeads,
      totalCount: allLeads.length,
      savedToFirebase: savedCount,
      skipped: skippedCount,
      source: 'lead_center_v2',
      message: allLeads.length > 0 
        ? `✅ ${allLeads.length} prospects trouvés via les ads Meta`
        : '⚠️ Aucun prospect trouvé'
    });
    
  } catch (error) {
    aidsLogger.critical(LogCategories.META_API, 'Lead Center V2: Erreur critique API', {
      errorMessage: error.message,
      errorStack: error.stack,
      url: request.url
    }, error);
    console.error('Lead Center V2 API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch leads',
      details: error.message,
      success: false
    }, { status: 500 });
  }
}