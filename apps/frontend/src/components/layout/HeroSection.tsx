import { t } from '../../i18n';

interface HeroSectionProps {
  onScrollToCities: () => void;
  onSpaceSelfie: () => void;
}

export function HeroSection({ onScrollToCities, onSpaceSelfie }: HeroSectionProps) {
  return (
    <div style={{
      margin: "-40px -40px 0 -40px",
      padding: "72px 40px 64px",
      background: "linear-gradient(180deg, #031420 0%, #062820 10%, #0a4032 22%, #4eb8b0 36%, #b0e4e0 46%, #d4f0ee 54%, #e0f2fe 64%, #f0fdfa 82%, #ffffff 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: "absolute",
        top: "-60px",
        right: "-80px",
        width: "320px",
        height: "320px",
        background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: "-40px",
        left: "-60px",
        width: "260px",
        height: "260px",
        background: "radial-gradient(circle, rgba(15,118,110,0.10) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />

      {/* Sun Logo */}
      <div style={{ marginBottom: "24px" }}>
        <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M 15 70 Q 50 62 85 70" fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="50" cy="70" r="16" fill="none" stroke="#fb923c" strokeWidth="3.5"/>
          <circle cx="50" cy="70" r="10" fill="#fb923c" opacity="0.25"/>
          <line x1="50" y1="47" x2="50" y2="40" stroke="#fb923c" strokeWidth="3" strokeLinecap="round"/>
          <line x1="65" y1="54" x2="70" y2="49" stroke="#fb923c" strokeWidth="3" strokeLinecap="round"/>
          <line x1="35" y1="54" x2="30" y2="49" stroke="#fb923c" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>

      {/* App name */}
      <div style={{
        fontWeight: 900,
        fontSize: "clamp(2.8rem, 8vw, 4.5rem)",
        color: "#0ea5e9",
        letterSpacing: "-0.03em",
        lineHeight: 1,
        marginBottom: "10px",
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      }}>
        XOTIJI
      </div>

      {/* Tagline */}
      <div style={{
        fontStyle: "italic",
        fontSize: "clamp(1rem, 3vw, 1.25rem)",
        color: "#fb923c",
        letterSpacing: "0.08em",
        fontWeight: 500,
        marginBottom: "20px",
        textTransform: "lowercase",
      }}>
        {t('hero.tagline')}
      </div>

      {/* Subtitle */}
      <h2 style={{
        fontSize: "clamp(1.4rem, 4vw, 2rem)",
        fontWeight: 700,
        color: "#0f172a",
        margin: "0 0 16px",
        letterSpacing: "-0.01em",
        lineHeight: 1.2,
      }}>
        {t('hero.subtitle')}
      </h2>

      {/* Description */}
      <p style={{
        fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
        color: "#64748b",
        maxWidth: "480px",
        lineHeight: 1.7,
        margin: "0 0 36px",
      }}>
        {t('hero.description')}
      </p>

      {/* CTA Buttons */}
      <div style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        <button
          onClick={onSpaceSelfie}
          style={{
            background: "linear-gradient(135deg, #0f766e 0%, #0ea5e9 100%)",
            color: "white",
            border: "none",
            padding: "14px 28px",
            borderRadius: "999px",
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.01em",
            boxShadow: "0 4px 20px rgba(15,118,110,0.30)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(15,118,110,0.40)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(15,118,110,0.30)";
          }}
        >
          🚀 {t('hero.ctaSpaceSelfie')}
        </button>

        <button
          onClick={onScrollToCities}
          style={{
            background: "transparent",
            color: "#0f766e",
            border: "2px solid #0f766e",
            padding: "13px 28px",
            borderRadius: "999px",
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.01em",
            transition: "background 0.15s ease, color 0.15s ease",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "#0f766e";
            (e.currentTarget as HTMLButtonElement).style.color = "white";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#0f766e";
          }}
        >
          🗺️ {t('hero.ctaExploreCities')}
        </button>
      </div>
    </div>
  );
}
