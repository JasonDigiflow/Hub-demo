import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';

const COLLECTION_NAME = 'aids_prospects';

// Créer ou mettre à jour un prospect
export async function saveProspect(prospect, userId) {
  try {
    if (prospect.id && prospect.id.startsWith('LEAD_')) {
      // Pour les leads Meta, utiliser setDoc pour éviter les doublons
      const docRef = doc(db, COLLECTION_NAME, prospect.id);
      await setDoc(docRef, {
        ...prospect,
        userId,
        updatedAt: serverTimestamp(),
        createdAt: prospect.createdAt || serverTimestamp()
      }, { merge: true });
      return prospect.id;
    } else if (prospect.id) {
      // Mise à jour
      const docRef = doc(db, COLLECTION_NAME, prospect.id);
      await updateDoc(docRef, {
        ...prospect,
        userId,
        updatedAt: serverTimestamp()
      });
      return prospect.id;
    } else {
      // Création
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...prospect,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving prospect:', error);
    throw error;
  }
}

// Récupérer tous les prospects d'un utilisateur
export async function getProspects(userId) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const prospects = [];
    
    querySnapshot.forEach((doc) => {
      prospects.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return prospects;
  } catch (error) {
    console.error('Error getting prospects:', error);
    // Si l'index n'existe pas encore, retourner un tableau vide
    if (error.code === 'failed-precondition') {
      console.log('Index not yet created, returning empty array');
      return [];
    }
    throw error;
  }
}

// Supprimer un prospect
export async function deleteProspect(prospectId) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, prospectId));
  } catch (error) {
    console.error('Error deleting prospect:', error);
    throw error;
  }
}

// Sauvegarder plusieurs prospects en batch (pour l'import Meta)
export async function saveProspectsBatch(prospects, userId) {
  try {
    const promises = prospects.map(prospect => 
      saveProspect(prospect, userId)
    );
    
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Error saving prospects batch:', error);
    throw error;
  }
}

// Vérifier si des prospects existent déjà (par leurs IDs)
export async function checkExistingProspects(prospectIds, userId) {
  try {
    const existingIds = new Set();
    
    // Diviser en chunks de 10 (limite Firestore pour 'in' queries)
    const chunks = [];
    for (let i = 0; i < prospectIds.length; i += 10) {
      chunks.push(prospectIds.slice(i, i + 10));
    }
    
    for (const chunk of chunks) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('id', 'in', chunk)
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        existingIds.add(doc.id);
      });
    }
    
    return existingIds;
  } catch (error) {
    console.error('Error checking existing prospects:', error);
    return new Set();
  }
}