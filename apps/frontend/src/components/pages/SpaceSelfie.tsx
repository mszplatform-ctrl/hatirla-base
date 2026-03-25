import { useState, useRef, useEffect, useCallback } from 'react';
import { t, getLang } from '../../i18n';
import type { SelectedScene } from './CinematicSequence';

const AI_BASE = `${import.meta.env.VITE_API_URL || 'https://hatirla-base.onrender.com'}/api/ai`;

const CITIES: SelectedScene[] = [
  { id: 'istanbul',  image: '/cities/istanbul.jpg',  label: 'ISTANBUL, TURKEY', year: '2026', era: 'Istanbul',  cosmic: false },
  { id: 'paris',     image: '/cities/paris.jpg',     label: 'PARIS, FRANCE',    year: '2026', era: 'Paris',     cosmic: false },
  { id: 'rome',      image: '/cities/rome.jpg',      label: 'ROME, ITALY',      year: '2026', era: 'Rome',      cosmic: false },
  { id: 'tokyo',     image: '/cities/tokyo.jpg',     label: 'TOKYO, JAPAN',     year: '2026', era: 'Tokyo',     cosmic: false },
  { id: 'barcelona', image: '/cities/barcelona.jpg', label: 'BARCELONA, SPAIN', year: '2026', era: 'Barcelona', cosmic: false },
  { id: 'dubai',     image: '/cities/dubai.jpg',     label: 'DUBAI, UAE',       year: '2026', era: 'Dubai',     cosmic: false },
  { id: 'london',    image: '/cities/london.jpg',    label: 'LONDON, ENGLAND',  year: '2026', era: 'London',    cosmic: false },
  { id: 'berlin',    image: '/cities/berlin.jpg',    label: 'BERLIN, GERMANY',  year: '2026', era: 'Berlin',    cosmic: false },
];

const TIME_STOPS = [
  { id: 'stone_age',   label: 'STONE AGE',    year: '~10,000 BC', era: 'Stone Age',            cosmic: false },
  { id: 'ancient',     label: 'ANCIENT WORLD', year: '0 AD',      era: 'Ancient Civilization', cosmic: false },
  { id: 'medieval',    label: 'MEDIEVAL',      year: '1200',      era: 'Medieval Era',         cosmic: false },
  { id: 'year1920',    label: '1920s',         year: '1920',      era: 'Modern Dawn',          cosmic: false },
  { id: 'present',     label: 'PRESENT',       year: '2026',      era: 'Present Day',          cosmic: false },
  { id: 'future',      label: 'FUTURE',        year: '2200',      era: 'Future City',          cosmic: true  },
  { id: 'alien_world', label: 'ALIEN WORLD',   year: '∞',         era: 'Alien World',          cosmic: true  },
  { id: 'end',         label: 'END OF TIME',   year: '∞',         era: 'End of Time',          cosmic: true  },
];

const EXPLORER_ID = String(Math.floor(1000 + Math.random() * 9000));

interface FaceSwapStatusResponse {
  success: boolean;
  status: 'processing' | 'done' | 'error';
  imageUrl?: string;
  shareUrl?: string | null;
  error?: string;
}

async function submitFaceSwap(photo: string, sceneId: string): Promise<string> {
  const res = await fetch(`${AI_BASE}/face-swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photo, cityId: sceneId }),
  });
  const data = await res.json() as { success: boolean; jobId?: string; error?: string };
  if (!res.ok || !data.success || !data.jobId) {
    throw new Error(`Submission failed: ${data.error || `Server error ${res.status}`}`);
  }
  return data.jobId;
}

async function pollFaceSwapStatus(jobId: string): Promise<FaceSwapStatusResponse> {
  const res = await fetch(`${AI_BASE}/face-swap/status/${jobId}`);
  const data = await res.json() as FaceSwapStatusResponse;
  if (!res.ok || !data.success) {
    throw new Error(`Status check failed: ${(data as { error?: string }).error || `Server error ${res.status}`}`);
  }
  return data;
}

interface SpaceSelfieProps {
  onBack: () => void;
}

export function SpaceSelfie({ onBack }: SpaceSelfieProps) {
  const [flowStep, setFlowStep] = useState<'select' | 'photo-modal' | 'loading' | 'teleport-video' | 'result'>('select');
  const [selectedScene, setSelectedScene] = useState<SelectedScene | null>(null);
  const [timeStopIndex, setTimeStopIndex] = useState(4); // default: Present Day
  const [userPhoto, setUserPhoto]   = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [fromTimeTeleport, setFromTimeTeleport] = useState(false);
  const [videoBuffering, setVideoBuffering] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const pollIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const bufferTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef     = useRef<HTMLInputElement>(null);
  const cameraInputRef   = useRef<HTMLInputElement>(null);
  const videoRef         = useRef<HTMLVideoElement>(null);
  const [videoMuted, setVideoMuted] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(() => new Set());
  const markLoaded = useCallback((id: string) => setLoadedImages(prev => { const s = new Set(prev); s.add(id); return s; }), []);

  // Clear poll interval and elapsed timer on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  // Buffer timeout: on mobile show spinner immediately; on desktop after 3s without onPlaying
  useEffect(() => {
    if (flowStep !== 'teleport-video') return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setVideoBuffering(true);
      return;
    }
    setVideoBuffering(false);
    bufferTimeoutRef.current = setTimeout(() => setVideoBuffering(true), 3000);
    return () => {
      if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
    };
  }, [flowStep]);

  function openPhotoModal(scene: SelectedScene) {
    setSelectedScene(scene);
    setUserPhoto(null);
    setErrorMsg(null);
    setFlowStep('photo-modal');
  }

  function handleCitySelect(city: SelectedScene) {
    setFromTimeTeleport(false);
    openPhotoModal(city);
  }

  function handleTimeSelect() {
    const stop = TIME_STOPS[timeStopIndex];
    setFromTimeTeleport(true);
    openPhotoModal({
      id: stop.id, image: '', label: stop.era.toUpperCase(),
      year: stop.year, era: stop.era, cosmic: stop.cosmic,
    });
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isHeic = file.type === 'image/heic' || file.type === 'image/heif'
      || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
    if (isHeic) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        setUserPhoto(canvas.toDataURL('image/jpeg', 0.92));
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else {
      const reader = new FileReader();
      reader.onload = ev => setUserPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleLaunch() {
    if (!selectedScene || !userPhoto) return;
    setFlowStep('loading');

    let jobId: string;
    try {
      jobId = await submitFaceSwap(userPhoto, selectedScene.id);
    } catch (err) {
      setErrorMsg((err as Error).message || 'Submission failed');
      setFlowStep('photo-modal');
      return;
    }

    // Capture for closure — does not change while polling
    const teleport = fromTimeTeleport;

    // Elapsed seconds counter — ticks every second while polling
    setElapsed(0);
    elapsedTimerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    const stopTimers = () => {
      clearInterval(pollIntervalRef.current!); pollIntervalRef.current = null;
      clearInterval(elapsedTimerRef.current!); elapsedTimerRef.current = null;
    };

    pollIntervalRef.current = setInterval(async () => {
      try {
        const result = await pollFaceSwapStatus(jobId);
        if (result.status === 'done') {
          stopTimers();
          setResultImage(result.imageUrl!);
          setShareUrl(result.shareUrl ?? null);
          // Time teleport: play video first, then result on end
          // City: go straight to result (no video)
          setFlowStep(teleport ? 'teleport-video' : 'result');
        } else if (result.status === 'error') {
          stopTimers();
          setErrorMsg(result.error || 'Transmission failed');
          setFlowStep('photo-modal');
        }
        // 'processing' → keep polling
      } catch (err) {
        stopTimers();
        setErrorMsg((err as Error).message || 'Transmission failed');
        setFlowStep('photo-modal');
      }
    }, 3000);
  }

  function showToast(msg: string) {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 2500);
  }

  function handleTryAgain() {
    setFlowStep('select');
    setSelectedScene(null);
    setUserPhoto(null);
    setResultImage(null);
    setShareUrl(null);
    setErrorMsg(null);
    setFromTimeTeleport(false);
    setVideoBuffering(false);
    setToastMsg(null);
    if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    if (elapsedTimerRef.current) { clearInterval(elapsedTimerRef.current); elapsedTimerRef.current = null; }
    setElapsed(0);
    if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }

  function handleCancel() {
    if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    if (elapsedTimerRef.current) { clearInterval(elapsedTimerRef.current); elapsedTimerRef.current = null; }
    setElapsed(0);
    setFlowStep('photo-modal'); // keep photo + scene so user can retry without re-uploading
  }

  async function handleDownload() {
    if (!resultImage || !selectedScene) return;
    try {
      const res = await fetch(resultImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xotiji-space-selfie-${selectedScene.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const a = document.createElement('a');
      a.href = resultImage;
      a.download = `xotiji-space-selfie-${selectedScene.id}.png`;
      a.click();
    }
  }

  const tagline = 'My cosmic travel identity was generated by XOTIJI — xotiji.app';

  async function downloadImage() {
    if (!resultImage) return;
    try {
      const res = await fetch(resultImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'xotiji-transmission.jpg';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = 'xotiji-transmission.jpg';
      link.click();
    }
  }

  function handleShareInstagram() {
    downloadImage();
    window.open('https://www.instagram.com/', '_blank');
    const urlPart = shareUrl ? ` — ${shareUrl}` : '';
    showToast(getLang() === 'tr' ? `Görsel indirildi! Galeriden seç${urlPart}` : `Image saved! Select from gallery${urlPart}`);
  }

  function handleShareTikTok() {
    downloadImage();
    window.open('https://www.tiktok.com/', '_blank');
    const urlPart = shareUrl ? ` — ${shareUrl}` : '';
    showToast(getLang() === 'tr' ? `Görsel indirildi! Galeriden seç${urlPart}` : `Image saved! Select from gallery${urlPart}`);
  }

  function handleShareX() {
    const link = shareUrl ?? 'https://xotiji.app';
    const text = `🚀 COSMIC IDENTITY GENERATED — ${selectedScene?.label ?? ''} ✨ ${tagline} #XOTIJI #SpaceSelfie`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`, '_blank');
  }

  function handleShareWhatsApp() {
    const link = shareUrl ?? 'https://xotiji.app';
    const text = `🚀 ${selectedScene?.label ?? ''} — Cosmic identity generated! ${tagline} ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  // ── Teleport video: full-screen ──
  // API result is already in state when we enter this step — result appears immediately on video end
  if (flowStep === 'teleport-video') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
        <video
          ref={videoRef}
          src="/teleport.mp4"
          autoPlay
          muted
          preload="auto"
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: videoBuffering ? 0 : 1, transition: 'opacity 0.4s ease' }}
          onPlaying={() => {
            setVideoBuffering(false);
            if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
            if (videoRef.current) {
              videoRef.current.muted = false;
              setVideoMuted(videoRef.current.muted);
            }
          }}
          onEnded={() => setFlowStep('result')}
        />
        {videoBuffering && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <style>{`@keyframes tpspin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(45,212,191,0.2)', borderTop: '3px solid #2dd4bf', borderRadius: '50%', animation: 'tpspin 0.9s linear infinite' }} />
            <div style={{ color: 'rgba(45,212,191,0.7)', fontFamily: 'monospace', fontSize: '12px', letterSpacing: '0.18em' }}>PREPARING TELEPORT...</div>
          </div>
        )}
        {!videoBuffering && videoMuted && (
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.muted = false;
                setVideoMuted(false);
              }
            }}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '999px', color: 'white', fontSize: '18px',
              width: '40px', height: '40px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Unmute"
          >
            🔊
          </button>
        )}
      </div>
    );
  }

  // ── Loading: full-screen ──
  if (flowStep === 'loading') {
    const phaseLabel = elapsed < 15 ? t('spaceSelfie.loadingPhase1')
                     : elapsed < 45 ? t('spaceSelfie.loadingPhase2')
                     : elapsed < 90 ? t('spaceSelfie.loadingPhase3')
                     :                t('spaceSelfie.loadingPhase4');
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
        {/* Blurred user photo background */}
        {userPhoto && (
          <img
            src={userPhoto}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(24px) brightness(0.22)', transform: 'scale(1.12)' }}
          />
        )}
        {/* Spinner + phase label + elapsed counter */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(45,212,191,0.2)', borderTop: '3px solid #2dd4bf', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
          <div style={{ color: 'rgba(45,212,191,0.75)', fontFamily: 'monospace', fontSize: '12px', letterSpacing: '0.18em' }}>{phaseLabel}</div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.12em' }}>{elapsed}s</div>
          <button
            onClick={handleCancel}
            style={{
              marginTop: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.1em',
              padding: '8px 20px', borderRadius: '999px', cursor: 'pointer',
            }}
          >
            ✕ {t('spaceSelfie.cancel')}
          </button>
        </div>
        {/* Preload teleport video in background while polling */}
        {fromTimeTeleport && <video src="/teleport.mp4" preload="auto" style={{ display: 'none' }} />}
      </div>
    );
  }

  // ── Result: full-screen ──
  if (flowStep === 'result' && resultImage && selectedScene) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 50, overflowY: 'auto', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
        {/* Image area (85vh) */}
        <div style={{ position: 'relative', width: '100%', height: '85vh', overflow: 'hidden' }}>
          <img
            src={resultImage}
            alt="Space Selfie"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

          {/* Bottom gradient overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)', pointerEvents: 'none' }} />

          {/* Location + Explorer ID (bottom left) */}
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', pointerEvents: 'none' }}>
            <div style={{ color: 'rgba(45,212,191,0.65)', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em', marginBottom: '4px' }}>
              XOTIJI TRANSMISSION
            </div>
            <div style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '3px' }}>
              {selectedScene.label}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'monospace', fontSize: '10px' }}>
              EXPLORER ID: {EXPLORER_ID}
            </div>
          </div>

        </div>

        {/* Below image */}
        <div style={{ padding: '24px 24px 40px', textAlign: 'center', background: '#000' }}>
          {/* Share buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {[
              { icon: '⬇',  label: 'SAVE',      action: handleDownload,       bg: 'rgba(255,255,255,0.92)', color: '#0f172a', border: 'none' },
              { icon: '📸', label: 'INSTAGRAM', action: handleShareInstagram, bg: '#e1306c',               color: '#fff',    border: 'none' },
              { icon: '🎵', label: 'TIKTOK',    action: handleShareTikTok,    bg: '#010101',               color: '#fff',    border: '1px solid rgba(255,255,255,0.18)' },
              { icon: '𝕏',  label: 'X',         action: handleShareX,         bg: '#000',                  color: '#fff',    border: '1px solid rgba(255,255,255,0.18)' },
              { icon: '💬', label: 'WHATSAPP',  action: handleShareWhatsApp,  bg: '#25d366',               color: '#fff',    border: 'none' },
            ].map(btn => (
              <div key={btn.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={btn.action}
                  title={btn.label}
                  style={{
                    width: '54px', height: '54px', borderRadius: '50%',
                    background: btn.bg, border: btn.border,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '22px', lineHeight: 1,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                    fontFamily: 'system-ui', color: btn.color,
                  }}
                >
                  {btn.icon}
                </button>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
                  {btn.label}
                </span>
              </div>
            ))}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.04em', margin: '0 0 20px' }}>
            {tagline}
          </p>
          <button
            onClick={handleTryAgain}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 24px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
          >
            🔄 {t('spaceSelfie.tryAgain')}
          </button>
        </div>

        {/* Toast */}
        {toastMsg && (
          <div style={{
            position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(45,212,191,0.92)', color: '#0f172a',
            fontFamily: 'monospace', fontSize: '13px', fontWeight: 700,
            padding: '10px 22px', borderRadius: '999px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap', zIndex: 200,
            pointerEvents: 'none',
          }}>
            ✓ {toastMsg}
          </div>
        )}
      </div>
    );
  }

  // ── Select screen ──
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f172a 0%, #0c2340 55%, #134e4a 100%)',
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '18px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky', top: 0,
        background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)', zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '8px 16px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}
        >
          ← {t('spaceSelfie.back')}
        </button>
        <div style={{ flex: 1, textAlign: 'center', color: 'white', fontWeight: 800, fontSize: '17px', letterSpacing: '-0.01em' }}>
          🚀 {t('spaceSelfie.title')}
        </div>
        <div style={{ width: '80px' }} />
      </div>

      {/* Photo modal overlay */}
      {flowStep === 'photo-modal' && selectedScene && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(5,10,20,0.97)',
          backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
        }}>
          {/* Modal header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setFlowStep('select')}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '8px 16px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', flexShrink: 0 }}
            >
              ← {t('spaceSelfie.back')}
            </button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.18em', marginBottom: '4px' }}>
                TELEPORTING TO
              </div>
              <div style={{
                color: selectedScene.cosmic ? '#a78bfa' : '#2dd4bf',
                fontFamily: 'monospace', fontSize: '14px', fontWeight: 800, letterSpacing: '0.1em',
              }}>
                {selectedScene.label}
              </div>
            </div>
            <div style={{ width: '80px' }} />
          </div>

          {/* Error banner */}
          {errorMsg && (
            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', padding: '12px 18px', margin: '16px 24px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
              <span style={{ color: '#fca5a5', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.5, flex: 1 }}>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}>✕</button>
            </div>
          )}

          {/* Upload content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', overflowY: 'auto' }}>
            {!userPhoto ? (
              <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '20px', marginBottom: '8px' }}>
                  {t('spaceSelfie.step2Title')}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.45)', margin: '0 0 28px', fontSize: '14px' }}>
                  {t('spaceSelfie.uploadPrompt')}
                </p>
                <div style={{
                  border: '2px dashed rgba(14,165,233,0.35)', borderRadius: '24px',
                  padding: '52px 24px',
                  background: 'rgba(14,165,233,0.04)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
                }}>
                  <div style={{ fontSize: '52px', lineHeight: 1 }}>📸</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
                    {getLang() === 'tr' ? 'Fotoğrafın seçildikten sonra önizleme görünür' : 'Preview appears after selecting your photo'}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '13px 28px', borderRadius: '999px', cursor: 'pointer', fontWeight: 700, fontSize: '15px', fontFamily: 'inherit' }}
                    >
                      📁 {t('spaceSelfie.chooseFile')}
                    </button>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '2px solid rgba(255,255,255,0.2)', padding: '12px 28px', borderRadius: '999px', cursor: 'pointer', fontWeight: 700, fontSize: '15px', fontFamily: 'inherit' }}
                    >
                      📷 {t('spaceSelfie.takePhoto')}
                    </button>
                  </div>
                </div>
                <input ref={fileInputRef}  type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif"                style={{ display: 'none' }} onChange={handlePhotoChange} />
                <input ref={cameraInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" capture="user" style={{ display: 'none' }} onChange={handlePhotoChange} />
                <p style={{ marginTop: '20px', color: 'rgba(255,255,255,0.28)', fontSize: '12px', fontFamily: 'monospace', lineHeight: 1.6 }}>
                  {getLang() === 'tr'
                    ? '📷 Fotoğrafınız yalnızca işlem için kullanılır ve 24 saat içinde otomatik silinir.'
                    : '📷 Your photo is used only for processing and is automatically deleted within 24 hours.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', width: '100%', maxWidth: '440px' }}>
                {/* Photo preview */}
                <div style={{ width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${selectedScene.cosmic ? '#a78bfa' : '#0ea5e9'}`, boxShadow: `0 0 50px ${selectedScene.cosmic ? 'rgba(139,92,246,0.45)' : 'rgba(14,165,233,0.45)'}` }}>
                  <img src={userPhoto} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Destination badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: selectedScene.cosmic ? 'rgba(139,92,246,0.12)' : 'rgba(14,165,233,0.12)',
                  border: `1px solid ${selectedScene.cosmic ? 'rgba(139,92,246,0.3)' : 'rgba(14,165,233,0.3)'}`,
                  borderRadius: '999px', padding: '6px 16px',
                  color: selectedScene.cosmic ? '#c4b5fd' : '#7dd3fc',
                  fontSize: '13px', fontWeight: 600,
                }}>
                  {selectedScene.cosmic ? '✦' : '🏙️'} {selectedScene.label}
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    onClick={() => { setUserPhoto(null); setTimeout(() => fileInputRef.current?.click(), 50); }}
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.18)', padding: '12px 24px', borderRadius: '999px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit' }}
                  >
                    🔄 {t('spaceSelfie.chooseFile')}
                  </button>
                  <button
                    onClick={handleLaunch}
                    style={{
                      background: selectedScene.cosmic
                        ? 'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)'
                        : 'linear-gradient(135deg, #0f766e 0%, #0ea5e9 100%)',
                      color: 'white', border: 'none', padding: '13px 36px', borderRadius: '999px',
                      cursor: 'pointer', fontWeight: 800, fontSize: '16px',
                      boxShadow: selectedScene.cosmic ? '0 4px 24px rgba(139,92,246,0.5)' : '0 4px 24px rgba(14,165,233,0.45)',
                      fontFamily: 'inherit', letterSpacing: '0.05em',
                    }}
                  >
                    ✦ TRANSFER
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" style={{ display: 'none' }} onChange={handlePhotoChange} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Select screen content */}
      {flowStep === 'select' && (
        <div style={{ padding: '28px 24px 60px', maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ color: 'white', textAlign: 'center', margin: '0 0 8px', fontSize: '22px', fontWeight: 700 }}>
            {t('spaceSelfie.step1Title')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: '0 0 28px', fontSize: '14px' }}>
            {t('spaceSelfie.selectCityPrompt')}
          </p>

          {/* City grid */}
          <style>{`@keyframes cityskel { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            {CITIES.map(city => (
              <button
                key={city.id}
                onClick={() => handleCitySelect(city)}
                style={{
                  position: 'relative', height: '168px', borderRadius: '18px', overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.12)', cursor: 'pointer', padding: 0,
                  background: '#0c1929',
                  transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(14,165,233,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Skeleton — fades out once the image loads */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(14,165,233,0.07) 0%, rgba(15,23,42,0.6) 100%)', animation: loadedImages.has(city.id) ? 'none' : 'cityskel 1.6s ease-in-out infinite', opacity: loadedImages.has(city.id) ? 0 : 1, transition: 'opacity 0.3s ease' }} />
                <img
                  src={city.image}
                  alt={city.label}
                  loading="lazy"
                  onLoad={() => markLoaded(city.id)}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: loadedImages.has(city.id) ? 1 : 0, transition: 'opacity 0.3s ease' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.05) 55%)' }} />
                <div style={{ position: 'absolute', bottom: '14px', left: 0, right: 0, color: 'white', fontWeight: 700, fontSize: '13px', textAlign: 'center', textShadow: '0 1px 6px rgba(0,0,0,0.8)', letterSpacing: '0.04em', fontFamily: 'monospace' }}>
                  {city.label}
                </div>
              </button>
            ))}
          </div>

          {/* Unified Timeline */}
          <div style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '20px', padding: '24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(45,212,191,0.15)' }} />
              <span style={{ color: '#2dd4bf', fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em' }}>⏳ TIME &amp; SPACE TELEPORT</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(45,212,191,0.15)' }} />
            </div>

            {/* Dot timeline */}
            <div style={{ position: 'relative', marginBottom: '4px' }}>
              <div style={{ position: 'absolute', top: '6px', left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, rgba(45,212,191,0.3) 0%, rgba(45,212,191,0.3) 64%, rgba(139,92,246,0.3) 64%, rgba(139,92,246,0.3) 100%)', zIndex: 0 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                {TIME_STOPS.map((stop, i) => {
                  const isSelected = i === timeStopIndex;
                  const color = stop.cosmic ? '#a78bfa' : '#2dd4bf';
                  const glow  = stop.cosmic ? 'rgba(139,92,246,0.7)' : 'rgba(45,212,191,0.7)';
                  return (
                    <button
                      key={stop.id}
                      onClick={() => setTimeStopIndex(i)}
                      title={stop.era}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: 0, flex: 1, minWidth: 0 }}
                    >
                      <div style={{ width: isSelected ? '14px' : '10px', height: isSelected ? '14px' : '10px', borderRadius: '50%', background: isSelected ? color : 'rgba(255,255,255,0.15)', border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.2)'}`, boxShadow: isSelected ? `0 0 12px ${glow}` : 'none', transition: 'all 0.2s', flexShrink: 0 }} />
                      <span style={{ color: isSelected ? color : 'rgba(255,255,255,0.28)', fontFamily: 'monospace', fontSize: '8px', fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%', transition: 'color 0.2s' }}>
                        {stop.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider */}
            <input
              type="range" min={0} max={TIME_STOPS.length - 1} value={timeStopIndex}
              onChange={e => setTimeStopIndex(Number(e.target.value))}
              style={{ width: '100%', accentColor: TIME_STOPS[timeStopIndex].cosmic ? '#a78bfa' : '#2dd4bf', cursor: 'pointer', margin: '14px 0 20px' }}
            />

            {/* Selected era display */}
            {(() => {
              const stop = TIME_STOPS[timeStopIndex];
              const color      = stop.cosmic ? '#a78bfa' : '#2dd4bf';
              const glowBg     = stop.cosmic ? 'rgba(139,92,246,0.1)' : 'rgba(45,212,191,0.08)';
              const borderC    = stop.cosmic ? 'rgba(139,92,246,0.3)' : 'rgba(45,212,191,0.25)';
              return (
                <div style={{ textAlign: 'center', marginBottom: '20px', background: glowBg, border: `1px solid ${borderC}`, borderRadius: '12px', padding: '14px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.12em', marginBottom: '6px' }}>DESTINATION</div>
                  <div style={{ color: 'white', fontFamily: 'monospace', fontSize: '20px', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '4px' }}>{stop.era.toUpperCase()}</div>
                  <div style={{ color, fontFamily: 'monospace', fontSize: '12px', opacity: 0.85 }}>{stop.year} · {stop.cosmic ? '✦ COSMIC' : '◈ HISTORICAL'}</div>
                </div>
              );
            })()}

            {/* Teleport button */}
            <div style={{ textAlign: 'center' }}>
              {(() => {
                const isCosmic  = TIME_STOPS[timeStopIndex].cosmic;
                const btnColor  = isCosmic ? '#a78bfa' : '#2dd4bf';
                const btnBg     = isCosmic ? 'rgba(139,92,246,0.18)' : 'rgba(45,212,191,0.18)';
                const btnBorder = isCosmic ? 'rgba(139,92,246,0.5)' : 'rgba(45,212,191,0.5)';
                const btnGlow   = isCosmic ? 'rgba(139,92,246,0.25)' : 'rgba(45,212,191,0.25)';
                return (
                  <button
                    onClick={handleTimeSelect}
                    style={{ background: btnBg, border: `1px solid ${btnBorder}`, color: btnColor, padding: '13px 48px', borderRadius: '999px', cursor: 'pointer', fontWeight: 800, fontSize: '15px', fontFamily: 'monospace', letterSpacing: '0.1em', boxShadow: `0 0 24px ${btnGlow}`, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 40px ${btnGlow.replace('0.25', '0.5')}`; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 24px ${btnGlow}`; }}
                  >
                    ⏳ TELEPORT
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
