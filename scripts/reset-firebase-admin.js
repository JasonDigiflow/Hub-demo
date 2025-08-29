#!/usr/bin/env node

/**
 * Script pour réinitialiser la base de données avec Firebase Admin SDK
 * Usage: node scripts/reset-firebase-admin.js
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Vérifier les credentials
if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.error('❌ Variables manquantes: FIREBASE_PRIVATE_KEY ou FIREBASE_CLIENT_EMAIL');
  console.log('Ajoute ces variables dans ton .env.local:');
  console.log('FIREBASE_CLIENT_EMAIL=...');
  console.log('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
  process.exit(1);
}

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

async function deleteCollection(collectionPath, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid exploding the stack
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

async function resetDatabase() {
  console.log('🔥 RÉINITIALISATION COMPLÈTE DE FIREBASE...\n');
  
  const collections = [
    'users',
    'organizations', 
    'aids_prospects',
    'aids_revenues',
    'test_tokens',
    'insights_cache',
    'audit_logs'
  ];
  
  try {
    for (const collection of collections) {
      process.stdout.write(`Suppression de ${collection}... `);
      await deleteCollection(collection);
      console.log('✅');
    }
    
    console.log('\n✅ RÉINITIALISATION TERMINÉE avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors de la réinitialisation:', error.message);
    process.exit(1);
  }
}

// Demander confirmation
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('⚠️  ATTENTION: Cette action va supprimer TOUTES les données Firebase!');
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('');
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