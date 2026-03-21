import { useState, useEffect } from 'react';
import { getLang } from '../../i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa_banner_dismissed';

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isMobile() {
  return window.innerWidth < 768 || /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [iosMode, setIosMode] = useState(false);
  const lang = getLang();

  useEffect(() => {
    // Don't show if already installed, not mobile, or previously dismissed
    if (isInStandaloneMode() || !isMobile() || sessionStorage.getItem(DISMISSED_KEY)) return;

    if (isIOS()) {
      setIosMode(true);
      setShowBanner(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      setShowBanner(false);
      setDeferredPrompt(null);
    });
  }

  function handleDismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setShowBanner(false);
  }

  if (!showBanner) return null;

  const isTR = lang === 'tr';

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '12px',
      right: '12px',
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.97)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '16px',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      backdropFilter: 'blur(12px)',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      {/* Icon */}
      <img
        src="/icon-192.png"
        alt="XOTIJI"
        style={{ width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0 }}
      />

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700, lineHeight: 1.3 }}>
          {isTR ? 'XOTIJI\'yi ana ekrana ekle' : 'Add XOTIJI to your home screen'}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginTop: '2px', lineHeight: 1.4 }}>
          {iosMode
            ? (isTR ? '📤 Paylaş → Ana Ekrana Ekle' : '📤 Share → Add to Home Screen')
            : (isTR ? 'Uygulama gibi çalışır, ücretsiz' : 'Works like an app, no App Store needed')}
        </div>
      </div>

      {/* Action */}
      {!iosMode && (
        <button
          onClick={handleInstall}
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #0f766e)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 700,
            padding: '8px 14px',
            cursor: 'pointer',
            flexShrink: 0,
            fontFamily: 'inherit',
          }}
        >
          {isTR ? 'Ekle' : 'Install'}
        </button>
      )}

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.35)',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '4px',
          lineHeight: 1,
          flexShrink: 0,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
