import { useState } from 'react';

const STORAGE_KEY = 'cookie_consent';

interface CookieConsentProps {
  onNavigate: (to: string) => void;
  lang: string;
}

const copy = {
  tr: {
    before: 'Bu siteyi kullanarak ',
    link: 'çerez politikamızı',
    after: ' kabul etmiş olursunuz.',
    button: 'Tamam',
  },
  en: {
    before: 'By using this site, you agree to our ',
    link: 'cookie policy',
    after: '.',
    button: 'OK',
  },
};

export function CookieConsent({ onNavigate, lang }: CookieConsentProps) {
  const [accepted, setAccepted] = useState(() => !!localStorage.getItem(STORAGE_KEY));

  if (accepted) return null;

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, '1');
    setAccepted(true);
  }

  const c = lang === 'en' ? copy.en : copy.tr;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9998,
      background: 'rgba(5,10,20,0.97)',
      borderTop: '1px solid rgba(45,212,191,0.2)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexWrap: 'wrap', gap: '10px 20px',
      padding: '14px 24px',
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    }}>
      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.5 }}>
        {c.before}
        <button
          onClick={() => onNavigate('privacy')}
          style={{ background: 'none', border: 'none', padding: 0, color: '#2dd4bf', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
        >
          {c.link}
        </button>
        {c.after}
      </span>
      <button
        onClick={handleAccept}
        style={{
          background: '#0f766e', color: 'white', border: 'none',
          padding: '8px 22px', borderRadius: '999px',
          cursor: 'pointer', fontWeight: 700, fontSize: '13px',
          fontFamily: 'inherit', flexShrink: 0,
        }}
      >
        {c.button}
      </button>
    </div>
  );
}
