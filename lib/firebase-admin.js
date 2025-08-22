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
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase app for server use
let app;
let firestore;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig, 'admin');
  } else {
    app = getApps().find(app => app.name === 'admin') || getApps()[0];
  }
  firestore = getFirestore(app);
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
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
        }
      },
      update: (docRef, data) => {
        if (docRef && docRef.docRef) {
          batch.update(docRef.docRef, data);
        }
      },
      delete: (docRef) => {
        if (docRef && docRef.docRef) {
          batch.delete(docRef.docRef);
        }
      },
      commit: () => batch.commit()
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
      return new DocumentWrapper(null, id);
    }
    
    if (!id) {
      // Auto-generate ID
      const docRef = firestoreDoc(this.collectionRef);
      return new DocumentWrapper(docRef, docRef.id);
    }
    
    const docRef = firestoreDoc(this.collectionRef, id);
    return new DocumentWrapper(docRef, id);
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

class DocumentWrapper {
  constructor(docRef, id) {
    this.docRef = docRef;
    this.id = id;
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