import { useEffect } from 'react';
import { t, getLang } from '../../i18n';

type ContactProps = {
  onBack: () => void;
};

const socials = [
  {
    name: 'Instagram',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    handle: '@xotijiapp',
    href: 'https://instagram.com/xotijiapp',
  },
  {
    name: 'X / Twitter',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    handle: '@xotijiapp',
    href: 'https://x.com/xotijiapp',
  },
  {
    name: 'TikTok',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
    handle: '@xotijiapp',
    href: 'https://tiktok.com/@xotijiapp',
  },
];

export function Contact({ onBack }: ContactProps) {
  const isTr = getLang() === 'tr';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const backBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: '999px',
    padding: '8px 18px',
    fontSize: '14px',
    color: '#0ea5e9',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 500,
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Top nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontWeight: 800, fontSize: '1.6rem', color: '#0ea5e9', letterSpacing: '-0.02em' }}>
          XOTIJI
        </span>
        <button onClick={onBack} style={backBtn}>
          ← {t('contact.backToHome')}
        </button>
      </div>

      {/* Page title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
          {t('contact.title')}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {t('contact.subtitle')}
        </p>
      </div>

      {/* Email card */}
      <div style={{
        background: 'white',
        borderRadius: '18px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(15,23,42,0.07)',
        marginBottom: '20px',
      }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 14px 0' }}>
          {t('contact.emailLabel')}
        </p>
        <a
          href="mailto:hello@xotiji.app"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            textDecoration: 'none',
            padding: '18px 22px',
            borderRadius: '14px',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            transition: 'background 0.15s',
          }}
        >
          <span style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#0ea5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </span>
          <div>
            <p style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a', margin: '0 0 2px 0' }}>hello@xotiji.app</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              {isTr ? 'Genellikle 1–2 iş günü içinde yanıt veririz.' : 'We typically respond within 1–2 business days.'}
            </p>
          </div>
        </a>
      </div>

      {/* Social media card */}
      <div style={{
        background: 'white',
        borderRadius: '18px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(15,23,42,0.07)',
      }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
          {t('contact.socialsLabel')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                textDecoration: 'none',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <span style={{ color: '#475569', display: 'flex', alignItems: 'center', marginRight: '12px' }}>
                {social.icon}
              </span>
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', margin: '0 0 1px 0' }}>{social.name}</p>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{social.handle}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Bottom back button */}
      <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '8px' }}>
        <button onClick={onBack} style={{ ...backBtn, color: '#64748b', borderColor: '#e2e8f0' }}>
          ← {t('contact.backToHome')}
        </button>
      </div>
    </div>
  );
}
