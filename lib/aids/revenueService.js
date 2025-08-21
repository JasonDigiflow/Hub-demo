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
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Fallback to in-memory storage if Firebase is not configured
let inMemoryRevenues = [];

/**
 * Revenue service for AIDs - manages client revenue tracking
 */
export const revenueService = {
  // Check if Firebase is available
  isFirebaseAvailable() {
    return db !== null;
  },

  // Create a new revenue entry
  async create(revenueData) {
    if (!this.isFirebaseAvailable()) {
      // Fallback to in-memory
      const newRevenue = {
        ...revenueData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      inMemoryRevenues.push(newRevenue);
      return newRevenue.id;
    }

    try {
      const docRef = await addDoc(collection(db, 'aids_revenues'), {
        ...revenueData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating revenue:', error);
      throw error;
    }
  },

  // Get all revenues for a user/organization
  async getAll(userId) {
    if (!this.isFirebaseAvailable()) {
      // Return in-memory data
      return inMemoryRevenues.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
    }

    try {
      const q = query(
        collection(db, 'aids_revenues'),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching revenues:', error);
      // Fallback to empty array instead of throwing
      return [];
    }
  },

  // Update a revenue entry
  async update(revenueId, updateData) {
    if (!this.isFirebaseAvailable()) {
      // Update in-memory
      const index = inMemoryRevenues.findIndex(r => r.id === revenueId);
      if (index !== -1) {
        inMemoryRevenues[index] = {
          ...inMemoryRevenues[index],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        return true;
      }
      return false;
    }

    try {
      await updateDoc(doc(db, 'aids_revenues', revenueId), {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating revenue:', error);
      throw error;
    }
  },

  // Delete a revenue entry
  async delete(revenueId) {
    if (!this.isFirebaseAvailable()) {
      // Delete from in-memory
      const index = inMemoryRevenues.findIndex(r => r.id === revenueId);
      if (index !== -1) {
        inMemoryRevenues.splice(index, 1);
        return true;
      }
      return false;
    }

    try {
      await deleteDoc(doc(db, 'aids_revenues', revenueId));
      return true;
    } catch (error) {
      console.error('Error deleting revenue:', error);
      throw error;
    }
  },

  // Calculate statistics
  async getStats(userId) {
    const revenues = await this.getAll(userId);
    
    const totalRevenue = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const uniqueClients = new Set(revenues.map(r => r.clientId)).size;
    const averageTicket = uniqueClients > 0 ? totalRevenue / uniqueClients : 0;
    
    // Calculate monthly revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenues = revenues.filter(r => {
      const date = new Date(r.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    const monthlyTotal = monthlyRevenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    // Calculate growth (compare to last month)
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthRevenues = revenues.filter(r => {
      const date = new Date(r.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });
    const lastMonthTotal = lastMonthRevenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    const monthlyGrowth = lastMonthTotal > 0 
      ? ((monthlyTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
      : 0;

    return {
      totalRevenue,
      totalClients: uniqueClients,
      averageTicket,
      monthlyGrowth: parseFloat(monthlyGrowth),
      monthlyRevenue: monthlyTotal,
      revenueCount: revenues.length
    };
  },

  // Get revenues by campaign
  async getByCampaign(campaignId) {
    if (!this.isFirebaseAvailable()) {
      return inMemoryRevenues.filter(r => r.campaignId === campaignId);
    }

    try {
      const q = query(
        collection(db, 'aids_revenues'),
        where('campaignId', '==', campaignId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching revenues by campaign:', error);
      return [];
    }
  }
};

export default revenueService;