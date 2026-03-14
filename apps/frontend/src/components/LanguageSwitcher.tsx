/**
 * Language Switcher Component
 * Allows users to switch between supported languages
 */
import { getLang, setLang, type Lang } from '../i18n';

const languages: { code: Lang; label: string; flag: string }[] = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export function LanguageSwitcher() {
  const currentLang = getLang();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value as Lang);
    window.location.reload();
  };

  return (
    <select
      value={currentLang}
      onChange={handleChange}
      style={{
        padding: '7px 12px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '13px',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontWeight: 600,
        cursor: 'pointer',
        background: 'white',
        boxShadow: '0 2px 8px rgba(15,23,42,0.10)',
        color: '#0f172a',
        outline: 'none',
      }}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.label}
        </option>
      ))}
    </select>
  );
}