import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../api/axios';

interface TranslationData {
  [key: string]: {
    en: string;
    de: string;
  };
}

interface TranslationContextType {
  t: (key: string) => string;
  language: 'en' | 'de';
  setLanguage: (lang: 'en' | 'de') => void;
  loading: boolean;
  refreshTranslations: () => Promise<void>;
}

export const TranslationContext = createContext<TranslationContextType | null>(null);

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [translations, setTranslations] = useState<TranslationData>({});
  const [language, setLanguageState] = useState<'en' | 'de'>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'en' || savedLang === 'de') {
      setLanguageState(savedLang);
    }
    refreshTranslations();
  }, []);

  const setLanguage = (lang: 'en' | 'de') => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const refreshTranslations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/translations/');
      const newTranslations: TranslationData = {};
      response.data.forEach((item: { key: string, en: string, de: string }) => {
        newTranslations[item.key] = { en: item.en || '', de: item.de || '' };
      });
      setTranslations(newTranslations);
    } catch (error) {
      console.error("Failed to fetch translations", error);
    } finally {
      setLoading(false);
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      return key; // Fallback to the key itself if missing
    }
    return translation[language] || key;
  };

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage, loading, refreshTranslations }}>
      {children}
    </TranslationContext.Provider>
  );
};
