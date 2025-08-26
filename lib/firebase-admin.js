// Firebase Admin using Client SDK for Vercel
// This uses the client SDK on the server side since firebase-admin requires service account

import { initializeApp, getApps, cert } from 'firebase/app';
import { 
  getFirestore, 
  collection as firestoreCollection,
  doc as firestoreDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase app for server use
let app;
let firestore;

// Check if Firebase config is complete
const requiredFields = ['apiKey', 'authDomain', 'projectId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  console.log('Firebase config status:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
    projectId: firebaseConfig.projectId || 'NOT_SET'
  });
  console.error('Firebase not configured - missing:', missingFields);
} else {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig, 'admin');
      console.log('Firebase Admin initialized with project:', firebaseConfig.projectId);
    } else {
      app = getApps().find(app => app.name === 'admin') || getApps()[0];
      console.log('Firebase Admin already initialized');
    }
    firestore = getFirestore(app);
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
  }
}

// Wrapper to match firebase-admin API
class FirebaseAdminWrapper {
  collection(name) {
    return new CollectionWrapper(name);
  }

  batch() {
    if (!firestore) {
      console.error('Firestore not initialized for batch');
      // Return a mock batch that does nothing
      return {
        set: () => {},
        update: () => {},
        delete: () => {},
        commit: async () => {
          console.log('Mock batch commit (Firestore not initialized)');
          return Promise.resolve();
        }
      };
    }
    
    const batch = writeBatch(firestore);
    
    // Wrap the batch to match firebase-admin API
    return {
      set: (docRef, data) => {
        if (docRef && docRef.docRef) {
          batch.set(docRef.docRef, data);
        } else {
          console.warn('Batch set: invalid docRef', docRef);
        }
      },
      update: (docRef, data) => {
        if (docRef && docRef.docRef) {
          batch.update(docRef.docRef, data);
        } else {
          console.warn('Batch update: invalid docRef', docRef);
        }
      },
      delete: (docRef) => {
        if (docRef && docRef.docRef) {
          batch.delete(docRef.docRef);
        } else {
          console.warn('Batch delete: invalid docRef', docRef);
        }
      },
      commit: async () => {
        try {
          await batch.commit();
          console.log('Batch committed successfully');
        } catch (error) {
          console.error('Batch commit error:', error);
          throw error;
        }
      }
    };
  }
}

class CollectionWrapper {
  constructor(name) {
    this.name = name;
    this.collectionRef = firestore ? firestoreCollection(firestore, name) : null;
  }

  doc(id) {
    if (!this.collectionRef) {
      return new DocumentWrapper(null, id, this.name);
    }
    
    if (!id) {
      // Auto-generate ID
      const docRef = firestoreDoc(this.collectionRef);
      return new DocumentWrapper(docRef, docRef.id, this.name);
    }
    
    const docRef = firestoreDoc(this.collectionRef, id);
    return new DocumentWrapper(docRef, id, this.name);
  }

  where(field, operator, value) {
    if (!this.collectionRef) {
      return new QueryWrapper(null);
    }
    
    const q = query(this.collectionRef, where(field, operator, value));
    return new QueryWrapper(q);
  }

  async add(data) {
    if (!this.collectionRef) {
      return { id: 'mock_' + Date.now() };
    }
    
    try {
      const docRef = await addDoc(this.collectionRef, {
        ...data,
        createdAt: data.createdAt || new Date().toISOString()
      });
      return { id: docRef.id };
    } catch (error) {
      console.error('Error adding document:', error);
      return { id: 'error_' + Date.now() };
    }
  }
}

// SubCollection wrapper for nested collections
class SubCollectionWrapper extends CollectionWrapper {
  constructor(name, collectionRef, fullPath) {
    super(name);
    this.collectionRef = collectionRef;
    this.fullPath = fullPath;
  }
  
  doc(id) {
    if (!this.collectionRef) {
      return new DocumentWrapper(null, id, this.fullPath);
    }
    
    if (!id) {
      // Auto-generate ID
      const docRef = firestoreDoc(this.collectionRef);
      return new DocumentWrapper(docRef, docRef.id, this.fullPath);
    }
    
    const docRef = firestoreDoc(this.collectionRef, id);
    return new DocumentWrapper(docRef, id, this.fullPath);
  }
  
  async get() {
    if (!this.collectionRef) {
      console.log('SubCollectionWrapper.get() - No collectionRef, returning empty result');
      return {
        empty: true,
        size: 0,
        docs: [],
        forEach: () => {}
      };
    }
    
    try {
      const querySnap = await getDocs(this.collectionRef);
      console.log(`SubCollectionWrapper.get() - Found ${querySnap.size} documents in ${this.fullPath}`);
      
      return {
        empty: querySnap.empty,
        size: querySnap.size,
        docs: querySnap.docs.map(doc => ({
          ...doc,
          id: doc.id,
          data: () => doc.data()
        })),
        forEach: (callback) => querySnap.forEach(callback)
      };
    } catch (error) {
      console.error('Error getting subcollection:', error);
      return {
        empty: true,
        size: 0,
        docs: [],
        forEach: () => {}
      };
    }
  }
}

class DocumentWrapper {
  constructor(docRef, id, parentPath = null) {
    this.docRef = docRef;
    this.id = id;
    this.parentPath = parentPath;
  }
  
  // Add support for subcollections
  collection(name) {
    if (!firestore) {
      console.log('Firestore not initialized for subcollection');
      return new CollectionWrapper(null);
    }
    
    // Build the full path for the subcollection
    const fullPath = this.parentPath 
      ? `${this.parentPath}/${this.id}/${name}`
      : `${this.id}/${name}`;
    
    // Create subcollection reference
    const subCollectionRef = this.docRef 
      ? firestoreCollection(this.docRef, name)
      : firestoreCollection(firestore, fullPath);
    
    // Return a new CollectionWrapper for the subcollection
    return new SubCollectionWrapper(name, subCollectionRef, fullPath);
  }

  async get() {
    if (!this.docRef) {
      return {
        exists: false,
        data: () => null,
        id: this.id
      };
    }
    
    try {
      const docSnap = await getDoc(this.docRef);
      return {
        exists: docSnap.exists(),
        data: () => docSnap.data(),
        id: docSnap.id
      };
    } catch (error) {
      console.error('Error getting document:', error);
      return {
        exists: false,
        data: () => null,
        id: this.id
      };
    }
  }

  async set(data) {
    if (!this.docRef) return this;
    
    try {
      await setDoc(this.docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error setting document:', error);
    }
    return this;
  }

  async update(data) {
    if (!this.docRef) return this;
    
    try {
      await updateDoc(this.docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating document:', error);
    }
    return this;
  }

  async delete() {
    if (!this.docRef) return this;
    
    try {
      await deleteDoc(this.docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
    return this;
  }
}

class QueryWrapper {
  constructor(queryRef) {
    this.queryRef = queryRef;
    this.constraints = [];
  }

  where(field, operator, value) {
    if (!this.queryRef) return this;
    
    this.constraints.push(where(field, operator, value));
    return this;
  }

  orderBy(field, direction = 'asc') {
    if (!this.queryRef) return this;
    
    this.constraints.push(orderBy(field, direction));
    return this;
  }

  limit(n) {
    if (!this.queryRef) return this;
    
    this.constraints.push(limit(n));
    return this;
  }

  async get() {
    if (!this.queryRef) {
      console.log('QueryWrapper.get() - No queryRef, returning empty result');
      return {
        empty: true,
        size: 0,
        docs: [],
        forEach: () => {}
      };
    }
    
    try {
      // Get the original collection from the query
      const querySnap = await getDocs(this.queryRef);
      
      console.log(`QueryWrapper.get() - Query executed, found ${querySnap.size} documents`);
      
      return {
        empty: querySnap.empty,
        size: querySnap.size,
        docs: querySnap.docs,
        forEach: (callback) => querySnap.forEach(callback)
      };
    } catch (error) {
      console.error('Error executing query:', error);
      return {
        empty: true,
        size: 0,
        docs: [],
        forEach: () => {}
      };
    }
  }
}

// Export wrapper instance
const db = new FirebaseAdminWrapper();

export { db };