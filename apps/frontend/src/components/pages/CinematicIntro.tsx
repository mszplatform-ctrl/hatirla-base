import { useState, useEffect, useMemo } from "react";
import { t } from "../../i18n";

interface Props {
  onComplete: () => void;
  fastComplete?: boolean;
}

// Resolved at render time so language is always respected
function getTerminalLines() {
  return [t("intro.line1"), t("intro.line2"), t("intro.line3"), t("intro.line4")];
}

const TYPING_SPEED   = 52;   // ms per character
const LINE_PAUSE     = 460;  // pause between completed lines
const TAGLINE_DELAY  = 900;  // pause after last line before tagline
const BUTTON_DELAY   = 1100; // pause after tagline before button appears

export function CinematicIntro({ onComplete, fastComplete }: Props) {

  // Resolved once on mount — language won't change mid-intro
  const TERMINAL_LINES = useMemo(() => getTerminalLines(), []);

  const [shownLines, setShownLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [lineIndex,   setLineIndex]   = useState(-1);
  const [showTagline, setShowTagline] = useState(false);
  const [showButton,  setShowButton]  = useState(false);
  const [initiated,   setInitiated]   = useState(false);
  const [fadeOut,     setFadeOut]     = useState(false);

  // Start the first line after a short dramatic pause
  useEffect(() => {
    const t0 = setTimeout(() => setLineIndex(0), 650);
    return () => clearTimeout(t0);
  }, []);

  // Type current line character by character
  useEffect(() => {
    if (lineIndex < 0 || lineIndex >= TERMINAL_LINES.length) return;

    const fullLine = TERMINAL_LINES[lineIndex];
    let charIdx = 0;
    setCurrentLine("");

    let pauseTimer:   ReturnType<typeof setTimeout> | null = null;
    let taglineTimer: ReturnType<typeof setTimeout> | null = null;
    let buttonTimer:  ReturnType<typeof setTimeout> | null = null;

    const interval = setInterval(() => {
      charIdx++;
      setCurrentLine(fullLine.slice(0, charIdx));

      if (charIdx >= fullLine.length) {
        clearInterval(interval);

        pauseTimer = setTimeout(() => {
          setShownLines(prev => [...prev, fullLine]);
          setCurrentLine("");

          if (lineIndex + 1 < TERMINAL_LINES.length) {
            setLineIndex(prev => prev + 1);
          } else {
            // All terminal lines done — show tagline then button
            taglineTimer = setTimeout(() => {
              setShowTagline(true);
              buttonTimer = setTimeout(() => setShowButton(true), BUTTON_DELAY);
            }, TAGLINE_DELAY);
          }
        }, LINE_PAUSE);
      }
    }, TYPING_SPEED);

    return () => {
      clearInterval(interval);
      if (pauseTimer)   clearTimeout(pauseTimer);
      if (taglineTimer) clearTimeout(taglineTimer);
      if (buttonTimer)  clearTimeout(buttonTimer);
    };
  }, [lineIndex]);

  function handleInitiate() {
    setInitiated(true);
    if (fastComplete) {
      setFadeOut(true);
      setTimeout(onComplete, 850);
    } else {
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(onComplete, 850);
      }, 1700);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#020810",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.85s ease",
        overflow: "hidden",
      }}
    >
      {/* Fullscreen video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.45,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      {/* Aurora / nebula blobs — pure CSS animation, no JS */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
      }}>
        {/* Blob 1 — top-left, teal */}
        <div style={{
          position: "absolute",
          top: "-15%", left: "-10%",
          width: "65vw", height: "65vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(15,118,110,0.18) 0%, transparent 68%)",
          filter: "blur(48px)",
          animation: "xo-aurora-1 14s ease-in-out infinite alternate",
        }} />
        {/* Blob 2 — bottom-right, deep blue */}
        <div style={{
          position: "absolute",
          bottom: "-20%", right: "-15%",
          width: "70vw", height: "70vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 65%)",
          filter: "blur(56px)",
          animation: "xo-aurora-2 18s ease-in-out infinite alternate",
        }} />
        {/* Blob 3 — centre-right, indigo/purple whisper */}
        <div style={{
          position: "absolute",
          top: "30%", right: "-5%",
          width: "45vw", height: "45vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "xo-aurora-3 22s ease-in-out infinite alternate",
        }} />
        {/* Blob 4 — bottom-left, faint warm teal */}
        <div style={{
          position: "absolute",
          bottom: "5%", left: "-5%",
          width: "40vw", height: "40vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(45,212,191,0.07) 0%, transparent 72%)",
          filter: "blur(36px)",
          animation: "xo-aurora-2 26s ease-in-out infinite alternate-reverse",
        }} />
      </div>

      {/* Main content column */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: "100%",
          maxWidth: "540px",
          padding: "0 28px",
          boxSizing: "border-box",
        }}
      >
        {/* Terminal output */}
        <div
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "clamp(13px, 2.2vw, 17px)",
            lineHeight: 2,
            minHeight: "148px",
          }}
        >
          {shownLines.map((line, i) => (
            <div
              key={i}
              style={{
                color: "#4ade80",
                animation: "xo-fadein 0.25s ease",
              }}
            >
              <span
                style={{
                  color: "#0ea5e9",
                  marginRight: "10px",
                  userSelect: "none",
                }}
              >
                ›
              </span>
              <span>{line}</span>
            </div>
          ))}

          {/* Currently typing line with blinking cursor */}
          {lineIndex >= 0 && lineIndex < TERMINAL_LINES.length && (
            <div style={{ color: "#86efac" }}>
              <span
                style={{
                  color: "#0ea5e9",
                  marginRight: "10px",
                  userSelect: "none",
                }}
              >
                ›
              </span>
              <span>{currentLine}</span>
              <span
                style={{
                  display: "inline-block",
                  width: "9px",
                  height: "1.1em",
                  background: "#2dd4bf",
                  marginLeft: "2px",
                  verticalAlign: "text-bottom",
                  animation: "xo-blink 0.75s step-end infinite",
                }}
              />
            </div>
          )}
        </div>

        {/* Tagline */}
        {showTagline && (
          <div
            style={{
              marginTop: "48px",
              fontSize: "clamp(30px, 7vw, 56px)",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              animation: "xo-fadeup 0.9s ease forwards",
              background: "linear-gradient(135deg, #ffffff 20%, #2dd4bf 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            <span>{t("intro.tagline")}</span>
          </div>
        )}

        {/* Initiate button */}
        {showButton && !initiated && (
          <button
            onClick={handleInitiate}
            className="xo-intro-btn"
            style={{
              marginTop: "38px",
              padding: "15px 44px",
              background: "transparent",
              border: "2px solid #0f766e",
              color: "#5eead4",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(11px, 1.9vw, 14px)",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: "3px",
              animation:
                "xo-glow-pulse 2s ease-in-out infinite alternate, xo-fadeup 0.7s ease forwards",
              transition: "background 0.2s ease",
            }}
          >
            <span>{t("intro.button")}</span>
          </button>
        )}

        {/* "Transfer initiated" confirmation line */}
        {initiated && (
          <div
            style={{
              marginTop: "38px",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "clamp(13px, 2.2vw, 17px)",
              color: "#0ea5e9",
              animation: "xo-fadeup 0.5s ease forwards",
              lineHeight: 1.8,
            }}
          >
            <span style={{ color: "#2dd4bf", marginRight: "10px" }}>›</span>
            <span>{t("intro.initiated")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
