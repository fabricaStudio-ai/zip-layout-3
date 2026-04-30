import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './useAuth';

export type PrivacySettings = {
  activationMethod: 'triple_tap' | 'floating_button' | 'keyboard_shortcut';
  fakeScreenType: 'calculator' | 'weather' | 'notes';
  pinCode?: string;
  password?: string;
};

const defaultSettings: PrivacySettings = {
  activationMethod: 'triple_tap',
  fakeScreenType: 'calculator',
};

export function usePrivacySettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const docRef = doc(db, 'privacy_settings', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSettings(docSnap.data() as PrivacySettings);
        } else {
          // Create default settings
          await setDoc(docRef, defaultSettings);
        }
      } catch (error) {
        console.error('Error loading privacy settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const updateSettings = async (newSettings: Partial<PrivacySettings>) => {
    if (!user) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      const docRef = doc(db, 'privacy_settings', user.uid);
      await setDoc(docRef, updatedSettings);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    }
  };

  return {
    settings,
    loading,
    updateSettings,
  };
}