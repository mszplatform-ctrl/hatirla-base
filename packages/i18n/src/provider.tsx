import { useEffect, useState } from "react";

type Lang = "tr" | "en";

let currentLang: Lang = "tr";
const listeners = new Set<(l: Lang) => void>();

export function getCurrentLanguage(): Lang {
  return currentLang;
}

export function setLanguage(lang: Lang) {
  currentLang = lang;
  listeners.forEach((fn) => fn(lang));
}

export function subscribeLanguage(fn: (l: Lang) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/**
 * 🔥 ÖNEMLİ KISIM
 * React useEffect boolean değil cleanup function ister
 */
export function useLanguageProvider() {
  const [lang, setLang] = useState<Lang>(getCurrentLanguage());

  useEffect(() => {
    const unsubscribe = subscribeLanguage(setLang);

    return () => {
      unsubscribe(); // ✅ cleanup function
    };
  }, []);

  return { lang, setLang: setLanguage };
}
