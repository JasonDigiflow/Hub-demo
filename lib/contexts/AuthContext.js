'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, isDemo } from '@/lib/firebase';

// Conditional imports for Firebase auth functions
let onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile;
let doc, setDoc, getDoc, serverTimestamp;

if (!isDemo && auth) {
  const authModule = require('firebase/auth');
  onAuthStateChanged = authModule.onAuthStateChanged;
  signInWithEmailAndPassword = authModule.signInWithEmailAndPassword;
  createUserWithEmailAndPassword = authModule.createUserWithEmailAndPassword;
  signOut = authModule.signOut;
  sendPasswordResetEmail = authModule.sendPasswordResetEmail;
  updateProfile = authModule.updateProfile;
  
  const firestoreModule = require('firebase/firestore');
  doc = firestoreModule.doc;
  getDoc = firestoreModule.getDoc;
  setDoc = firestoreModule.setDoc;
  serverTimestamp = firestoreModule.serverTimestamp;
}

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In demo mode, skip Firebase auth
    if (isDemo || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          ...userData
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up function
  const signup = async (email, password, displayName) => {
    if (isDemo) {
      // Demo mode - return mock user
      const mockUser = {
        uid: 'demo-user',
        email,
        displayName,
        role: 'user'
      };
      setUser(mockUser);
      return mockUser;
    }

    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        displayName,
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    if (isDemo) {
      // Demo mode - return mock user
      const mockUser = {
        uid: 'demo-user',
        email,
        displayName: 'Demo User',
        role: 'user'
      };
      setUser(mockUser);
      return mockUser;
    }

    try {
      setError(null);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    if (isDemo) {
      setUser(null);
      return;
    }

    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    if (isDemo) {
      // Demo mode - just simulate success
      return;
    }

    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};