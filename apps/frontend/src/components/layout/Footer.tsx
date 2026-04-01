import { t } from '../../i18n';

type FooterProps = {
  onNavigate?: (page: string) => void;
  user?: { id: string; email: string; name: string | null } | null;
  onLogin?: () => void;
  onLogout?: () => void;
};

export function Footer({ onNavigate, user, onLogin, onLogout }: FooterProps) {
  return (
    <footer style={{
      marginTop: "60px",
      padding: "32px 20px",
      borderTop: "1px solid #e2e8f0",
      textAlign: "center",
      background: "white"
    }}>
      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "12px" }}>
        © {new Date().getFullYear()} {t('common.appName')}. {t('footer.rights')}
      </p>
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", fontSize: "14px", flexWrap: "wrap" }}>
        <button
          onClick={() => onNavigate?.("privacy")}
          style={{ background: "none", border: "none", color: "#0ea5e9", cursor: "pointer", fontSize: "14px", padding: 0, fontFamily: "inherit" }}
        >
          {t('footer.privacy')}
        </button>
        <span style={{ color: "#cbd5e1" }}>|</span>
        <button
          onClick={() => onNavigate?.("terms")}
          style={{ background: "none", border: "none", color: "#0ea5e9", cursor: "pointer", fontSize: "14px", padding: 0, fontFamily: "inherit" }}
        >
          {t('footer.terms')}
        </button>
        <span style={{ color: "#cbd5e1" }}>|</span>
        <button
          onClick={() => onNavigate?.("contact")}
          style={{ background: "none", border: "none", color: "#0ea5e9", cursor: "pointer", fontSize: "14px", padding: 0, fontFamily: "inherit" }}
        >
          {t('footer.contact')}
        </button>
        <span style={{ color: "#cbd5e1" }}>|</span>
        <button
          onClick={() => onNavigate?.("mytrips")}
          style={{ background: "none", border: "none", color: "#0ea5e9", cursor: "pointer", fontSize: "14px", padding: 0, fontFamily: "inherit" }}
        >
          {t('footer.mytrips')}
        </button>
        <span style={{ color: "#cbd5e1" }}>|</span>
        {user ? (
          <button
            onClick={onLogout}
            style={{ background: "none", border: "none", color: "#0ea5e9", cursor: "pointer", fontSize: "14px", padding: 0, fontFamily: "inherit" }}
          >
            {t('auth.logout')}
          </button>
        ) : (
          <button
            onClick={onLogin}
            style={{ background: "none", border: "none", color: "#0ea5e9", cursor: "pointer", fontSize: "14px", padding: 0, fontFamily: "inherit" }}
          >
            {t('auth.login')}
          </button>
        )}
      </div>
    </footer>
  );
}