import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentLanguage, setLanguage, subscribeLanguage } from "@packages/i18n";

type Lang = "tr" | "en";

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
} | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getCurrentLanguage());

  useEffect(() => {
    // localStorage'dan yükle
    const saved = localStorage.getItem("xotiji_lang") as Lang | null;
    if (saved === "tr" || saved === "en") {
      setLanguage(saved);
      setLangState(saved);
    }

    // Subscribe to language changes - BU EKSİKTİ!
    const unsubscribe = subscribeLanguage((newLang) => {
      setLangState(newLang as Lang);
    });

    return unsubscribe;
  }, []);

  const setLang = (l: Lang) => {
    setLanguage(l);  // Bu zaten subscribers'ı notify ediyor
    localStorage.setItem("xotiji_lang", l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}