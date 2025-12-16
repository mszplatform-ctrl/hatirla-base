/**
 * Language Switcher Component
 * Allows users to switch between supported languages
 */
import { getLang, setLang, type Lang } from '../i18n';

const languages: { code: Lang; label: string; flag: string; enabled: boolean }[] = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷", enabled: true },
  { code: "en", label: "English", flag: "🇬🇧", enabled: true },
  { code: "ar", label: "العربية", flag: "🇸🇦", enabled: false },
  { code: "es", label: "Español", flag: "🇪🇸", enabled: false },
  { code: "de", label: "Deutsch", flag: "🇩🇪", enabled: false },
  { code: "ru", label: "Русский", flag: "🇷🇺", enabled: false },
];

export function LanguageSwitcher() {
  const currentLang = getLang();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Lang;
    
    // Find selected language config
    const selectedLanguage = languages.find(lang => lang.code === newLang);
    
    // Guard: If language is disabled, show "Coming Soon" and return
    if (selectedLanguage && !selectedLanguage.enabled) {
      alert('🚧 Coming Soon!\n\nThis language will be available soon.');
      // Reset select to current language
      e.target.value = currentLang;
      return;
    }
    
    // Only change language if enabled
    setLang(newLang);
    window.location.reload(); // Reload to apply language change
  };

  return (
    <select
      value={currentLang}
      onChange={handleChange}
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        fontSize: '14px',
        cursor: 'pointer',
      }}
    >
      {languages.map((lang) => (
        <option 
          key={lang.code} 
          value={lang.code}
          disabled={!lang.enabled}
          style={{
            color: lang.enabled ? 'inherit' : '#999',
            fontStyle: lang.enabled ? 'normal' : 'italic'
          }}
        >
          {lang.flag} {lang.label} {!lang.enabled ? '(Coming Soon)' : ''}
        </option>
      ))}
    </select>
  );
}