import { useState, useRef, useEffect } from 'react';
import { getLang } from '../i18n';

declare function gtag(...args: unknown[]): void;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type MirrorMode = 'BIG HEAD' | 'SQUISH' | 'STRETCH' | 'WIDE' | 'SLIM' | 'FUNHOUSE';
type MmStep     = 'upload' | 'mode-select' | 'processing' | 'result';

interface Landmark { x: number; y: number; z: number; }

const MODES: MirrorMode[] = ['BIG HEAD', 'SQUISH', 'STRETCH', 'WIDE', 'SLIM', 'FUNHOUSE'];

// ─────────────────────────────────────────────────────────────────────────────
// Watermark utility — draws "xotiji.app" onto a copy of the canvas, returns Blob
// ─────────────────────────────────────────────────────────────────────────────
function canvasToWatermarkedBlob(source: HTMLCanvasElement): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width  = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, 0, 0);

  const fontSize = Math.max(18, Math.round(canvas.width * 0.018));
  const padding  = Math.round(canvas.width * 0.02);
  ctx.font         = `${fontSize}px monospace`;
  ctx.fillStyle    = 'rgba(255,255,255,0.55)';
  ctx.textBaseline = 'bottom';
  ctx.fillText('xotiji.app', padding, canvas.height - padding);

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
      'image/jpeg',
      0.92,
    )
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Distortion engine — writes to an existing ctx, does NOT create a canvas
// ─────────────────────────────────────────────────────────────────────────────
function applyDistortion(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  landmarks: Landmark[],
  mode: MirrorMode,
): void {
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // Convert normalised landmarks → pixel coords
  const xs = landmarks.map(l => l.x * w);
  const ys = landmarks.map(l => l.y * h);

  const faceLeft    = xs.reduce((a, b) => Math.min(a, b),  Infinity);
  const faceRight   = xs.reduce((a, b) => Math.max(a, b), -Infinity);
  const faceTop     = ys.reduce((a, b) => Math.min(a, b),  Infinity);
  const faceBottom  = ys.reduce((a, b) => Math.max(a, b), -Infinity);
  const faceCenterX = (faceLeft  + faceRight)  / 2;
  const faceCenterY = (faceTop   + faceBottom) / 2;
  const faceWidth   = faceRight  - faceLeft;
  const faceHeight  = faceBottom - faceTop;

  ctx.clearRect(0, 0, w, h);

  switch (mode) {
    case 'BIG HEAD': {
      const scale = 1.55;
      const srcX  = faceLeft  - faceWidth  * 0.15;
      const srcY  = faceTop   - faceHeight * 0.15;
      const srcW  = faceWidth  * 1.3;
      const srcH  = faceHeight * 1.3;
      const destW = srcW * scale;
      const destH = srcH * scale;
      const destX = faceCenterX - destW / 2;
      const destY = faceCenterY - destH / 2;
      ctx.drawImage(img, 0, 0);
      ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
      break;
    }
    case 'SQUISH': {
      const srcX  = faceLeft  - 20;
      const srcY  = faceTop   - 20;
      const srcW  = faceWidth  + 40;
      const srcH  = faceHeight + 40;
      const destH = srcH * 0.55;
      ctx.drawImage(img, 0, 0);
      ctx.drawImage(img, srcX, srcY, srcW, srcH, srcX, faceCenterY - destH / 2, srcW, destH);
      break;
    }
    case 'STRETCH': {
      const srcX  = faceLeft  - 20;
      const srcY  = faceTop   - 20;
      const srcW  = faceWidth  + 40;
      const srcH  = faceHeight + 40;
      const destH = srcH * 1.55;
      ctx.drawImage(img, 0, 0);
      ctx.drawImage(img, srcX, srcY, srcW, srcH, srcX, faceCenterY - destH / 2, srcW, destH);
      break;
    }
    case 'WIDE': {
      const srcX  = faceLeft  - 20;
      const srcY  = faceTop   - 20;
      const srcW  = faceWidth  + 40;
      const srcH  = faceHeight + 40;
      const destW = srcW * 1.6;
      ctx.drawImage(img, 0, 0);
      ctx.drawImage(img, srcX, srcY, srcW, srcH, faceCenterX - destW / 2, srcY, destW, srcH);
      break;
    }
    case 'SLIM': {
      const srcX  = faceLeft  - 20;
      const srcY  = faceTop   - 20;
      const srcW  = faceWidth  + 40;
      const srcH  = faceHeight + 40;
      const destW = srcW * 0.6;
      ctx.drawImage(img, 0, 0);
      ctx.drawImage(img, srcX, srcY, srcW, srcH, faceCenterX - destW / 2, srcY, destW, srcH);
      break;
    }
    case 'FUNHOUSE': {
      for (let x = 0; x < w; x += 4) {
        const withinFace = x >= faceLeft - 20 && x <= faceRight + 20;
        const offsetY = withinFace
          ? Math.sin((x / w) * Math.PI * 3) * (faceHeight * 0.18)
          : 0;
        ctx.drawImage(img, x, 0, 4, h, x, offsetY, 4, h);
      }
      break;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MagicMirror component
// ─────────────────────────────────────────────────────────────────────────────
export function MagicMirror() {
  const [mmStep,       setMmStep]       = useState<MmStep>('upload');
  const [userPhoto,    setUserPhoto]    = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<MirrorMode>('BIG HEAD');
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded]  = useState(false);
  const [errorMsg,     setErrorMsg]      = useState<string | null>(null);
  const [toastMsg,     setToastMsg]      = useState<string | null>(null);

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const cameraInputRef  = useRef<HTMLInputElement>(null);
  const imgRef          = useRef<HTMLImageElement | null>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load MediaPipe Face Mesh via CDN ──
  useEffect(() => {
    if ((window as Window & { FaceMesh?: unknown }).FaceMesh) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src         = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
    script.crossOrigin = 'anonymous';
    script.onload  = () => setScriptLoaded(true);
    script.onerror = () => setErrorMsg('Failed to load face detection library.');
    document.head.appendChild(script);
    // Do not remove on cleanup — other renders may depend on the script staying loaded
  }, []);

  function showToast(msg: string) {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 2500);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setUserPhoto(ev.target?.result as string);
      setErrorMsg(null);
      setMmStep('mode-select');
    };
    reader.readAsDataURL(file);
  }

  async function handleApplyMirror() {
    if (!userPhoto) return;

    if (!scriptLoaded || !(window as Window & { FaceMesh?: unknown }).FaceMesh) {
      setErrorMsg('Face detection is loading, please wait...');
      return;
    }

    setMmStep('processing');
    setErrorMsg(null);

    try {
      // Load image element
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload  = () => resolve(el);
        el.onerror = () => reject(new Error('Image load failed'));
        el.src = userPhoto!;
      });
      imgRef.current = img;

      // Initialise FaceMesh
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const FaceMeshCtor = (window as any).FaceMesh as new (opts: {
        locateFile: (file: string) => string;
      }) => {
        setOptions: (opts: Record<string, unknown>) => void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onResults: (cb: (results: any) => void) => void;
        send: (inputs: { image: HTMLImageElement }) => Promise<void>;
        close: () => void;
      };

      const fm = new FaceMeshCtor({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      fm.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      // Run detection
      const landmarks = await new Promise<Landmark[] | null>((resolve, reject) => {
        fm.onResults((results: { multiFaceLandmarks?: Landmark[][] }) => {
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            resolve(results.multiFaceLandmarks[0]);
          } else {
            resolve(null);
          }
        });
        Promise.resolve(fm.send({ image: img })).catch(reject);
      });

      fm.close();

      if (!landmarks || landmarks.length === 0) {
        setErrorMsg('No face detected in this photo. Please try another.');
        setMmStep('mode-select');
        return;
      }

      // Apply distortion to off-screen canvas
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      applyDistortion(ctx, img, landmarks, selectedMode);
      resultCanvasRef.current = canvas;
      setResultDataUrl(canvas.toDataURL('image/jpeg', 0.92));
      setMmStep('result');

    } catch (err) {
      setErrorMsg((err as Error).message || 'Something went wrong. Please try another photo.');
      setMmStep('mode-select');
    }
  }

  function handleReset() {
    setMmStep('upload');
    setUserPhoto(null);
    setResultDataUrl(null);
    setErrorMsg(null);
    imgRef.current         = null;
    resultCanvasRef.current = null;
    if (fileInputRef.current)   fileInputRef.current.value   = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }

  async function getResultBlob(): Promise<Blob> {
    if (!resultCanvasRef.current) throw new Error('No result canvas');
    return canvasToWatermarkedBlob(resultCanvasRef.current);
  }

  async function handleMmDownload() {
    gtag('event', 'share_click', { platform: 'save', feature: 'magic_mirror' });
    const blob = await getResultBlob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'xotiji-magic-mirror.jpg';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleMmShareInstagram() {
    gtag('event', 'share_click', { platform: 'instagram', feature: 'magic_mirror' });
    const blob = await getResultBlob();
    const file = new File([blob], 'xotiji-magic-mirror.jpg', { type: 'image/jpeg' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My XOTIJI Magic Mirror',
          text:  '🪞 My face got warped by XOTIJI Magic Mirror — xotiji.app',
        });
        return;
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      throw err;
    }
    // Web Share not supported — download + open Instagram
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url; a.download = 'xotiji-magic-mirror.jpg'; a.click();
    URL.revokeObjectURL(url);
    window.open('https://www.instagram.com/', '_blank');
    showToast(getLang() === 'tr' ? 'Görsel indirildi! Galeriden seç' : 'Image saved! Select from gallery');
  }

  async function handleMmShareTikTok() {
    gtag('event', 'share_click', { platform: 'tiktok', feature: 'magic_mirror' });
    const blob = await getResultBlob();
    const file = new File([blob], 'xotiji-magic-mirror.jpg', { type: 'image/jpeg' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My XOTIJI Magic Mirror',
          text:  '🪞 My face got warped by XOTIJI Magic Mirror — xotiji.app',
        });
        return;
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      throw err;
    }
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url; a.download = 'xotiji-magic-mirror.jpg'; a.click();
    URL.revokeObjectURL(url);
    window.open('https://www.tiktok.com/', '_blank');
    showToast(getLang() === 'tr' ? 'Görsel indirildi! Galeriden seç' : 'Image saved! Select from gallery');
  }

  function handleMmShareX() {
    gtag('event', 'share_click', { platform: 'twitter', feature: 'magic_mirror' });
    const text = '🪞 My face got warped by XOTIJI Magic Mirror! Try yours → xotiji.app #XOTIJI #MagicMirror';
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://xotiji.app')}`,
      '_blank',
    );
  }

  function handleMmShareWhatsApp() {
    gtag('event', 'share_click', { platform: 'whatsapp', feature: 'magic_mirror' });
    const text = '🪞 My face got warped by XOTIJI Magic Mirror! Try yours → https://xotiji.app';
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  const shareButtons = [
    { icon: '⬇',  label: 'SAVE',      action: handleMmDownload,       bg: 'rgba(255,255,255,0.92)', color: '#0f172a', border: 'none' },
    { icon: '📸', label: 'INSTAGRAM', action: handleMmShareInstagram,  bg: '#e1306c',                color: '#fff',    border: 'none' },
    { icon: '🎵', label: 'TIKTOK',    action: handleMmShareTikTok,     bg: '#010101',                color: '#fff',    border: '1px solid rgba(255,255,255,0.18)' },
    { icon: '𝕏',  label: 'X',         action: handleMmShareX,          bg: '#000',                   color: '#fff',    border: '1px solid rgba(255,255,255,0.18)' },
    { icon: '💬', label: 'WHATSAPP',  action: handleMmShareWhatsApp,   bg: '#25d366',                color: '#fff',    border: 'none' },
  ] as const;

  return (
    <div style={{
      background: 'rgba(0,0,0,0.55)',
      border: '1px solid rgba(167,139,250,0.2)',
      borderRadius: '20px',
      padding: '24px 20px',
      marginBottom: '36px',
      position: 'relative',
    }}>

      {/* ── Script loading indicator ── */}
      {!scriptLoaded && !errorMsg && (
        <div style={{ textAlign: 'center', color: 'rgba(167,139,250,0.6)', fontFamily: 'monospace', fontSize: '12px', letterSpacing: '0.12em', padding: '8px 0' }}>
          ◌ Loading face detection...
        </div>
      )}

      {/* ── Error / warning banner ── */}
      {errorMsg && (
        <div style={{
          background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.25)',
          borderRadius: '10px', padding: '10px 16px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '14px' }}>⚠️</span>
          <span style={{ color: '#2dd4bf', fontFamily: 'monospace', fontSize: '12px', flex: 1, lineHeight: 1.5 }}>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}
          >✕</button>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* STATE 1 — Upload                                               */}
      {/* ────────────────────────────────────────────────────────────── */}
      {mmStep === 'upload' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '20px' }}>
            {getLang() === 'tr' ? 'Yüzünü deforme etmek için bir fotoğraf yükle' : 'Upload a photo to warp your face'}
          </div>
          <div style={{
            border: '2px dashed rgba(167,139,250,0.35)', borderRadius: '24px',
            padding: '40px 24px', background: 'rgba(167,139,250,0.04)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
          }}>
            <div style={{ fontSize: '44px', lineHeight: 1 }}>🪞</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
              {getLang() === 'tr'
                ? 'Fotoğrafın seçildikten sonra önizleme görünür'
                : 'Preview appears after selecting your photo'}
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: '#a78bfa', color: '#0f172a', border: 'none',
                  padding: '12px 28px', borderRadius: '999px', cursor: 'pointer',
                  fontWeight: 700, fontSize: '14px', fontFamily: 'inherit',
                }}
              >
                📁 {getLang() === 'tr' ? 'Dosya Seç' : 'Choose File'}
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
                style={{
                  background: 'rgba(255,255,255,0.08)', color: 'white',
                  border: '2px solid rgba(255,255,255,0.2)',
                  padding: '11px 28px', borderRadius: '999px', cursor: 'pointer',
                  fontWeight: 700, fontSize: '14px', fontFamily: 'inherit',
                }}
              >
                📷 {getLang() === 'tr' ? 'Fotoğraf Çek' : 'Take Photo'}
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            capture="user"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* STATE 2 — Mode selection                                       */}
      {/* ────────────────────────────────────────────────────────────── */}
      {mmStep === 'mode-select' && userPhoto && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

          {/* Photo preview */}
          <img
            src={userPhoto}
            alt="preview"
            style={{
              maxHeight: '120px', borderRadius: '12px', objectFit: 'cover',
              border: '2px solid rgba(167,139,250,0.4)',
            }}
          />

          {/* Mode pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {MODES.map(mode => {
              const active = mode === selectedMode;
              return (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  style={{
                    padding: '7px 16px', borderRadius: '999px', cursor: 'pointer',
                    fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                    background: active ? '#2dd4bf' : 'rgba(45,212,191,0.08)',
                    color:      active ? '#0f172a' : '#2dd4bf',
                    border:     active ? 'none'    : '1px solid rgba(45,212,191,0.4)',
                    transition: 'all 0.15s',
                  }}
                >
                  {mode}
                </button>
              );
            })}
          </div>

          {/* Apply button */}
          <button
            onClick={handleApplyMirror}
            style={{
              background: 'rgba(167,139,250,0.18)',
              border: '1px solid rgba(167,139,250,0.5)',
              color: '#a78bfa', padding: '13px 48px', borderRadius: '999px',
              cursor: 'pointer', fontWeight: 800, fontSize: '15px',
              fontFamily: 'monospace', letterSpacing: '0.1em',
              boxShadow: '0 0 24px rgba(167,139,250,0.25)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(167,139,250,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(167,139,250,0.25)'; }}
          >
            ✦ APPLY MIRROR
          </button>

          {/* Change photo */}
          <button
            onClick={handleReset}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.35)', fontSize: '12px',
              fontFamily: 'monospace', cursor: 'pointer', letterSpacing: '0.06em',
            }}
          >
            ↺ {getLang() === 'tr' ? 'fotoğrafı değiştir' : 'change photo'}
          </button>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* Processing state                                               */}
      {/* ────────────────────────────────────────────────────────────── */}
      {mmStep === 'processing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '16px 0' }}>
          <style>{`@keyframes mmspin { to { transform: rotate(360deg); } }`}</style>
          <div style={{
            width: '36px', height: '36px',
            border: '3px solid rgba(167,139,250,0.2)',
            borderTop: '3px solid #a78bfa',
            borderRadius: '50%',
            animation: 'mmspin 0.9s linear infinite',
          }} />
          <div style={{ color: 'rgba(167,139,250,0.7)', fontFamily: 'monospace', fontSize: '12px', letterSpacing: '0.15em' }}>
            DETECTING FACE...
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* STATE 3 — Result                                               */}
      {/* ────────────────────────────────────────────────────────────── */}
      {mmStep === 'result' && resultDataUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

          {/* Result image */}
          <img
            src={resultDataUrl}
            alt="Magic Mirror result"
            style={{ width: '100%', maxWidth: '500px', borderRadius: '16px', display: 'block' }}
          />

          {/* Active mode label */}
          <div style={{ color: 'rgba(167,139,250,0.7)', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.12em' }}>
            MODE: {selectedMode}
          </div>

          {/* Share buttons — same layout as SpaceSelfie result */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {shareButtons.map(btn => (
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

          {/* Try another */}
          <button
            onClick={handleReset}
            style={{
              background: 'transparent', color: 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '10px 24px', borderRadius: '999px',
              cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
            }}
          >
            ↩ {getLang() === 'tr' ? 'Tekrar Dene' : 'Try Another'}
          </button>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(45,212,191,0.92)', color: '#0f172a',
          fontFamily: 'monospace', fontSize: '13px', fontWeight: 700,
          padding: '10px 22px', borderRadius: '999px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none',
        }}>
          ✓ {toastMsg}
        </div>
      )}
    </div>
  );
}
