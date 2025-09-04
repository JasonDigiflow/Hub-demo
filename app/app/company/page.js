'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLocale } from '@/lib/contexts/LocaleContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import GlassCard from '@/components/ui/GlassCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function CompanyPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [companyData, setCompanyData] = useState({
    name: '',
    siret: '',
    siren: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'FR',
    naf: '',
    vatNumber: '',
    inviteCode: '',
    billingEmail: '',
    billingAddress: '',
    billingPostalCode: '',
    billingCity: '',
    billingCountry: 'FR'
  });

  useEffect(() => {
    loadCompanyData();
  }, [user]);

  const loadCompanyData = async () => {
    if (!user?.organizationId) {
      setLoading(false);
      return;
    }

    try {
      const orgDoc = await getDoc(doc(db, 'organizations', user.organizationId));
      if (orgDoc.exists()) {
        const data = orgDoc.data();
        setCompanyData(prev => ({
          ...prev,
          name: data.name || '',
          siret: data.siret || '',
          siren: data.siren || '',
          address: data.address || '',
          postalCode: data.postalCode || '',
          city: data.city || '',
          country: data.country || 'FR',
          naf: data.naf || '',
          vatNumber: data.vatNumber || '',
          inviteCode: data.inviteCode || '',
          billingEmail: data.billingEmail || user.email,
          billingAddress: data.billingAddress || data.address || '',
          billingPostalCode: data.billingPostalCode || data.postalCode || '',
          billingCity: data.billingCity || data.city || '',
          billingCountry: data.billingCountry || data.country || 'FR'
        }));
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      if (user?.organizationId) {
        await updateDoc(doc(db, 'organizations', user.organizationId), {
          ...companyData,
          updatedAt: new Date()
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving company data:', error);
    } finally {
      setSaving(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(companyData.inviteCode);
    alert(locale === 'fr' ? 'Code copié !' : 'Code copied!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          {locale === 'fr' ? 'Paramètres d\'entreprise' : 'Company Settings'}
        </h1>
        <p className="text-white/60">
          {locale === 'fr' 
            ? 'Gérez les informations de votre entreprise et vos paramètres de facturation'
            : 'Manage your company information and billing settings'
          }
        </p>
      </motion.div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg"
        >
          <p className="text-green-400">
            {locale === 'fr' ? '✓ Modifications enregistrées avec succès' : '✓ Changes saved successfully'}
          </p>
        </motion.div>
      )}

      {/* Company Information */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {locale === 'fr' ? 'Informations de l\'entreprise' : 'Company Information'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={locale === 'fr' ? 'Raison sociale' : 'Company Name'}
            name="name"
            value={companyData.name}
            onChange={handleChange}
            disabled={!!companyData.siret}
          />
          
          <Input
            label="SIRET"
            name="siret"
            value={companyData.siret}
            onChange={handleChange}
            disabled={true}
            className="font-mono"
          />
          
          <Input
            label={locale === 'fr' ? 'Adresse' : 'Address'}
            name="address"
            value={companyData.address}
            onChange={handleChange}
          />
          
          <Input
            label={locale === 'fr' ? 'Code NAF' : 'NAF Code'}
            name="naf"
            value={companyData.naf}
            onChange={handleChange}
            disabled={!!companyData.siret}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <Input
              label={locale === 'fr' ? 'Code postal' : 'Postal Code'}
              name="postalCode"
              value={companyData.postalCode}
              onChange={handleChange}
            />
            <Input
              label={locale === 'fr' ? 'Ville' : 'City'}
              name="city"
              value={companyData.city}
              onChange={handleChange}
            />
          </div>
          
          <Input
            label={locale === 'fr' ? 'N° TVA Intracommunautaire' : 'VAT Number'}
            name="vatNumber"
            value={companyData.vatNumber}
            onChange={handleChange}
            placeholder="FR12345678901"
          />
        </div>
      </GlassCard>

      {/* Billing Information */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {locale === 'fr' ? 'Informations de facturation' : 'Billing Information'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={locale === 'fr' ? 'Email de facturation' : 'Billing Email'}
            name="billingEmail"
            type="email"
            value={companyData.billingEmail}
            onChange={handleChange}
          />
          
          <div></div>
          
          <Input
            label={locale === 'fr' ? 'Adresse de facturation' : 'Billing Address'}
            name="billingAddress"
            value={companyData.billingAddress}
            onChange={handleChange}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <Input
              label={locale === 'fr' ? 'Code postal' : 'Postal Code'}
              name="billingPostalCode"
              value={companyData.billingPostalCode}
              onChange={handleChange}
            />
            <Input
              label={locale === 'fr' ? 'Ville' : 'City'}
              name="billingCity"
              value={companyData.billingCity}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="sameAddress"
            className="rounded border-white/20 bg-white/10 text-purple-500"
            onChange={(e) => {
              if (e.target.checked) {
                setCompanyData(prev => ({
                  ...prev,
                  billingAddress: prev.address,
                  billingPostalCode: prev.postalCode,
                  billingCity: prev.city,
                  billingCountry: prev.country
                }));
              }
            }}
          />
          <label htmlFor="sameAddress" className="text-white/60 text-sm">
            {locale === 'fr' 
              ? 'Utiliser l\'adresse de l\'entreprise pour la facturation'
              : 'Use company address for billing'
            }
          </label>
        </div>
      </GlassCard>

      {/* Invite Code */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {locale === 'fr' ? 'Code d\'invitation' : 'Invitation Code'}
        </h2>
        
        <p className="text-white/60 text-sm mb-4">
          {locale === 'fr'
            ? 'Partagez ce code avec vos collaborateurs pour qu\'ils rejoignent votre entreprise'
            : 'Share this code with your team members so they can join your company'
          }
        </p>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              value={companyData.inviteCode}
              disabled={true}
              className="font-mono text-lg"
            />
          </div>
          <Button
            onClick={copyInviteCode}
            variant="outline"
          >
            {locale === 'fr' ? 'Copier' : 'Copy'}
          </Button>
        </div>
      </GlassCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          variant="gradient"
          className="px-8"
        >
          {saving 
            ? (locale === 'fr' ? 'Enregistrement...' : 'Saving...')
            : (locale === 'fr' ? 'Enregistrer les modifications' : 'Save Changes')
          }
        </Button>
      </div>
    </div>
  );
}