import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Service pour gérer les avis dans Firestore
 */
export const reviewsService = {
  // Créer un nouvel avis
  async create(reviewData) {
    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Récupérer tous les avis d'une entreprise
  async getByBusiness(businessId) {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('businessId', '==', businessId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  // Mettre à jour une réponse
  async updateResponse(reviewId, response) {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        response,
        respondedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating response:', error);
      throw error;
    }
  },

  // Récupérer les statistiques
  async getStats(businessId) {
    try {
      const reviews = await this.getByBusiness(businessId);
      
      const stats = {
        total: reviews.length,
        avgRating: 0,
        responseRate: 0,
        sentiments: { positive: 0, neutral: 0, negative: 0 }
      };

      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        stats.avgRating = (totalRating / reviews.length).toFixed(1);
        
        const responded = reviews.filter(r => r.response).length;
        stats.responseRate = Math.round((responded / reviews.length) * 100);
        
        reviews.forEach(r => {
          if (r.rating >= 4) stats.sentiments.positive++;
          else if (r.rating <= 2) stats.sentiments.negative++;
          else stats.sentiments.neutral++;
        });
      }

      return stats;
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }
};

/**
 * Service pour gérer les posts Google Business
 */
export const postsService = {
  // Créer un nouveau post
  async create(postData) {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...postData,
        createdAt: serverTimestamp(),
        publishedAt: postData.scheduled ? null : serverTimestamp(),
        status: postData.scheduled ? 'scheduled' : 'published'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Récupérer les posts d'une entreprise
  async getByBusiness(businessId) {
    try {
      const q = query(
        collection(db, 'posts'),
        where('businessId', '==', businessId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }
};

/**
 * Service pour gérer les entreprises
 */
export const businessService = {
  // Créer une entreprise
  async create(businessData) {
    try {
      const docRef = await addDoc(collection(db, 'businesses'), {
        ...businessData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  },

  // Récupérer une entreprise par utilisateur
  async getByUser(userId) {
    try {
      const q = query(
        collection(db, 'businesses'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching businesses:', error);
      throw error;
    }
  },

  // Mettre à jour une entreprise
  async update(businessId, data) {
    try {
      await updateDoc(doc(db, 'businesses', businessId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating business:', error);
      throw error;
    }
  }
};

/**
 * Service pour gérer les campagnes de collecte d'avis
 */
export const campaignService = {
  // Créer une campagne
  async create(campaignData) {
    try {
      const docRef = await addDoc(collection(db, 'campaigns'), {
        ...campaignData,
        createdAt: serverTimestamp(),
        status: 'active',
        sent: 0,
        responses: 0
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  // Récupérer les campagnes
  async getByBusiness(businessId) {
    try {
      const q = query(
        collection(db, 'campaigns'),
        where('businessId', '==', businessId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  // Mettre à jour les stats d'une campagne
  async updateStats(campaignId, stats) {
    try {
      await updateDoc(doc(db, 'campaigns', campaignId), {
        ...stats,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating campaign stats:', error);
      throw error;
    }
  }
};