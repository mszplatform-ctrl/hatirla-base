import { t } from '../../i18n';

export function Footer() {
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
        <a href="/privacy" style={{ color: "#0ea5e9", textDecoration: "none" }}>{t('footer.privacy')}</a>
        <span style={{ color: "#cbd5e1" }}>|</span>
        <a href="/terms" style={{ color: "#0ea5e9", textDecoration: "none" }}>{t('footer.terms')}</a>
        <span style={{ color: "#cbd5e1" }}>|</span>
        <a href="/contact" style={{ color: "#0ea5e9", textDecoration: "none" }}>{t('footer.contact')}</a>
      </div>
    </footer>
  );
}