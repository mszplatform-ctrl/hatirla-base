import { useState, useRef } from 'react';
import { t, getLang } from '../../i18n';
import { CinematicSequence } from './CinematicSequence';
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
  { id: 'big_bang',       label: 'Big Bang',  year: '-13.8B', era: 'Origin of Universe', cosmic: true  },
  { id: 'ancient_egypt',  label: '2000 BC',   year: '-2000',  era: 'Ancient Egypt',       cosmic: false },
  { id: 'ancient_greece', label: '500 BC',    year: '-500',   era: 'Ancient Greece',      cosmic: false },
  { id: 'roman_era',      label: '0',         year: '0',      era: 'Roman Era',           cosmic: false },
  { id: 'medieval',       label: '1200',      year: '1200',   era: 'Medieval',            cosmic: false },
  { id: 'renaissance',    label: '1500',      year: '1500',   era: 'Renaissance',         cosmic: false },
  { id: 'industrial',     label: '1800',      year: '1800',   era: 'Industrial Age',      cosmic: false },
  { id: 'present',        label: '2026',      year: '2026',   era: 'Present Day',         cosmic: false },
  { id: 'future2200',     label: '2200',      year: '2200',   era: 'Future City',         cosmic: true  },
  { id: 'mars',           label: '2400',      year: '2400',   era: 'Mars Colony',         cosmic: true  },
  { id: 'orbit',          label: '2600',      year: '2600',   era: 'Earth Orbit',         cosmic: true  },
  { id: 'saturn',         label: '3000',      year: '3000',   era: 'Saturn Rings',        cosmic: true  },
  { id: 'deep_space',     label: '5000',      year: '5000',   era: 'Deep Space',          cosmic: true  },
  { id: 'alien_planet',   label: '10000',     year: '10000',  era: 'Alien World',         cosmic: true  },
  { id: 'end_of_time',    label: '∞',         year: '∞',      era: 'End of Time',         cosmic: true  },
];

const EXPLORER_ID = String(Math.floor(1000 + Math.random() * 9000));

function callFaceSwap(photo: string, sceneId: string): Promise<string> {
  return fetch(`${AI_BASE}/face-swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photo, cityId: sceneId }),
  }).then(res =>
    res.json().then((data: { success: boolean; image?: string; error?: string }) => {
      if (!res.ok || data.success === false) throw new Error(`Transmission failed: ${data.error || `Server error ${res.status}`}`);
      if (!data.image) throw new Error('No image in response');
      return data.image;
    })
  );
}

interface SpaceSelfieProps {
  onBack: () => void;
}

export function SpaceSelfie({ onBack }: SpaceSelfieProps) {
  const [flowStep, setFlowStep] = useState<'select' | 'photo-modal' | 'cinematic' | 'result'>('select');
  const [selectedScene, setSelectedScene] = useState<SelectedScene | null>(null);
  const [timeStopIndex, setTimeStopIndex] = useState(7); // default: Present Day
  const [userPhoto, setUserPhoto]   = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const apiPromiseRef = useRef<Promise<string> | null>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function openPhotoModal(scene: SelectedScene) {
    setSelectedScene(scene);
    setUserPhoto(null);
    setErrorMsg(null);
    setFlowStep('photo-modal');
  }

  function handleCitySelect(city: SelectedScene) {
    openPhotoModal(city);
  }

  function handleTimeSelect() {
    const stop = TIME_STOPS[timeStopIndex];
    openPhotoModal({
      id: stop.id, image: '', label: stop.era.toUpperCase(),
      year: stop.year, era: stop.era, cosmic: stop.cosmic,
    });
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUserPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleLaunch() {
    if (!selectedScene || !userPhoto) return;
    apiPromiseRef.current = callFaceSwap(userPhoto, selectedScene.id);
    setFlowStep('cinematic');
  }

  function handleCinematicComplete(image: string) {
    setResultImage(image);
    setFlowStep('result');
  }

  function handleCinematicError(msg: string) {
    setErrorMsg(msg);
    setFlowStep('photo-modal');
  }

  function handleTryAgain() {
    setFlowStep('select');
    setSelectedScene(null);
    setUserPhoto(null);
    setResultImage(null);
    setErrorMsg(null);
    apiPromiseRef.current = null;
  }

  function handleDownload() {
    if (!resultImage || !selectedScene) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = `xotiji-space-selfie-${selectedScene.id}.png`;
    a.click();
  }

  const tagline = 'My cosmic travel identity was generated by XOTIJI — xotiji.app';

  function handleShareX() {
    const text = `🚀 COSMIC IDENTITY GENERATED — ${selectedScene?.label ?? ''} ✨ ${tagline} #XOTIJI #SpaceSelfie`;
    navigator.clipboard?.writeText(tagline).catch(() => {});
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://xotiji.app')}`, '_blank');
  }

  function handleShareWhatsApp() {
    const text = `🚀 ${selectedScene?.label ?? ''} — Cosmic identity generated! ${tagline}`;
    navigator.clipboard?.writeText(tagline).catch(() => {});
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  function handleShareInstagram() {
    navigator.clipboard?.writeText(tagline).catch(() => {});
    window.open('https://www.instagram.com/', '_blank');
  }

  // ── Cinematic: full-screen, replaces everything ──
  if (flowStep === 'cinematic' && selectedScene && apiPromiseRef.current) {
    return (
      <CinematicSequence
        scene={selectedScene}
        apiPromise={apiPromiseRef.current}
        onComplete={handleCinematicComplete}
        onError={handleCinematicError}
      />
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

          {/* Share buttons (bottom right) — icon-only 44px circles */}
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '10px' }}>
            {[
              { label: '⬇', title: 'Download',  action: handleDownload        },
              { label: '📸', title: 'Instagram', action: handleShareInstagram  },
              { label: '𝕏',  title: 'X',         action: handleShareX          },
              { label: '💬', title: 'WhatsApp',  action: handleShareWhatsApp   },
            ].map(btn => (
              <button
                key={btn.title}
                onClick={btn.action}
                title={btn.title}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.92)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '18px', lineHeight: 1,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                  fontFamily: 'system-ui',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Below image */}
        <div style={{ padding: '22px 24px 40px', textAlign: 'center', background: '#000' }}>
          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.04em', margin: '0 0 20px' }}>
            {tagline}
          </p>
          <button
            onClick={handleTryAgain}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 24px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
          >
            🔄 {t('spaceSelfie.tryAgain')}
          </button>
        </div>
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
                <input ref={fileInputRef}  type="file" accept="image/*"                style={{ display: 'none' }} onChange={handlePhotoChange} />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={handlePhotoChange} />
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
                    ✦ INITIATE
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            {CITIES.map(city => (
              <button
                key={city.id}
                onClick={() => handleCitySelect(city)}
                style={{
                  position: 'relative', height: '168px', borderRadius: '18px', overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.12)', cursor: 'pointer', padding: 0,
                  backgroundImage: `url(${city.image})`, backgroundSize: 'cover', backgroundPosition: 'center',
                  transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(14,165,233,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
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
              <div style={{ position: 'absolute', top: '6px', left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, rgba(45,212,191,0.3) 0%, rgba(45,212,191,0.3) 53%, rgba(139,92,246,0.3) 53%, rgba(139,92,246,0.3) 100%)', zIndex: 0 }} />
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
