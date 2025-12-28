import React, { createContext, useContext, useState, useEffect } from 'react';
import { setLanguage as setI18nLanguage, getCurrentLanguage, subscribeLanguage, t } from './index';
import type { Locale } from './index';

interface I18nContextValue {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Locale>(getCurrentLanguage());

  useEffect(() => {
    // Subscribe to language changes from module-level state
    const unsubscribe = subscribeLanguage((newLang) => {
      setLanguageState(newLang);
    });
    return unsubscribe;
  }, []);

  const setLanguage = (lang: Locale) => {
    setI18nLanguage(lang); // Updates module state + notifies subscribers
  };

  const value = {
    language,
    setLanguage,
    t, // Same t() function but context triggers re-render
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
};