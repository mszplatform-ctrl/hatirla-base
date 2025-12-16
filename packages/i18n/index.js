/**
 * i18n - Internationalization Module
 * 
 * Provides translation functionality for XOTIJI
 * Supports: TR (active), EN (active), AR/ES/DE/RU (passive)
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

// Load all locale files
const translations = {};

config.locales.forEach(locale => {
  const filePath = path.join(__dirname, 'locales', `${locale}.json`);
  try {
    translations[locale] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.warn(`[i18n] Failed to load ${locale}.json:`, err.message);
    translations[locale] = {};
  }
});

/**
 * Get translation for a key
 * @param {string} key - Translation key (e.g., 'common.welcome')
 * @param {string} locale - Language code (default: 'tr')
 * @returns {string} Translated text or key if not found
 */
function t(key, locale = config.defaultLocale) {
  const keys = key.split('.');
  let value = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      break;
    }
  }
  
  // Fallback to default locale if translation not found
  if (!value && locale !== config.defaultLocale) {
    return t(key, config.defaultLocale);
  }
  
  return value || key;
}

/**
 * Get all translations for a locale
 * @param {string} locale - Language code
 * @returns {object} All translations
 */
function getTranslations(locale = config.defaultLocale) {
  return translations[locale] || translations[config.defaultLocale];
}

/**
 * Check if locale is active
 * @param {string} locale - Language code
 * @returns {boolean}
 */
function isActiveLocale(locale) {
  return config.activeLocales.includes(locale);
}

module.exports = {
  t,
  getTranslations,
  isActiveLocale,
  config,
  translations
};