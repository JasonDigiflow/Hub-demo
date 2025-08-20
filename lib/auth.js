import { DEFAULT_ACCOUNT } from './constants';

export const initializeAuth = () => {
  if (typeof window === 'undefined') return;
  
  const existingAccount = localStorage.getItem('defaultAccount');
  if (!existingAccount) {
    localStorage.setItem('defaultAccount', JSON.stringify(DEFAULT_ACCOUNT));
  }
};

export const login = (email, password) => {
  const account = JSON.parse(localStorage.getItem('defaultAccount') || '{}');
  
  if (account.email === email && account.password === password) {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', JSON.stringify(account));
    return { success: true, user: account };
  }
  
  return { success: false, error: 'Email ou mot de passe incorrect' };
};

export const register = (userData) => {
  const newUser = {
    ...userData,
    organization: {
      name: userData.organizationName,
      id: `org_${Date.now()}`,
      role: 'owner',
      members: 1
    }
  };
  
  localStorage.setItem('defaultAccount', JSON.stringify(newUser));
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  
  return { success: true, user: newUser };
};

export const logout = () => {
  localStorage.setItem('isAuthenticated', 'false');
  localStorage.removeItem('currentUser');
};

export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const joinOrganization = (inviteCode) => {
  const validCodes = {
    'BHY123': { name: 'Behype', id: 'org_001' },
    'DGF456': { name: 'DigiFlow', id: 'org_002' }
  };
  
  if (validCodes[inviteCode]) {
    const user = getCurrentUser();
    if (user) {
      user.organization = {
        ...validCodes[inviteCode],
        role: 'member'
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, organization: validCodes[inviteCode] };
    }
  }
  
  return { success: false, error: 'Code d\'invitation invalide' };
};

export const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};