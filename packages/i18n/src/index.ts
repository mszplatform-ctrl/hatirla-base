// packages/i18n/src/index.ts

import tr from "../locales/tr.json";
import en from "../locales/en.json";

/**
 * Enabled languages (beta lock)
 * Only these are allowed to be used by logic & requests
 */
export const ENABLED_LANGS = ["tr", "en"] as const;
export type Locale = (typeof ENABLED_LANGS)[number];

let currentLanguage: Locale = "tr";

const messages: Record<Locale, any> = {
  tr,
  en,
};

/**
 * Check if language is enabled (coming soon guard)
 */
export function isLangEnabled(lang: string): lang is Locale {
  return ENABLED_LANGS.includes(lang as Locale);
}

/**
 * Set active language (safe)
 */
export function setLanguage(lang: Locale) {
  currentLanguage = lang;
}

/**
 * Get current language
 */
export function getCurrentLanguage(): Locale {
  return currentLanguage;
}

/**
 * Translation function
 */
export function t(key: string): string {
  const parts = key.split(".");
  let value: any = messages[currentLanguage];

  for (const part of parts) {
    value = value?.[part];
    if (!value) return key;
  }

  return value;
}
