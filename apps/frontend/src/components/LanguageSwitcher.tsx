import { getLang, setLang } from '../i18n';

export function LanguageSwitcher() {
  const current = getLang();
  const next = current === 'tr' ? 'en' : 'tr';

  function handleToggle() {
    setLang(next);
    window.location.reload();
  }

  return (
    <button
      onClick={handleToggle}
      title={`Switch to ${next.toUpperCase()}`}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '1px solid #e2e8f0',
        background: 'white',
        boxShadow: '0 2px 8px rgba(15,23,42,0.12)',
        cursor: 'pointer',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontWeight: 700,
        fontSize: '12px',
        color: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        letterSpacing: '0.04em',
        padding: 0,
      }}
    >
      {current.toUpperCase()}
    </button>
  );
}