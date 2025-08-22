#!/usr/bin/env node

/**
 * Script de migration vers la structure multi-tenant
 * 
 * Usage:
 *   node scripts/migrate-to-org-structure.js [options]
 * 
 * Options:
 *   --dry-run     Simulation sans écriture
 *   --resume=ID   Reprendre depuis un document spécifique
 *   --limit=N     Limiter à N documents
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration Firebase Admin
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (!serviceAccount && !process.env.FIREBASE_PROJECT_ID) {
  console.error('❌ Firebase configuration missing');
  console.log('Please set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID in .env.local');
  process.exit(1);
}

// Initialiser Firebase Admin
let app;
if (serviceAccount) {
  app = initializeApp({
    credential: cert(serviceAccount)
  });
} else {
  // Mode développement avec émulateur
  app = initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const db = getFirestore(app);

// Parser les arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  resume: args.find(arg => arg.startsWith('--resume='))?.split('=')[1],
  limit: parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '0')
};

console.log('🚀 Migration vers structure multi-tenant');
console.log('Options:', options);

// ============= FONCTIONS UTILITAIRES =============

/**
 * Créer une organisation pour un utilisateur
 */
async function createOrganizationForUser(userId, userData) {
  const orgId = `org_${userId}_${Date.now()}`;
  const orgName = userData.email?.split('@')[0] || 'Organisation';
  const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  const orgData = {
    name: orgName,
    slug: orgSlug,
    owner: userId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    subscription: {
      plan: 'free',
      status: 'active'
    },
    limits: {
      maxMembers: 5,
      maxAdAccounts: 3,
      maxProspects: 1000
    }
  };
  
  if (!options.dryRun) {
    await db.collection('organizations').doc(orgId).set(orgData);
    
    // Ajouter l'utilisateur comme admin
    await db.collection('organizations').doc(orgId)
      .collection('members').doc(userId).set({
        uid: userId,
        role: 'admin',
        invitedBy: userId,
        email: userData.email,
        createdAt: FieldValue.serverTimestamp(),
        acceptedAt: FieldValue.serverTimestamp()
      });
    
    // Mettre à jour le document utilisateur
    await db.collection('users').doc(userId).set({
      email: userData.email,
      name: userData.name || userData.email?.split('@')[0],
      orgIds: [orgId],
      primaryOrgId: orgId,
      createdAt: userData.createdAt || FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  }
  
  console.log(`✅ Organisation créée: ${orgId} pour ${userData.email}`);
  return orgId;
}

/**
 * Créer un ad account Meta par défaut
 */
async function createDefaultAdAccount(orgId, accountData = {}) {
  const adAccountId = accountData.id || `adacc_${Date.now()}`;
  
  const adAccountDoc = {
    platform: 'meta',
    externalId: accountData.externalId || 'act_unknown',
    name: accountData.name || 'Compte Meta',
    currency: accountData.currency || 'EUR',
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };
  
  if (!options.dryRun) {
    await db.collection('organizations').doc(orgId)
      .collection('adAccounts').doc(adAccountId).set(adAccountDoc);
  }
  
  console.log(`  📊 Ad Account créé: ${adAccountId}`);
  return adAccountId;
}

/**
 * Migrer les prospects
 */
async function migrateProspects() {
  console.log('\n📋 Migration des prospects...');
  
  const stats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0
  };
  
  try {
    // Récupérer tous les prospects existants
    let query = db.collection('aids_prospects');
    
    if (options.resume) {
      query = query.startAfter(options.resume);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    stats.total = snapshot.size;
    
    console.log(`Found ${stats.total} prospects to migrate`);
    
    // Grouper les prospects par userId
    const prospectsByUser = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const userId = data.userId || 'unknown';
      if (!prospectsByUser[userId]) {
        prospectsByUser[userId] = [];
      }
      prospectsByUser[userId].push({ id: doc.id, ...data });
    });
    
    // Migrer pour chaque utilisateur
    for (const [userId, prospects] of Object.entries(prospectsByUser)) {
      console.log(`\n👤 User ${userId}: ${prospects.length} prospects`);
      
      try {
        // Récupérer ou créer l'organisation de l'utilisateur
        let orgId;
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (userDoc.exists && userDoc.data().primaryOrgId) {
          orgId = userDoc.data().primaryOrgId;
          console.log(`  Using existing org: ${orgId}`);
        } else {
          // Créer une nouvelle organisation
          const userData = userDoc.exists ? userDoc.data() : { email: `user${userId}@example.com` };
          orgId = await createOrganizationForUser(userId, userData);
        }
        
        // Créer un ad account par défaut
        const adAccountId = await createDefaultAdAccount(orgId);
        
        // Migrer les prospects
        const batch = db.batch();
        let batchCount = 0;
        
        for (const prospect of prospects) {
          const newProspectRef = db
            .collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountId)
            .collection('prospects').doc(prospect.id);
          
          // Nettoyer et convertir les données
          const cleanProspect = {
            ...prospect,
            createdAt: prospect.createdAt || FieldValue.serverTimestamp(),
            updatedAt: prospect.updatedAt || FieldValue.serverTimestamp(),
            migratedFrom: 'aids_prospects',
            migratedAt: FieldValue.serverTimestamp()
          };
          
          // Supprimer l'ancien userId
          delete cleanProspect.userId;
          
          if (!options.dryRun) {
            batch.set(newProspectRef, cleanProspect);
            batchCount++;
            
            // Commit par batch de 500
            if (batchCount >= 500) {
              await batch.commit();
              console.log(`  ✅ Batch de ${batchCount} prospects migrés`);
              batchCount = 0;
            }
          }
          
          stats.migrated++;
        }
        
        // Commit le dernier batch
        if (!options.dryRun && batchCount > 0) {
          await batch.commit();
          console.log(`  ✅ Batch final de ${batchCount} prospects migrés`);
        }
        
      } catch (error) {
        console.error(`  ❌ Erreur pour user ${userId}:`, error.message);
        stats.errors += prospects.length;
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
  
  return stats;
}

/**
 * Migrer les revenus (aids_revenues)
 */
async function migrateRevenues() {
  console.log('\n💰 Migration des revenus...');
  
  const stats = {
    total: 0,
    migrated: 0,
    errors: 0
  };
  
  try {
    const snapshot = await db.collection('aids_revenues').get();
    stats.total = snapshot.size;
    
    console.log(`Found ${stats.total} revenues to migrate`);
    
    // Grouper par userId
    const revenuesByUser = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const userId = data.userId || 'unknown';
      if (!revenuesByUser[userId]) {
        revenuesByUser[userId] = [];
      }
      revenuesByUser[userId].push({ id: doc.id, ...data });
    });
    
    // Migrer pour chaque utilisateur
    for (const [userId, revenues] of Object.entries(revenuesByUser)) {
      console.log(`\n👤 User ${userId}: ${revenues.length} revenues`);
      
      try {
        // Récupérer l'organisation
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists || !userDoc.data().primaryOrgId) {
          console.log(`  ⚠️ Pas d'organisation pour ${userId}, skipping`);
          continue;
        }
        
        const orgId = userDoc.data().primaryOrgId;
        
        // Récupérer le premier ad account
        const adAccountsSnapshot = await db
          .collection('organizations').doc(orgId)
          .collection('adAccounts').limit(1).get();
        
        if (adAccountsSnapshot.empty) {
          console.log(`  ⚠️ Pas d'ad account pour org ${orgId}`);
          continue;
        }
        
        const adAccountId = adAccountsSnapshot.docs[0].id;
        
        // Migrer les revenus
        for (const revenue of revenues) {
          const newRevenueRef = db
            .collection('organizations').doc(orgId)
            .collection('adAccounts').doc(adAccountId)
            .collection('revenues').doc(revenue.id);
          
          // Convertir en centimes si nécessaire
          const amountCents = revenue.amountCents || Math.round((revenue.amount || 0) * 100);
          
          const cleanRevenue = {
            amountCents,
            currency: revenue.currency || 'EUR',
            date: revenue.date || revenue.createdAt || FieldValue.serverTimestamp(),
            type: revenue.type || 'sale',
            attribution: revenue.attribution || {},
            note: revenue.notes || revenue.note || '',
            createdAt: revenue.createdAt || FieldValue.serverTimestamp(),
            createdBy: userId,
            migratedFrom: 'aids_revenues',
            migratedAt: FieldValue.serverTimestamp()
          };
          
          if (!options.dryRun) {
            await newRevenueRef.set(cleanRevenue);
          }
          
          stats.migrated++;
          console.log(`  ✅ Revenue ${revenue.id} migré`);
        }
        
      } catch (error) {
        console.error(`  ❌ Erreur pour user ${userId}:`, error.message);
        stats.errors += revenues.length;
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
  
  return stats;
}

/**
 * Logger les résultats de migration
 */
async function logMigration(results) {
  const logData = {
    timestamp: FieldValue.serverTimestamp(),
    dryRun: options.dryRun,
    results,
    options
  };
  
  if (!options.dryRun) {
    await db.collection('migrations_logs').add(logData);
  }
  
  console.log('\n📊 Résumé de la migration:');
  console.log(JSON.stringify(results, null, 2));
}

// ============= EXECUTION PRINCIPALE =============

async function main() {
  const startTime = Date.now();
  const results = {};
  
  try {
    // Migration des prospects
    results.prospects = await migrateProspects();
    
    // Migration des revenus
    results.revenues = await migrateRevenues();
    
    // Durée totale
    results.duration = Math.round((Date.now() - startTime) / 1000);
    results.success = true;
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    results.error = error.message;
    results.success = false;
  }
  
  // Logger les résultats
  await logMigration(results);
  
  if (options.dryRun) {
    console.log('\n⚠️ MODE DRY-RUN - Aucune donnée n\'a été modifiée');
  } else {
    console.log('\n✅ Migration terminée!');
  }
  
  process.exit(results.success ? 0 : 1);
}

// Lancer la migration
main().catch(console.error);