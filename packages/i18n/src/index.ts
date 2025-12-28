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
 * Internal listeners to notify React on language change
 */
type Listener = (lang: Locale) => void;
const listeners = new Set<Listener>();

export function subscribeLanguage(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Check if language is enabled (coming soon guard)
 */
export function isLangEnabled(lang: string): lang is Locale {
  return ENABLED_LANGS.includes(lang as Locale);
}

/**
 * Set active language (safe) + notify subscribers
 */
export function setLanguage(lang: Locale) {
  currentLanguage = lang;
  listeners.forEach((l) => l(currentLanguage));
}

/**
 * Get current language
 */
export function getCurrentLanguage(): Locale {
  return currentLanguage;
}

/**
 * Translation function with debug logging
 */
export function t(key: string): string {
  const parts = key.split(".");
  let value: any = messages[currentLanguage];
  
  for (const part of parts) {
    value = value?.[part];
    if (!value) {
      console.warn(`[i18n] Missing translation: "${key}" for language: "${currentLanguage}"`);
      return key;
    }
  }
  
  return value;
}

/**
 * Backward / frontend compatibility alias
 */
export function getLanguage(): Locale {
  return getCurrentLanguage();
}

export * from './provider';