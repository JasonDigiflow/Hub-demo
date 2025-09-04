import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

/**
 * Génère un code d'invitation unique
 */
function generateInviteCode() {
  const prefix = 'DG';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

/**
 * Finalise l'inscription complète avec création du compte et de l'organisation
 */
export async function completeOnboarding(onboardingData) {
  try {
    // 1. Créer le compte Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      onboardingData.email,
      onboardingData.password
    );

    const user = userCredential.user;

    // 2. Mettre à jour le profil
    await updateProfile(user, { 
      displayName: onboardingData.displayName 
    });

    // 3. Créer le document utilisateur
    const userData = {
      uid: user.uid,
      email: onboardingData.email,
      displayName: onboardingData.displayName,
      firstName: onboardingData.firstName,
      lastName: onboardingData.lastName,
      locale: onboardingData.locale,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      onboardingCompleted: true
    };

    // 4. Gérer l'organisation selon le choix
    let organizationId = null;
    let userRole = 'user';

    if (onboardingData.companyChoice === 'create') {
      // Créer une nouvelle organisation
      const inviteCode = generateInviteCode();
      
      const orgData = {
        siret: onboardingData.siret,
        siren: onboardingData.companyData?.siren,
        name: onboardingData.companyData?.name,
        address: onboardingData.companyData?.address,
        naf: onboardingData.companyData?.naf,
        status: 'active',
        inviteCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ownerId: user.uid,
        modulesEnabled: onboardingData.selectedModules || [],
        subscription: {
          plan: onboardingData.selectedPlan,
          seats: onboardingData.seats,
          status: 'trial' // En attente de paiement
        }
      };

      const orgRef = await addDoc(collection(db, 'organizations'), orgData);
      organizationId = orgRef.id;
      userRole = 'owner';

      // Créer le membership
      await setDoc(doc(db, 'memberships', `${user.uid}_${organizationId}`), {
        userId: user.uid,
        organizationId,
        role: 'owner',
        joinedAt: serverTimestamp()
      });

      // Créer le wallet avec 50 crédits offerts
      await setDoc(doc(db, 'wallets', organizationId), {
        organizationId,
        credits: 50,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Créer la première transaction séparément
      await addDoc(collection(db, 'transactions'), {
        walletId: organizationId,
        amount: 50,
        type: 'credit',
        reason: 'welcome_bonus',
        timestamp: serverTimestamp()
      });

    } else if (onboardingData.companyChoice === 'join') {
      // Rejoindre une organisation existante
      // TODO: Implémenter la logique de jointure avec le code d'invitation
      userRole = 'member';
      
    } else if (onboardingData.companyChoice === 'no-siret') {
      // Créer une organisation sans SIRET
      const inviteCode = generateInviteCode();
      
      const orgData = {
        siret: null,
        name: onboardingData.companyData?.name,
        country: onboardingData.companyData?.country,
        type: onboardingData.companyData?.type,
        taxId: onboardingData.companyData?.taxId,
        status: 'active',
        inviteCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ownerId: user.uid,
        modulesEnabled: onboardingData.selectedModules || [],
        subscription: {
          plan: onboardingData.selectedPlan,
          seats: onboardingData.seats,
          status: 'trial'
        }
      };

      const orgRef = await addDoc(collection(db, 'organizations'), orgData);
      organizationId = orgRef.id;
      userRole = 'owner';

      // Créer le membership
      await setDoc(doc(db, 'memberships', `${user.uid}_${organizationId}`), {
        userId: user.uid,
        organizationId,
        role: 'owner',
        joinedAt: serverTimestamp()
      });

      // Créer le wallet avec 50 crédits offerts
      await setDoc(doc(db, 'wallets', organizationId), {
        organizationId,
        credits: 50,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Créer la première transaction séparément
      await addDoc(collection(db, 'transactions'), {
        walletId: organizationId,
        amount: 50,
        type: 'credit',
        reason: 'welcome_bonus',
        timestamp: serverTimestamp()
      });
    }

    // 5. Mettre à jour le document utilisateur avec l'organisation
    userData.organizationId = organizationId;
    userData.role = userRole;
    
    await setDoc(doc(db, 'users', user.uid), userData);

    // 6. Sauvegarder les connexions si présentes
    if (onboardingData.connections && onboardingData.connections.length > 0) {
      await setDoc(doc(db, 'connections', user.uid), {
        userId: user.uid,
        organizationId,
        services: onboardingData.connections,
        createdAt: serverTimestamp()
      });
    }

    return {
      success: true,
      userId: user.uid,
      organizationId
    };

  } catch (error) {
    console.error('Erreur lors de la finalisation de l\'inscription:', error);
    throw error;
  }
}