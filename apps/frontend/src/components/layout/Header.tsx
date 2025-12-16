import { t } from '../../i18n';

export function Header() {
  return (
    <>
      {/* LOGO */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
        <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M 15 70 Q 50 62 85 70" fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="50" cy="70" r="16" fill="none" stroke="#fb923c" strokeWidth="3.5"/>
          <circle cx="50" cy="70" r="10" fill="#fb923c" opacity="0.25"/>
          <line x1="50" y1="47" x2="50" y2="40" stroke="#fb923c" strokeWidth="3" strokeLinecap="round"/>
          <line x1="65" y1="54" x2="70" y2="49" stroke="#fb923c" strokeWidth="3" strokeLinecap="round"/>
          <line x1="35" y1="54" x2="30" y2="49" stroke="#fb923c" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <h1 style={{
          fontWeight: 800,
          color: "#0ea5e9",
          fontSize: "2.5rem",
          letterSpacing: "-0.02em",
          margin: 0,
          lineHeight: 1
        }}>
          {t('common.appName')}
        </h1>
      </div>

      {/* Description */}
      <p style={{ fontSize: "13px", color: "#475569", marginBottom: "20px" }}>
        {t('home.aiTracking')}
      </p>
    </>
  );
}