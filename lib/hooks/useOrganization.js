import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase-client';
import { 
  doc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

// ============= CONTEXT =============

const OrganizationContext = createContext({});

export function OrganizationProvider({ children }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [userOrgs, setUserOrgs] = useState([]);
  const [currentOrgId, setCurrentOrgId] = useState(null);
  const [memberRole, setMemberRole] = useState(null);

  // Charger les organisations de l'utilisateur
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    async function loadUserOrgs() {
      try {
        // Récupérer le document utilisateur
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let userData = userDoc.data();
        
        // Si le document n'existe pas, le créer
        if (!userDoc.exists()) {
          userData = {
            email: user.email,
            name: user.displayName || user.email?.split('@')[0],
            photoURL: user.photoURL,
            orgIds: [],
            primaryOrgId: null,
            createdAt: serverTimestamp()
          };
          await setDoc(doc(db, 'users', user.uid), userData);
        }

        // Si l'utilisateur n'a pas d'organisation, en créer une par défaut
        if (!userData.orgIds || userData.orgIds.length === 0) {
          const newOrgId = await createDefaultOrganization(user);
          userData.orgIds = [newOrgId];
          userData.primaryOrgId = newOrgId;
          await updateDoc(doc(db, 'users', user.uid), {
            orgIds: [newOrgId],
            primaryOrgId: newOrgId
          });
        }

        setUserOrgs(userData.orgIds || []);
        setCurrentOrgId(userData.primaryOrgId || userData.orgIds[0]);
      } catch (error) {
        console.error('Error loading user organizations:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserOrgs();
  }, [user]);

  // Charger l'organisation courante
  useEffect(() => {
    if (!currentOrgId || !user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, 'organizations', currentOrgId),
      async (snapshot) => {
        if (snapshot.exists()) {
          const orgData = { id: snapshot.id, ...snapshot.data() };
          setOrganization(orgData);
          
          // Récupérer le rôle du membre
          const memberDoc = await getDoc(
            doc(db, 'organizations', currentOrgId, 'members', user.uid)
          );
          if (memberDoc.exists()) {
            setMemberRole(memberDoc.data().role);
          }
        }
      },
      (error) => {
        console.error('Error loading organization:', error);
      }
    );

    return () => unsubscribe();
  }, [currentOrgId, user]);

  // Créer une organisation par défaut
  async function createDefaultOrganization(user) {
    try {
      const orgName = user.email?.split('@')[0] || 'Mon Organisation';
      const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Créer l'organisation
      const orgRef = await addDoc(collection(db, 'organizations'), {
        name: orgName,
        slug: orgSlug,
        owner: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        subscription: {
          plan: 'free',
          status: 'active'
        },
        limits: {
          maxMembers: 5,
          maxAdAccounts: 3,
          maxProspects: 1000
        }
      });

      // Ajouter l'utilisateur comme admin
      await setDoc(
        doc(db, 'organizations', orgRef.id, 'members', user.uid),
        {
          uid: user.uid,
          role: 'admin',
          invitedBy: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
          acceptedAt: serverTimestamp()
        }
      );

      return orgRef.id;
    } catch (error) {
      console.error('Error creating default organization:', error);
      throw error;
    }
  }

  // Changer d'organisation
  async function switchOrganization(orgId) {
    if (!userOrgs.includes(orgId)) {
      throw new Error('You are not a member of this organization');
    }
    
    setCurrentOrgId(orgId);
    
    // Mettre à jour l'organisation principale de l'utilisateur
    await updateDoc(doc(db, 'users', user.uid), {
      primaryOrgId: orgId
    });
  }

  const value = {
    organization,
    userOrgs,
    currentOrgId,
    memberRole,
    loading,
    switchOrganization,
    isAdmin: memberRole === 'admin',
    isMember: memberRole === 'member' || memberRole === 'admin',
    isViewer: memberRole === 'viewer'
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

// ============= HOOKS =============

/**
 * Hook principal pour accéder au contexte organisation
 */
export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}

/**
 * Hook pour récupérer les ad accounts de l'organisation
 */
export function useAdAccounts() {
  const { currentOrgId } = useOrganization();
  const [adAccounts, setAdAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrgId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'organizations', currentOrgId, 'adAccounts'),
        orderBy('createdAt', 'desc')
      ),
      (snapshot) => {
        const accounts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAdAccounts(accounts);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading ad accounts:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentOrgId]);

  return { adAccounts, loading };
}

/**
 * Hook pour récupérer les prospects d'un ad account
 */
export function useProspects(adAccountId) {
  const { currentOrgId } = useOrganization();
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrgId || !adAccountId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'organizations', currentOrgId, 'adAccounts', adAccountId, 'prospects'),
        orderBy('createdAt', 'desc'),
        limit(500)
      ),
      (snapshot) => {
        const prospectsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProspects(prospectsList);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading prospects:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentOrgId, adAccountId]);

  return { prospects, loading };
}

/**
 * Hook pour récupérer les insights d'un ad account
 */
export function useInsights(adAccountId, dateRange = 30) {
  const { currentOrgId } = useOrganization();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    spend: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0
  });

  useEffect(() => {
    if (!currentOrgId || !adAccountId) {
      setLoading(false);
      return;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'organizations', currentOrgId, 'adAccounts', adAccountId, 'insightsDaily'),
        where('date', '>=', startDate),
        orderBy('date', 'desc')
      ),
      (snapshot) => {
        const insightsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculer les totaux
        const totals = insightsList.reduce((acc, insight) => ({
          spend: acc.spend + (insight.spendCents || 0),
          impressions: acc.impressions + (insight.impressions || 0),
          clicks: acc.clicks + (insight.clicks || 0),
          conversions: acc.conversions + (insight.conversions || 0)
        }), { spend: 0, impressions: 0, clicks: 0, conversions: 0 });
        
        setInsights(insightsList);
        setTotals(totals);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading insights:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentOrgId, adAccountId, dateRange]);

  return { insights, totals, loading };
}

/**
 * Hook pour récupérer les revenus
 */
export function useRevenues(adAccountId, dateRange = 30) {
  const { currentOrgId } = useOrganization();
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (!currentOrgId || !adAccountId) {
      setLoading(false);
      return;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'organizations', currentOrgId, 'adAccounts', adAccountId, 'revenues'),
        where('date', '>=', startDate),
        orderBy('date', 'desc')
      ),
      (snapshot) => {
        const revenuesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculer le total
        const total = revenuesList.reduce((acc, rev) => 
          acc + (rev.amountCents || 0), 0
        );
        
        setRevenues(revenuesList);
        setTotalRevenue(total);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading revenues:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentOrgId, adAccountId, dateRange]);

  return { revenues, totalRevenue, loading };
}

/**
 * Hook pour les membres de l'organisation
 */
export function useMembers() {
  const { currentOrgId } = useOrganization();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrgId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'organizations', currentOrgId, 'members'),
      (snapshot) => {
        const membersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMembers(membersList);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading members:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentOrgId]);

  return { members, loading };
}