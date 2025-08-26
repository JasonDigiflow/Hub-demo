import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import inMemoryStore from '@/lib/aids/inMemoryStore';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    console.log(`PUT /api/aids/revenues/${id} - Updating revenue`);
    console.log('Update data:', data);
    
    // Update revenue - try Firebase first, fallback to in-memory
    let success = false;
    
    if (db && db.collection) {
      try {
        const docRef = db.collection('aids_revenues').doc(id);
        const doc = await docRef.get();
        
        console.log(`Revenue ${id} exists in Firebase:`, doc.exists);
        
        if (doc.exists) {
          // Ne pas écraser l'ID existant
          const { id: dataId, ...updateData } = data;
          await docRef.update({
            ...updateData,
            updatedAt: new Date().toISOString()
          });
          success = true;
          console.log(`Revenue ${id} updated successfully in Firebase`);
        } else {
          // Si le document n'existe pas mais que l'ID ressemble à un timestamp,
          // essayer de créer un nouveau document
          if (id && /^\d{13}$/.test(id)) {
            console.log(`Revenue ${id} not found, creating new document for legacy ID`);
            await docRef.set({
              ...data,
              updatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString()
            });
            success = true;
            console.log(`Revenue ${id} created in Firebase with legacy ID`);
          }
        }
      } catch (error) {
        console.error('Firebase error, using in-memory store:', error.message);
        success = await inMemoryStore.updateRevenue(id, data);
      }
    } else {
      console.log('Firebase not available, using in-memory store');
      success = await inMemoryStore.updateRevenue(id, data);
    }
    
    if (!success) {
      console.error(`Revenue ${id} not found in any storage`);
      return NextResponse.json(
        { error: 'Revenue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `Revenue ${id} updated successfully`
    });
  } catch (error) {
    console.error('Error updating revenue:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // First get the revenue to find associated prospect
    let revenueData = null;
    let success = false;
    
    if (db && db.collection) {
      try {
        const docRef = db.collection('aids_revenues').doc(id);
        const doc = await docRef.get();
        
        if (doc.exists) {
          revenueData = doc.data();
          await docRef.delete();
          success = true;
          
          // If revenue had a prospect associated, update its status
          if (revenueData && revenueData.prospectId) {
            console.log(`Revenue deleted, updating prospect ${revenueData.prospectId} status`);
            
            // Get user's organization
            const userId = revenueData.userId;
            if (userId) {
              const userDoc = await db.collection('users').doc(userId).get();
              const userData = userDoc.exists ? userDoc.data() : {};
              const orgId = userData.primaryOrgId || userId;
              
              // Search for prospect in all ad accounts
              const adAccountsSnapshot = await db
                .collection('organizations').doc(orgId)
                .collection('adAccounts')
                .get();
              
              for (const adAccountDoc of adAccountsSnapshot.docs) {
                const prospectRef = db
                  .collection('organizations').doc(orgId)
                  .collection('adAccounts').doc(adAccountDoc.id)
                  .collection('prospects').doc(revenueData.prospectId);
                
                const prospectDoc = await prospectRef.get();
                
                if (prospectDoc.exists) {
                  console.log(`Found prospect in ad account ${adAccountDoc.id}, resetting status`);
                  
                  // Reset prospect status and remove revenue info
                  await prospectRef.update({
                    status: 'qualified', // Reset to qualified instead of new
                    revenueAmount: null,
                    revenueDate: null,
                    revenueService: null,
                    convertedAt: null,
                    updatedAt: new Date().toISOString()
                  });
                  
                  console.log(`✅ Prospect ${revenueData.prospectId} status reset to qualified`);
                  break;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Firebase error, using in-memory store:', error.message);
        success = await inMemoryStore.deleteRevenue(id);
      }
    } else {
      console.log('Firebase not available, using in-memory store');
      success = await inMemoryStore.deleteRevenue(id);
    }
    
    if (!success) {
      return NextResponse.json(
        { error: 'Revenue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Revenue deleted and prospect status updated successfully'
    });
  } catch (error) {
    console.error('Error deleting revenue:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}