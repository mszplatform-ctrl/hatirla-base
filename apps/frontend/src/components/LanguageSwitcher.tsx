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
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        fontSize: '14px',
        cursor: 'pointer',
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