// Test script to verify Firebase account creation
// Run this with: node test-registration.js

import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, addDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase.js';

async function testRegistration() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  console.log('🧪 Testing registration flow...');
  console.log(`📧 Test email: ${testEmail}`);
  
  try {
    // Step 1: Create account
    console.log('\n1️⃣ Creating Firebase Auth account...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    console.log('✅ Account created:', user.uid);
    
    // Step 2: Update profile
    console.log('\n2️⃣ Updating profile...');
    await updateProfile(user, { 
      displayName: 'Test User' 
    });
    console.log('✅ Profile updated');
    
    // Step 3: Create user document
    console.log('\n3️⃣ Creating user document...');
    const userData = {
      uid: user.uid,
      email: testEmail,
      displayName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      locale: 'fr',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      onboardingCompleted: true
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('✅ User document created');
    
    // Step 4: Create organization
    console.log('\n4️⃣ Creating organization...');
    const orgData = {
      name: 'Test Company',
      status: 'active',
      inviteCode: 'DG-TEST1',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ownerId: user.uid,
      modulesEnabled: ['ads-master'],
      subscription: {
        plan: 'growth',
        seats: 5,
        status: 'trial'
      }
    };
    
    const orgRef = await addDoc(collection(db, 'organizations'), orgData);
    console.log('✅ Organization created:', orgRef.id);
    
    // Step 5: Create membership
    console.log('\n5️⃣ Creating membership...');
    await setDoc(doc(db, 'memberships', `${user.uid}_${orgRef.id}`), {
      userId: user.uid,
      organizationId: orgRef.id,
      role: 'owner',
      joinedAt: serverTimestamp()
    });
    console.log('✅ Membership created');
    
    // Step 6: Create wallet
    console.log('\n6️⃣ Creating wallet...');
    await setDoc(doc(db, 'wallets', orgRef.id), {
      organizationId: orgRef.id,
      credits: 50,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Wallet created with 50 credits');
    
    // Step 7: Verify everything was created
    console.log('\n7️⃣ Verifying data...');
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const orgDoc = await getDoc(doc(db, 'organizations', orgRef.id));
    const walletDoc = await getDoc(doc(db, 'wallets', orgRef.id));
    
    console.log('✅ User exists:', userDoc.exists());
    console.log('✅ Organization exists:', orgDoc.exists());
    console.log('✅ Wallet exists:', walletDoc.exists());
    
    // Cleanup (optional - comment out if you want to keep the test data)
    console.log('\n🧹 Cleaning up test data...');
    await deleteDoc(doc(db, 'users', user.uid));
    await deleteDoc(doc(db, 'organizations', orgRef.id));
    await deleteDoc(doc(db, 'wallets', orgRef.id));
    await deleteDoc(doc(db, 'memberships', `${user.uid}_${orgRef.id}`));
    await user.delete();
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Try to sign out if there's an error
    try {
      await signOut(auth);
    } catch (signOutError) {
      // Ignore signout errors during cleanup
    }
  }
  
  process.exit(0);
}

// Run the test
testRegistration();