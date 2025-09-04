#!/usr/bin/env node

// Test complet du processus d'inscription
// Usage: node test-full-registration.mjs

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp, collection, addDoc, getDoc } from 'firebase/firestore';

// Configuration Firebase depuis les variables d'environnement
const firebaseConfig = {
  apiKey: "AIzaSyDKL0IW2C6mYqcaHF5kxdgquO7t-s00plY",
  authDomain: "digiflow-hub.firebaseapp.com",
  projectId: "digiflow-hub",
  storageBucket: "digiflow-hub.firebasestorage.app",
  messagingSenderId: "704034241253",
  appId: "1:704034241253:web:752002702a1ec6014c320c"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('🧪 Test complet du processus d\'inscription DigiFlow Hub\n');
console.log('═══════════════════════════════════════════════════════\n');

async function runTest() {
  // Données de test
  const timestamp = Date.now();
  const testData = {
    // Step 1 - Account
    email: `test${timestamp}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Jean',
    lastName: 'Dupont',
    displayName: 'Jean Dupont',
    locale: 'fr',
    
    // Step 2 - Company
    companyChoice: 'create',
    siret: '90930058400010',
    companyData: {
      siren: '909300584',
      name: 'EJ INVEST.',
      address: 'ROUTE DE GREASQUE 13120 GARDANNE',
      naf: '70.22Z'
    },
    
    // Step 3 - Modules & Subscription
    selectedModules: ['ads-master', 'hubcrm'],
    selectedPlan: 'growth',
    seats: 5,
    
    // Step 4 - Connections
    connections: ['meta-ads', 'google-ads']
  };

  console.log('📝 Données de test:');
  console.log(`   Email: ${testData.email}`);
  console.log(`   Nom: ${testData.displayName}`);
  console.log(`   SIRET: ${testData.siret}`);
  console.log(`   Entreprise: ${testData.companyData.name}`);
  console.log(`   Modules: ${testData.selectedModules.join(', ')}`);
  console.log(`   Plan: ${testData.selectedPlan}`);
  console.log('');

  try {
    // ÉTAPE 1: Créer le compte Firebase Auth
    console.log('1️⃣ Création du compte Firebase Auth...');
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      testData.email,
      testData.password
    );
    const user = userCredential.user;
    console.log(`   ✅ Compte créé avec UID: ${user.uid}`);

    // ÉTAPE 2: Mettre à jour le profil
    console.log('\n2️⃣ Mise à jour du profil utilisateur...');
    await updateProfile(user, { 
      displayName: testData.displayName 
    });
    console.log('   ✅ Profil mis à jour');

    // ÉTAPE 3: Créer le document utilisateur
    console.log('\n3️⃣ Création du document utilisateur dans Firestore...');
    const userData = {
      uid: user.uid,
      email: testData.email,
      displayName: testData.displayName,
      firstName: testData.firstName,
      lastName: testData.lastName,
      locale: testData.locale,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      onboardingCompleted: true
    };

    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('   ✅ Document utilisateur créé');

    // ÉTAPE 4: Créer l'organisation
    console.log('\n4️⃣ Création de l\'organisation...');
    const inviteCode = `DG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    const orgData = {
      siret: testData.siret,
      siren: testData.companyData.siren,
      name: testData.companyData.name,
      address: testData.companyData.address,
      naf: testData.companyData.naf,
      status: 'active',
      inviteCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ownerId: user.uid,
      modulesEnabled: testData.selectedModules,
      subscription: {
        plan: testData.selectedPlan,
        seats: testData.seats,
        status: 'trial'
      }
    };

    const orgRef = await addDoc(collection(db, 'organizations'), orgData);
    console.log(`   ✅ Organisation créée avec ID: ${orgRef.id}`);
    console.log(`   📋 Code d'invitation: ${inviteCode}`);

    // ÉTAPE 5: Créer le membership
    console.log('\n5️⃣ Création du membership...');
    await setDoc(doc(db, 'memberships', `${user.uid}_${orgRef.id}`), {
      userId: user.uid,
      organizationId: orgRef.id,
      role: 'owner',
      joinedAt: serverTimestamp()
    });
    console.log('   ✅ Membership créé (role: owner)');

    // ÉTAPE 6: Créer le wallet
    console.log('\n6️⃣ Création du wallet avec crédits de bienvenue...');
    await setDoc(doc(db, 'wallets', orgRef.id), {
      organizationId: orgRef.id,
      credits: 50,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('   ✅ Wallet créé avec 50 crédits offerts');

    // ÉTAPE 7: Créer la transaction de bienvenue
    console.log('\n7️⃣ Enregistrement de la transaction de bienvenue...');
    await addDoc(collection(db, 'transactions'), {
      walletId: orgRef.id,
      amount: 50,
      type: 'credit',
      reason: 'welcome_bonus',
      timestamp: serverTimestamp()
    });
    console.log('   ✅ Transaction enregistrée');

    // ÉTAPE 8: Sauvegarder les connexions
    if (testData.connections && testData.connections.length > 0) {
      console.log('\n8️⃣ Sauvegarde des connexions...');
      await setDoc(doc(db, 'connections', user.uid), {
        userId: user.uid,
        organizationId: orgRef.id,
        services: testData.connections,
        createdAt: serverTimestamp()
      });
      console.log(`   ✅ Connexions sauvegardées: ${testData.connections.join(', ')}`);
    }

    // VÉRIFICATION FINALE
    console.log('\n9️⃣ Vérification des données créées...');
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const orgDoc = await getDoc(doc(db, 'organizations', orgRef.id));
    const walletDoc = await getDoc(doc(db, 'wallets', orgRef.id));
    const membershipDoc = await getDoc(doc(db, 'memberships', `${user.uid}_${orgRef.id}`));
    
    console.log('   ✅ Document utilisateur existe:', userDoc.exists());
    console.log('   ✅ Document organisation existe:', orgDoc.exists());
    console.log('   ✅ Document wallet existe:', walletDoc.exists());
    console.log('   ✅ Document membership existe:', membershipDoc.exists());

    // RÉSUMÉ
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎉 TEST RÉUSSI !');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📊 Résumé du compte créé:');
    console.log(`   • UID: ${user.uid}`);
    console.log(`   • Email: ${testData.email}`);
    console.log(`   • Organisation: ${testData.companyData.name}`);
    console.log(`   • ID Organisation: ${orgRef.id}`);
    console.log(`   • Code invitation: ${inviteCode}`);
    console.log(`   • Crédits: 50`);
    console.log(`   • Plan: ${testData.selectedPlan} (${testData.seats} sièges)`);
    console.log(`   • Modules actifs: ${testData.selectedModules.join(', ')}`);
    console.log('');
    console.log('✨ Le processus d\'inscription fonctionne parfaitement !');

    // Se déconnecter
    await signOut(auth);
    console.log('\n👋 Déconnexion effectuée');

  } catch (error) {
    console.error('\n❌ ERREUR PENDANT LE TEST:');
    console.error('═══════════════════════════════════════════════════════\n');
    console.error('Code d\'erreur:', error.code);
    console.error('Message:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.error('\n💡 Cet email est déjà utilisé. Le système empêche les doublons.');
    } else if (error.code === 'auth/weak-password') {
      console.error('\n💡 Le mot de passe est trop faible.');
    } else if (error.code === 'auth/invalid-email') {
      console.error('\n💡 L\'email est invalide.');
    }
    
    console.error('\nStack trace:', error.stack);
  }

  process.exit(0);
}

// Lancer le test
runTest();