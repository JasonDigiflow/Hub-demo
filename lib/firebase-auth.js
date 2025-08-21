import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';

// Check if Firebase is properly initialized
const isFirebaseReady = () => {
  return auth !== null && db !== null;
};

/**
 * Create a new user account with Firebase Auth
 */
export const registerWithEmail = async (email, password, userData) => {
  if (!isFirebaseReady()) {
    throw new Error('Firebase is not configured. Please check your environment variables.');
  }

  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    if (userData.name) {
      await updateProfile(user, {
        displayName: userData.name
      });
    }

    // Create user document in Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: userData.name || '',
        organizationId: null,
        organizationRole: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } catch (firestoreError) {
      console.error('Firestore write error (user may still be created):', firestoreError);
      // Continue even if Firestore fails - user is created in Auth
    }

    // If organization name provided, create organization
    if (userData.organizationName) {
      try {
        const orgData = {
          name: userData.organizationName,
          ownerId: user.uid,
          members: [user.uid],
          plan: 'free',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const orgRef = await addDoc(collection(db, 'organizations'), orgData);
        
        // Update user with organization
        await updateDoc(doc(db, 'users', user.uid), {
          organizationId: orgRef.id,
          organizationRole: 'owner'
        });
      } catch (orgError) {
        console.error('Firestore organization error:', orgError);
        // Continue without organization
      }
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: userData.name,
        organizationName: userData.organizationName
      },
      firebaseUser: user
    };
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Handle specific Firebase errors
    let errorMessage = 'Erreur lors de la création du compte';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Cet email est déjà utilisé';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email invalide';
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = 'Domaine non autorisé. Vérifiez la configuration Firebase.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'L\'authentification par email/password n\'est pas activée dans Firebase';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    const enhancedError = new Error(errorMessage);
    enhancedError.code = error.code;
    throw enhancedError;
  }
};

/**
 * Sign in with email and password
 */
export const loginWithEmail = async (email, password) => {
  if (!isFirebaseReady()) {
    throw new Error('Firebase is not configured. Please check your environment variables.');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Try to update last login and get user data from Firestore
    let userData = null;
    let organizationData = null;
    
    try {
      // Update last login
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: serverTimestamp()
      });

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      userData = userDoc.exists() ? userDoc.data() : null;

      // Get organization data if user belongs to one
      if (userData?.organizationId) {
        const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
        organizationData = orgDoc.exists() ? { id: orgDoc.id, ...orgDoc.data() } : null;
      }
    } catch (firestoreError) {
      console.error('Firestore read error (login will continue):', firestoreError);
      // Continue with basic user info from Auth
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: userData?.name || user.displayName,
        organization: organizationData,
        organizationRole: userData?.organizationRole
      },
      firebaseUser: user
    };
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    let errorMessage = 'Erreur de connexion';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Aucun compte trouvé avec cet email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Mot de passe incorrect';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email invalide';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Email ou mot de passe incorrect';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Trop de tentatives. Réessayez plus tard';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'Ce compte a été désactivé';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    const enhancedError = new Error(errorMessage);
    enhancedError.code = error.code;
    throw enhancedError;
  }
};

/**
 * Sign in with Google
 */
export const loginWithGoogle = async () => {
  if (!isFirebaseReady()) {
    throw new Error('Firebase is not configured. Please check your environment variables.');
  }

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: user.displayName || '',
        photoURL: user.photoURL || '',
        organizationId: null,
        organizationRole: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } else {
      // Update last login
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: serverTimestamp()
      });
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL
      }
    };
  } catch (error) {
    console.error('Google login error:', error);
    throw new Error('Erreur lors de la connexion avec Google');
  }
};

/**
 * Sign out current user
 */
export const logout = async () => {
  if (!isFirebaseReady()) {
    throw new Error('Firebase is not configured');
  }

  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Erreur lors de la déconnexion');
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  if (!isFirebaseReady()) {
    throw new Error('Firebase is not configured');
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    
    let errorMessage = 'Erreur lors de l\'envoi de l\'email';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Aucun compte trouvé avec cet email';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email invalide';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
  if (!isFirebaseReady()) {
    return null;
  }
  return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
  if (!isFirebaseReady()) {
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      // Get organization data if exists
      let organizationData = null;
      if (userData?.organizationId) {
        const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
        organizationData = orgDoc.exists() ? { id: orgDoc.id, ...orgDoc.data() } : null;
      }

      callback({
        uid: user.uid,
        email: user.email,
        name: userData?.name || user.displayName,
        photoURL: userData?.photoURL || user.photoURL,
        organization: organizationData,
        organizationRole: userData?.organizationRole
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Join an organization with invite code
 */
export const joinOrganization = async (inviteCode) => {
  if (!isFirebaseReady()) {
    throw new Error('Firebase is not configured');
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    // Find organization by invite code
    const orgsQuery = query(
      collection(db, 'organizations'),
      where('inviteCode', '==', inviteCode)
    );
    const querySnapshot = await getDocs(orgsQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Code d\'invitation invalide');
    }

    const orgDoc = querySnapshot.docs[0];
    const orgData = orgDoc.data();

    // Add user to organization
    await updateDoc(doc(db, 'organizations', orgDoc.id), {
      members: [...(orgData.members || []), user.uid],
      updatedAt: serverTimestamp()
    });

    // Update user document
    await updateDoc(doc(db, 'users', user.uid), {
      organizationId: orgDoc.id,
      organizationRole: 'member',
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      organization: {
        id: orgDoc.id,
        name: orgData.name
      }
    };
  } catch (error) {
    console.error('Join organization error:', error);
    throw error;
  }
};

/**
 * Generate invite code for organization
 */
export const generateInviteCode = async (organizationId) => {
  if (!isFirebaseReady()) {
    throw new Error('Firebase is not configured');
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    // Generate unique code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Save to organization
    await updateDoc(doc(db, 'organizations', organizationId), {
      inviteCode: code,
      inviteCodeCreatedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return code;
  } catch (error) {
    console.error('Generate invite code error:', error);
    throw new Error('Erreur lors de la génération du code');
  }
};

export default {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  getCurrentUser,
  onAuthChange,
  joinOrganization,
  generateInviteCode,
  isFirebaseReady
};