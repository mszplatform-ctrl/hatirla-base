import { useState, useRef } from 'react';
import { t, getLang } from '../../i18n';

const AI_BASE = `${import.meta.env.VITE_API_URL || 'https://hatirla-base.onrender.com'}/api/ai`;

const CITIES = [
  { id: 'istanbul',  image: '/cities/istanbul.jpg',  label: 'ISTANBUL, TURKEY' },
  { id: 'paris',     image: '/cities/paris.jpg',     label: 'PARIS, FRANCE'    },
  { id: 'rome',      image: '/cities/rome.jpg',      label: 'ROME, ITALY'      },
  { id: 'tokyo',     image: '/cities/tokyo.jpg',     label: 'TOKYO, JAPAN'     },
  { id: 'barcelona', image: '/cities/barcelona.jpg', label: 'BARCELONA, SPAIN' },
  { id: 'dubai',     image: '/cities/dubai.jpg',     label: 'DUBAI, UAE'       },
  { id: 'london',    image: '/cities/london.jpg',    label: 'LONDON, ENGLAND'  },
  { id: 'berlin',    image: '/cities/berlin.jpg',    label: 'BERLIN, GERMANY'  },
];

const TIME_STOPS = [
  { id: 'big_bang',       label: 'Big Bang',  year: '-13.8B', era: 'Origin of Universe', cosmic: true  },
  { id: 'ancient_egypt',  label: '2000 BC',   year: '-2000',  era: 'Ancient Egypt',       cosmic: false },
  { id: 'ancient_greece', label: '500 BC',    year: '-500',   era: 'Ancient Greece',      cosmic: false },
  { id: 'roman_era',      label: '0',         year: '0',      era: 'Roman Era',           cosmic: false },
  { id: 'medieval',       label: '1200',      year: '1200',   era: 'Medieval',            cosmic: false },
  { id: 'renaissance',    label: '1500',      year: '1500',   era: 'Renaissance',         cosmic: false },
  { id: 'industrial',     label: '1800',      year: '1800',   era: 'Industrial Age',      cosmic: false },
  { id: 'present',        label: '2025',      year: '2025',   era: 'Present Day',         cosmic: false },
  { id: 'future2200',     label: '2200',      year: '2200',   era: 'Future City',         cosmic: true  },
  { id: 'mars',           label: '2400',      year: '2400',   era: 'Mars Colony',         cosmic: true  },
  { id: 'orbit',          label: '2600',      year: '2600',   era: 'Earth Orbit',         cosmic: true  },
  { id: 'saturn',         label: '3000',      year: '3000',   era: 'Saturn Rings',        cosmic: true  },
  { id: 'deep_space',     label: '5000',      year: '5000',   era: 'Deep Space',          cosmic: true  },
  { id: 'alien_planet',   label: '10000',     year: '10000',  era: 'Alien World',         cosmic: true  },
  { id: 'end_of_time',    label: '∞',         year: '∞',      era: 'End of Time',         cosmic: true  },
];

type Scene = { id: string; image: string; label: string };

const NEXT_DESTINATIONS = ['MARS ORBIT', 'TOKYO 2050', 'LUNAR BASE', 'SATURN RINGS'];

const EXPLORER_ID = String(Math.floor(1000 + Math.random() * 9000));
const NEXT_DEST = NEXT_DESTINATIONS[Math.floor(Math.random() * NEXT_DESTINATIONS.length)];

function SceneCard({ scene, onClick, accentColor = '#0ea5e9' }: { scene: Scene; onClick: (s: Scene) => void; accentColor?: string }) {
  return (
    <button
      onClick={() => onClick(scene)}
      style={{
        position: 'relative',
        height: '168px',
        borderRadius: '18px',
        overflow: 'hidden',
        border: `2px solid rgba(255,255,255,0.12)`,
        cursor: 'pointer',
        padding: 0,
        backgroundImage: scene.image ? `url(${scene.image})` : undefined,
        backgroundColor: scene.image ? undefined : 'rgba(255,255,255,0.05)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.04)';
        e.currentTarget.style.borderColor = accentColor;
        e.currentTarget.style.boxShadow = `0 8px 32px ${accentColor}55`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.05) 55%)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '14px',
        left: 0,
        right: 0,
        color: 'white',
        fontWeight: 700,
        fontSize: '13px',
        textAlign: 'center',
        textShadow: '0 1px 6px rgba(0,0,0,0.8)',
        letterSpacing: '0.04em',
        fontFamily: 'monospace',
      }}>
        {scene.label}
      </div>
    </button>
  );
}

interface SpaceSelfieProps {
  onBack: () => void;
}

export function SpaceSelfie({ onBack }: SpaceSelfieProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCity, setSelectedCity] = useState<Scene | null>(null);
  const [timeStopIndex, setTimeStopIndex] = useState(0);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleCitySelect(scene: Scene) {
    setSelectedCity(scene);
    setStep(2);
  }

  function handleTimeSelect() {
    const stop = TIME_STOPS[timeStopIndex];
    setSelectedCity({ id: stop.id, image: '', label: stop.era.toUpperCase() });
    setStep(2);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUserPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleGenerate() {
    if (!selectedCity || !userPhoto) return;
    setStep(3);
    setErrorMsg(null);

    // ── Try AI via fal.ai (waits synchronously on the backend) ──
    try {
      const res = await fetch(`${AI_BASE}/face-swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: userPhoto, cityId: selectedCity.id }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        setErrorMsg(`Transmission failed: ${data.error || `Server error ${res.status}`}`);
        setStep(2);
        return;
      }
      if (data.success === true && data.image) {
        setResultImage(data.image);
        setStep(4);
        return;
      }
    } catch (err) {
      setErrorMsg('Transmission failed: Could not reach server. Please try again.');
      setStep(2);
      return;
    }

    // ── Canvas fallback (only for city scenes with a local background image) ──
    if (!selectedCity.image) {
      setErrorMsg('Transmission failed. Please try again.');
      setStep(2);
      return;
    }

    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const SIZE = 1080;
    canvas.width = SIZE;
    canvas.height = SIZE;

    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const [bgImg, userImg] = await Promise.all([
      loadImg(selectedCity.image),
      loadImg(userPhoto),
    ]);

    // 1. City background — cover crop
    const ba = bgImg.width / bgImg.height;
    let bx = 0, by = 0, bw = SIZE, bh = SIZE;
    if (ba > 1) { bw = SIZE * ba; bx = -(bw - SIZE) / 2; }
    else        { bh = SIZE / ba; by = -(bh - SIZE) / 2; }
    ctx.drawImage(bgImg, bx, by, bw, bh);

    // 2. Top gradient overlay
    const topG = ctx.createLinearGradient(0, 0, 0, 280);
    topG.addColorStop(0, 'rgba(0,0,0,0.75)');
    topG.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = topG;
    ctx.fillRect(0, 0, SIZE, 280);

    // 3. Bottom gradient overlay
    const botG = ctx.createLinearGradient(0, SIZE - 180, 0, SIZE);
    botG.addColorStop(0, 'rgba(0,0,0,0)');
    botG.addColorStop(1, 'rgba(0,0,0,0.80)');
    ctx.fillStyle = botG;
    ctx.fillRect(0, SIZE - 180, SIZE, 180);

    // 4. Top text
    const lang = getLang();
    const cityName = selectedCity.label;
    const topText = lang === 'tr' ? `${cityName} Anın` : `Your ${cityName} Moment`;
    ctx.textAlign = 'center';
    ctx.font = 'bold 72px sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 16;
    ctx.fillStyle = 'white';
    ctx.fillText(topText, SIZE / 2, 108);
    ctx.shadowBlur = 0;

    // 5. User photo — circular, centered
    const photoR = 280;
    const cx = SIZE / 2;
    const cy = SIZE / 2 + 30;

    // Sky-blue glow ring
    ctx.save();
    ctx.shadowColor = 'rgba(14,165,233,0.9)';
    ctx.shadowBlur = 70;
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, photoR + 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // White inner ring
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, photoR + 6, 0, Math.PI * 2);
    ctx.stroke();

    // Clip user photo to circle — square cover crop
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
    ctx.clip();
    const ua = userImg.width / userImg.height;
    let sx = 0, sy = 0, sw = userImg.width, sh = userImg.height;
    if (ua > 1) { sw = userImg.height; sx = (userImg.width - sw) / 2; }
    else        { sh = userImg.width;  sy = (userImg.height - sh) / 2; }
    ctx.drawImage(userImg, sx, sy, sw, sh, cx - photoR, cy - photoR, photoR * 2, photoR * 2);
    ctx.restore();

    // 6. "Be Your Own Sun" below photo
    ctx.textAlign = 'center';
    ctx.font = 'italic bold 38px sans-serif';
    ctx.fillStyle = 'rgba(251,146,60,1)';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText('☀  Be Your Own Sun', SIZE / 2, cy + photoR + 68);
    ctx.shadowBlur = 0;

    // 7. Watermark
    ctx.textAlign = 'center';
    ctx.font = '500 28px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('XOTIJI  |  xotiji.app', SIZE / 2, SIZE - 38);

    setResultImage(canvas.toDataURL('image/png'));
    setStep(4);
  }

  function handleDownload() {
    if (!resultImage || !selectedCity) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = `xotiji-space-selfie-${selectedCity.id}.png`;
    a.click();
  }

  const tagline = 'My cosmic travel identity was generated by XOTIJI — xotiji.app';

  function handleShareX() {
    const label = selectedCity?.label ?? '';
    const text = `🚀 COSMIC IDENTITY GENERATED — ${label} ✨ ${tagline} #XOTIJI #SpaceSelfie`;
    navigator.clipboard?.writeText(tagline).catch(() => {});
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://xotiji.app')}`,
      '_blank'
    );
  }

  function handleShareWhatsApp() {
    const label = selectedCity?.label ?? '';
    const text = `🚀 ${label} — Cosmic identity generated! ${tagline}`;
    navigator.clipboard?.writeText(tagline).catch(() => {});
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  function handleShareInstagram() {
    navigator.clipboard?.writeText(tagline).catch(() => {});
    window.open('https://www.instagram.com/', '_blank');
  }

  function handleTryAgain() {
    setStep(1);
    setSelectedCity(null);
    setUserPhoto(null);
    setResultImage(null);
    setErrorMsg(null);
  }

  // Progress bar: 3 segments for steps 1 → 2 → 4
  const progressIndex = step === 1 ? 0 : step === 2 ? 1 : 2;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f172a 0%, #0c2340 55%, #134e4a 100%)',
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '18px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '999px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'inherit',
          }}
        >
          ← {t('spaceSelfie.back')}
        </button>
        <div style={{
          flex: 1,
          textAlign: 'center',
          color: 'white',
          fontWeight: 800,
          fontSize: '17px',
          letterSpacing: '-0.01em',
        }}>
          🚀 {t('spaceSelfie.title')}
        </div>
        <div style={{ width: '80px' }} />
      </div>

      {/* Step progress bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '18px 24px 0' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            height: '4px',
            width: '60px',
            borderRadius: '2px',
            background: i <= progressIndex ? '#0ea5e9' : 'rgba(255,255,255,0.15)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Page content */}
      <div style={{ padding: '28px 24px 60px', maxWidth: '860px', margin: '0 auto' }}>

        {/* ── STEP 1: Scene Selection ── */}
        {step === 1 && (
          <div>
            <h2 style={{ color: 'white', textAlign: 'center', margin: '0 0 8px', fontSize: '22px', fontWeight: 700 }}>
              {t('spaceSelfie.step1Title')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: '0 0 28px', fontSize: '14px' }}>
              {t('spaceSelfie.selectCityPrompt')}
            </p>

            {/* City grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))',
              gap: '16px',
              marginBottom: '36px',
            }}>
              {CITIES.map(city => (
                <SceneCard key={city.id} scene={city} onClick={handleCitySelect} />
              ))}
            </div>

            {/* Unified Timeline panel */}
            <div style={{
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(45,212,191,0.2)',
              borderRadius: '20px',
              padding: '24px 20px',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(45,212,191,0.15)' }} />
                <span style={{ color: '#2dd4bf', fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em' }}>
                  ⏳ TIME &amp; SPACE TELEPORT
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(45,212,191,0.15)' }} />
              </div>

              {/* Dot timeline */}
              <div style={{ position: 'relative', marginBottom: '4px' }}>
                {/* Track */}
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  left: '0',
                  right: '0',
                  height: '2px',
                  background: 'linear-gradient(to right, rgba(45,212,191,0.3) 0%, rgba(45,212,191,0.3) 53%, rgba(139,92,246,0.3) 53%, rgba(139,92,246,0.3) 100%)',
                  zIndex: 0,
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                  {TIME_STOPS.map((stop, i) => {
                    const isSelected = i === timeStopIndex;
                    const color = stop.cosmic ? '#a78bfa' : '#2dd4bf';
                    const glowColor = stop.cosmic ? 'rgba(139,92,246,0.7)' : 'rgba(45,212,191,0.7)';
                    return (
                      <button
                        key={stop.id}
                        onClick={() => setTimeStopIndex(i)}
                        title={stop.era}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '0',
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div style={{
                          width: isSelected ? '14px' : '10px',
                          height: isSelected ? '14px' : '10px',
                          borderRadius: '50%',
                          background: isSelected ? color : 'rgba(255,255,255,0.15)',
                          border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.2)'}`,
                          boxShadow: isSelected ? `0 0 12px ${glowColor}` : 'none',
                          transition: 'all 0.2s',
                          flexShrink: 0,
                        }} />
                        <span style={{
                          color: isSelected ? color : 'rgba(255,255,255,0.28)',
                          fontFamily: 'monospace',
                          fontSize: '8px',
                          fontWeight: 700,
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          maxWidth: '100%',
                          transition: 'color 0.2s',
                        }}>
                          {stop.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={0}
                max={TIME_STOPS.length - 1}
                value={timeStopIndex}
                onChange={e => setTimeStopIndex(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: TIME_STOPS[timeStopIndex].cosmic ? '#a78bfa' : '#2dd4bf',
                  cursor: 'pointer',
                  margin: '14px 0 20px',
                }}
              />

              {/* Selected era display */}
              {(() => {
                const stop = TIME_STOPS[timeStopIndex];
                const color = stop.cosmic ? '#a78bfa' : '#2dd4bf';
                const glowColor = stop.cosmic ? 'rgba(139,92,246,0.15)' : 'rgba(45,212,191,0.1)';
                const borderColor = stop.cosmic ? 'rgba(139,92,246,0.3)' : 'rgba(45,212,191,0.25)';
                return (
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '20px',
                    background: glowColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    padding: '14px',
                  }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.12em', marginBottom: '6px' }}>
                      DESTINATION
                    </div>
                    <div style={{ color: 'white', fontFamily: 'monospace', fontSize: '20px', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '4px' }}>
                      {stop.era.toUpperCase()}
                    </div>
                    <div style={{ color, fontFamily: 'monospace', fontSize: '12px', opacity: 0.85 }}>
                      {stop.year}  ·  {stop.cosmic ? '✦ COSMIC' : '◈ HISTORICAL'}
                    </div>
                  </div>
                );
              })()}

              <div style={{ textAlign: 'center' }}>
                {(() => {
                  const isCosmic = TIME_STOPS[timeStopIndex].cosmic;
                  const btnColor = isCosmic ? '#a78bfa' : '#2dd4bf';
                  const btnBg = isCosmic ? 'rgba(139,92,246,0.18)' : 'rgba(45,212,191,0.18)';
                  const btnBorder = isCosmic ? 'rgba(139,92,246,0.5)' : 'rgba(45,212,191,0.5)';
                  const btnGlow = isCosmic ? 'rgba(139,92,246,0.25)' : 'rgba(45,212,191,0.25)';
                  return (
                    <button
                      onClick={handleTimeSelect}
                      style={{
                        background: btnBg,
                        border: `1px solid ${btnBorder}`,
                        color: btnColor,
                        padding: '13px 48px',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: '15px',
                        fontFamily: 'monospace',
                        letterSpacing: '0.1em',
                        boxShadow: `0 0 24px ${btnGlow}`,
                        transition: 'all 0.2s',
                      }}
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

        {/* ── STEP 2: Photo Upload ── */}
        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
            {/* Error banner */}
            {errorMsg && (
              <div style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'left',
              }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
                <span style={{ color: '#fca5a5', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.5 }}>
                  {errorMsg}
                </span>
                <button
                  onClick={() => setErrorMsg(null)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}
                >✕</button>
              </div>
            )}
            <h2 style={{ color: 'white', margin: '0 0 8px', fontSize: '22px', fontWeight: 700 }}>
              {t('spaceSelfie.step2Title')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 32px', fontSize: '14px' }}>
              {t('spaceSelfie.uploadPrompt')}
            </p>

            {!userPhoto ? (
              <div style={{
                border: '2px dashed rgba(14,165,233,0.4)',
                borderRadius: '24px',
                padding: '56px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                background: 'rgba(14,165,233,0.04)',
              }}>
                <div style={{ fontSize: '56px', lineHeight: 1 }}>📸</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
                  {getLang() === 'tr' ? 'Fotoğrafın seçildikten sonra önizleme görünür' : 'Preview appears after selecting your photo'}
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      padding: '13px 28px',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '15px',
                      fontFamily: 'inherit',
                    }}
                  >
                    📁 {t('spaceSelfie.chooseFile')}
                  </button>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: 'white',
                      border: '2px solid rgba(255,255,255,0.2)',
                      padding: '12px 28px',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '15px',
                      fontFamily: 'inherit',
                    }}
                  >
                    📷 {t('spaceSelfie.takePhoto')}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
                {/* City badge */}
                {selectedCity && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(14,165,233,0.15)',
                    border: '1px solid rgba(14,165,233,0.35)',
                    borderRadius: '999px',
                    padding: '6px 16px',
                    color: '#7dd3fc',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}>
                    🏙️ {selectedCity.label}
                  </div>
                )}
                {/* Photo preview */}
                <div style={{
                  width: '220px',
                  height: '220px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '4px solid #0ea5e9',
                  boxShadow: '0 0 50px rgba(14,165,233,0.45)',
                }}>
                  <img
                    src={userPhoto}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    onClick={() => { setUserPhoto(null); setTimeout(() => fileInputRef.current?.click(), 50); }}
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      color: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      padding: '12px 24px',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '14px',
                      fontFamily: 'inherit',
                    }}
                  >
                    🔄 {t('spaceSelfie.chooseFile')}
                  </button>
                  <button
                    onClick={handleGenerate}
                    style={{
                      background: 'linear-gradient(135deg, #0f766e 0%, #0ea5e9 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '13px 36px',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: '16px',
                      boxShadow: '0 4px 24px rgba(14,165,233,0.45)',
                      fontFamily: 'inherit',
                    }}
                  >
                    ✨ {t('spaceSelfie.generate')}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Generating ── */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'white' }}>
            <div style={{ fontSize: '72px', marginBottom: '28px', animation: 'pulse 1s infinite' }}>⚡</div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px' }}>
              {t('spaceSelfie.step3Title')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', margin: 0 }}>
              {t('spaceSelfie.step3Subtitle')}
            </p>
          </div>
        )}

        {/* ── STEP 4: Result ── */}
        {step === 4 && resultImage && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#0ea5e9', margin: '0 0 4px', fontSize: '20px', fontWeight: 800, letterSpacing: '0.08em', fontFamily: 'monospace' }}>
              ✦ COSMIC IDENTITY GENERATED
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', margin: '0 0 24px', fontSize: '13px' }}>
              Your transmission is ready. Where will you go next?
            </p>

            {/* Result image with HUD overlay */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '460px',
              margin: '0 auto 28px',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
            }}>
              <img
                src={resultImage}
                alt="Space Selfie"
                style={{ width: '100%', display: 'block' }}
              />

              {/* HUD — top left */}
              <div style={{
                position: 'absolute',
                top: '14px',
                left: '16px',
                fontFamily: 'monospace',
                fontSize: '11px',
                lineHeight: 1.6,
                color: 'rgba(45,212,191,0.9)',
                textShadow: '0 0 8px rgba(45,212,191,0.6)',
                pointerEvents: 'none',
              }}>
                <div style={{ fontWeight: 700, letterSpacing: '0.1em' }}>XOTIJI TRANSMISSION</div>
                <div style={{ opacity: 0.75 }}>EXPLORER ID: {EXPLORER_ID}</div>
              </div>

              {/* HUD — bottom bar */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 100%)',
                padding: '28px 16px 14px',
                fontFamily: 'monospace',
                pointerEvents: 'none',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '10px', letterSpacing: '0.12em', marginBottom: '2px' }}>
                  CURRENT LOCATION
                </div>
                <div style={{ color: 'white', fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '8px' }}>
                  {selectedCity?.label ?? ''}
                </div>
                <div style={{ color: 'rgba(45,212,191,0.7)', fontSize: '10px', letterSpacing: '0.12em', marginBottom: '2px' }}>
                  NEXT DESTINATION
                </div>
                <div style={{ color: '#2dd4bf', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em' }}>
                  ► {NEXT_DEST}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '14px',
            }}>
              <button
                onClick={handleDownload}
                style={{
                  background: 'linear-gradient(135deg, #0f766e, #0ea5e9)',
                  color: 'white',
                  border: 'none',
                  padding: '13px 26px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '15px',
                  boxShadow: '0 4px 20px rgba(14,165,233,0.35)',
                  fontFamily: 'inherit',
                }}
              >
                ⬇️ {t('spaceSelfie.download')}
              </button>

              <button
                onClick={handleShareInstagram}
                style={{
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '13px 26px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '15px',
                  fontFamily: 'inherit',
                }}
              >
                📸 Transmit to Instagram
              </button>

              <button
                onClick={handleShareX}
                style={{
                  background: '#000',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.18)',
                  padding: '12px 26px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '15px',
                  fontFamily: 'inherit',
                }}
              >
                𝕏 Transmit to X
              </button>

              <button
                onClick={handleShareWhatsApp}
                style={{
                  background: '#25D366',
                  color: 'white',
                  border: 'none',
                  padding: '13px 26px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '15px',
                  fontFamily: 'inherit',
                }}
              >
                💬 Send Signal
              </button>
            </div>

            {/* Tagline */}
            <p style={{
              color: 'rgba(255,255,255,0.28)',
              fontSize: '11px',
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
              margin: '0 0 20px',
            }}>
              My cosmic travel identity was generated by XOTIJI — xotiji.app
            </p>

            <button
              onClick={handleTryAgain}
              style={{
                background: 'transparent',
                color: 'rgba(255,255,255,0.38)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '10px 22px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'inherit',
              }}
            >
              🔄 {t('spaceSelfie.tryAgain')}
            </button>
          </div>
        )}
      </div>

      {/* Hidden canvas used for compositing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
