'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLocale } from '@/lib/contexts/LocaleContext';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import GlassCard from '@/components/ui/GlassCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AccountPage() {
  const { user } = useAuth();
  const { t, locale, setLocale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    locale: locale
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'locale') {
      setLocale(value);
    }
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName
        });
      }

      // Update Firestore user document
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: profileData.displayName,
          phone: profileData.phone,
          locale: profileData.locale,
          updatedAt: new Date()
        });
      }

      setSuccess(locale === 'fr' ? 'Profil mis à jour avec succès' : 'Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(locale === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(locale === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError(locale === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères' : 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (user && user.email) {
        // Re-authenticate user
        const credential = EmailAuthProvider.credential(
          user.email,
          passwordData.currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, passwordData.newPassword);
        
        setSuccess(locale === 'fr' ? 'Mot de passe mis à jour avec succès' : 'Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        setError(locale === 'fr' ? 'Mot de passe actuel incorrect' : 'Current password is incorrect');
      } else {
        setError(locale === 'fr' ? 'Erreur lors de la mise à jour du mot de passe' : 'Error updating password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          {locale === 'fr' ? 'Mon compte' : 'My Account'}
        </h1>
        <p className="text-white/60">
          {locale === 'fr' 
            ? 'Gérez vos informations personnelles et vos paramètres de sécurité'
            : 'Manage your personal information and security settings'
          }
        </p>
      </motion.div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg"
        >
          <p className="text-green-400">✓ {success}</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
        >
          <p className="text-red-400">✗ {error}</p>
        </motion.div>
      )}

      {/* Profile Information */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {locale === 'fr' ? 'Informations personnelles' : 'Personal Information'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={locale === 'fr' ? 'Nom complet' : 'Full Name'}
            name="displayName"
            value={profileData.displayName}
            onChange={handleProfileChange}
          />
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={profileData.email}
            disabled={true}
            className="opacity-60"
          />
          
          <Input
            label={locale === 'fr' ? 'Téléphone' : 'Phone'}
            name="phone"
            type="tel"
            value={profileData.phone}
            onChange={handleProfileChange}
            placeholder="+33 6 12 34 56 78"
          />
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              {locale === 'fr' ? 'Langue' : 'Language'}
            </label>
            <select
              name="locale"
              value={profileData.locale}
              onChange={handleProfileChange}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleProfileSave}
            disabled={loading}
            variant="gradient"
          >
            {loading 
              ? (locale === 'fr' ? 'Enregistrement...' : 'Saving...')
              : (locale === 'fr' ? 'Enregistrer' : 'Save')
            }
          </Button>
        </div>
      </GlassCard>

      {/* Security */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {locale === 'fr' ? 'Sécurité' : 'Security'}
        </h2>
        
        <div className="space-y-4">
          <Input
            label={locale === 'fr' ? 'Mot de passe actuel' : 'Current Password'}
            name="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={locale === 'fr' ? 'Nouveau mot de passe' : 'New Password'}
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
            />
            
            <Input
              label={locale === 'fr' ? 'Confirmer le mot de passe' : 'Confirm Password'}
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
            />
          </div>
          
          <p className="text-white/40 text-sm">
            {locale === 'fr' 
              ? 'Le mot de passe doit contenir au moins 8 caractères'
              : 'Password must be at least 8 characters'
            }
          </p>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handlePasswordUpdate}
            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
            variant="gradient"
          >
            {loading 
              ? (locale === 'fr' ? 'Mise à jour...' : 'Updating...')
              : (locale === 'fr' ? 'Mettre à jour' : 'Update')
            }
          </Button>
        </div>
      </GlassCard>

      {/* Account Actions */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {locale === 'fr' ? 'Actions du compte' : 'Account Actions'}
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-white font-medium">
                {locale === 'fr' ? 'Exporter mes données' : 'Export my data'}
              </p>
              <p className="text-white/60 text-sm">
                {locale === 'fr' 
                  ? 'Téléchargez une copie de toutes vos données'
                  : 'Download a copy of all your data'
                }
              </p>
            </div>
            <Button variant="outline">
              {locale === 'fr' ? 'Exporter' : 'Export'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <div>
              <p className="text-white font-medium">
                {locale === 'fr' ? 'Supprimer mon compte' : 'Delete my account'}
              </p>
              <p className="text-white/60 text-sm">
                {locale === 'fr' 
                  ? 'Cette action est irréversible'
                  : 'This action cannot be undone'
                }
              </p>
            </div>
            <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/20">
              {locale === 'fr' ? 'Supprimer' : 'Delete'}
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}