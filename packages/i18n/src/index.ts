// packages/i18n/src/index.ts

import tr from "../locales/tr.json";
import en from "../locales/en.json";

type Locale = "tr" | "en";

let currentLanguage: Locale = "tr";

const messages: Record<Locale, any> = {
  tr,
  en,
};

export function setLanguage(lang: Locale) {
  currentLanguage = lang;
}

export function getCurrentLanguage() {
  return currentLanguage;
}

export function t(key: string): string {
  const parts = key.split(".");
  let value = messages[currentLanguage];

  for (const part of parts) {
    value = value?.[part];
    if (!value) return key;
  }

  return value;
}
