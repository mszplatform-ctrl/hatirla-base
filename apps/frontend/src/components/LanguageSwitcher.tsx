import React from "react";
import { useLanguage } from "../i18n/LanguageProvider";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as any)}
      style={{
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "14px",
        cursor: "pointer",
      }}
    >
      <option value="tr">🇹🇷 Türkçe</option>
      <option value="en">🇬🇧 English</option>
      <option value="ar" disabled>🇸🇦 العربية (Coming Soon)</option>
      <option value="es" disabled>🇪🇸 Español (Coming Soon)</option>
      <option value="de" disabled>🇩🇪 Deutsch (Coming Soon)</option>
      <option value="ru" disabled>🇷🇺 Русский (Coming Soon)</option>
    </select>
  );
}
