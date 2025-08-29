#!/usr/bin/env node

/**
 * Script pour réinitialiser la base de données Firestore
 * Usage: node scripts/reset-database.js
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

async function resetDatabase() {
  console.log('🔥 DÉBUT DE LA RÉINITIALISATION COMPLÈTE...');
  
  const deletedStats = {
    users: 0,
    organizations: 0,
    aids_prospects: 0,
    aids_revenues: 0,
    test_tokens: 0,
    insights_cache: 0,
    audit_logs: 0,
    syncLogs: 0
  };
  
  try {
    // 1. Supprimer tous les utilisateurs
    console.log('Suppression des utilisateurs...');
    const usersSnapshot = await db.collection('users').get();
    const usersBatch = db.batch();
    usersSnapshot.forEach(doc => {
      usersBatch.delete(doc.ref);
      deletedStats.users++;
    });
    if (deletedStats.users > 0) await usersBatch.commit();
    
    // 2. Supprimer toutes les organisations et leurs sous-collections
    console.log('Suppression des organisations...');
    const orgsSnapshot = await db.collection('organizations').get();
    
    for (const orgDoc of orgsSnapshot.docs) {
      // Supprimer les sous-collections
      const syncLogsSnapshot = await db.collection('organizations')
        .doc(orgDoc.id)
        .collection('syncLogs')
        .get();
      
      if (!syncLogsSnapshot.empty) {
        const syncBatch = db.batch();
        syncLogsSnapshot.forEach(doc => {
          syncBatch.delete(doc.ref);
          deletedStats.syncLogs++;
        });
        await syncBatch.commit();
      }
      
      // Supprimer l'organisation
      await orgDoc.ref.delete();
      deletedStats.organizations++;
    }
    
    // 3. Supprimer les prospects AIDs
    console.log('Suppression des prospects...');
    const prospectsSnapshot = await db.collection('aids_prospects').get();
    const prospectsBatch = db.batch();
    prospectsSnapshot.forEach(doc => {
      prospectsBatch.delete(doc.ref);
      deletedStats.aids_prospects++;
    });
    if (deletedStats.aids_prospects > 0) await prospectsBatch.commit();
    
    // 4. Supprimer les revenus AIDs
    console.log('Suppression des revenus...');
    const revenuesSnapshot = await db.collection('aids_revenues').get();
    const revenuesBatch = db.batch();
    revenuesSnapshot.forEach(doc => {
      revenuesBatch.delete(doc.ref);
      deletedStats.aids_revenues++;
    });
    if (deletedStats.aids_revenues > 0) await revenuesBatch.commit();
    
    // 5. Supprimer les test tokens
    console.log('Suppression des test tokens...');
    const tokensSnapshot = await db.collection('test_tokens').get();
    const tokensBatch = db.batch();
    tokensSnapshot.forEach(doc => {
      tokensBatch.delete(doc.ref);
      deletedStats.test_tokens++;
    });
    if (deletedStats.test_tokens > 0) await tokensBatch.commit();
    
    // 6. Supprimer le cache insights
    console.log('Suppression du cache insights...');
    const cacheSnapshot = await db.collection('insights_cache').get();
    const cacheBatch = db.batch();
    cacheSnapshot.forEach(doc => {
      cacheBatch.delete(doc.ref);
      deletedStats.insights_cache++;
    });
    if (deletedStats.insights_cache > 0) await cacheBatch.commit();
    
    // 7. Supprimer les audit logs
    console.log('Suppression des audit logs...');
    const logsSnapshot = await db.collection('audit_logs').get();
    const logsBatch = db.batch();
    logsSnapshot.forEach(doc => {
      logsBatch.delete(doc.ref);
      deletedStats.audit_logs++;
    });
    if (deletedStats.audit_logs > 0) await logsBatch.commit();
    
    console.log('✅ RÉINITIALISATION TERMINÉE');
    console.log('\n📊 Statistiques de suppression:');
    console.log('--------------------------------');
    Object.entries(deletedStats).forEach(([key, value]) => {
      console.log(`${key}: ${value} documents supprimés`);
    });
    console.log('--------------------------------');
    console.log(`Total: ${Object.values(deletedStats).reduce((a, b) => a + b, 0)} documents supprimés`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    process.exit(1);
  }
}

// Demander confirmation
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('⚠️  ATTENTION: Cette action va supprimer TOUTES les données de la base Firestore!');
rl.question('Êtes-vous sûr de vouloir continuer? (oui/non): ', (answer) => {
  if (answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'yes') {
    rl.close();
    resetDatabase();
  } else {
    console.log('Opération annulée.');
    rl.close();
    process.exit(0);
  }
});