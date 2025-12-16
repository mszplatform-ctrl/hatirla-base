/**
 * i18n Configuration
 * 
 * Supported Languages:
 * - Active: TR, EN
 * - Passive (infrastructure ready): AR, ES, DE, RU
 */

const i18nConfig = {
  defaultLocale: 'tr',
  locales: ['tr', 'en', 'ar', 'es', 'de', 'ru'],
  activeLocales: ['tr', 'en'],
  passiveLocales: ['ar', 'es', 'de', 'ru'],
  
  // Language metadata
  languages: {
    tr: { name: 'Türkçe', nativeName: 'Türkçe', flag: '🇹🇷', active: true },
    en: { name: 'English', nativeName: 'English', flag: '🇬🇧', active: true },
    ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', active: false },
    es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', active: false },
    de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', active: false },
    ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', active: false }
  }
};

module.exports = i18nConfig;