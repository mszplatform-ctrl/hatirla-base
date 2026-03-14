import { useState, useRef } from 'react';
import { t, getLang } from '../../i18n';

const AI_BASE = `${import.meta.env.VITE_API_URL || 'https://hatirla-base.onrender.com'}/api/ai`;

const CITIES = [
  { id: 'istanbul', image: '/cities/istanbul.jpg' },
  { id: 'paris',    image: '/cities/paris.jpg'    },
  { id: 'rome',     image: '/cities/rome.jpg'     },
  { id: 'tokyo',    image: '/cities/tokyo.jpg'    },
  { id: 'berlin',   image: '/cities/berlin.jpg'   },
  { id: 'barcelona',image: '/cities/barcelona.jpg'},
  { id: 'dubai',    image: '/cities/dubai.jpg'    },
  { id: 'london',   image: '/cities/london.jpg'   },
];

type City = typeof CITIES[number];

interface SpaceSelfieProps {
  onBack: () => void;
}

export function SpaceSelfie({ onBack }: SpaceSelfieProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleCitySelect(city: City) {
    setSelectedCity(city);
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

    // ── Try AI face swap via Replicate ──
    try {
      const res = await fetch(`${AI_BASE}/face-swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: userPhoto, cityId: selectedCity.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.image) {
          setResultImage(data.image);
          setStep(4);
          return;
        }
      }
    } catch (aiErr) {
      console.warn('[SpaceSelfie] AI face swap unavailable, falling back to canvas:', aiErr);
    }

    // ── Canvas fallback ──
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
    const cityName = t(`spaceSelfie.cities.${selectedCity.id}`);
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

  function handleShareX() {
    const cityName = t(`spaceSelfie.cities.${selectedCity?.id}`);
    const text = getLang() === 'tr'
      ? `${cityName} Space Selfiem! 🚀✨ Kendi güneşim oluyorum. #XOTIJI #SpaceSelfie`
      : `My ${cityName} Space Selfie! 🚀✨ Being my own sun. #XOTIJI #SpaceSelfie`;
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://xotiji.app')}`,
      '_blank'
    );
  }

  function handleShareWhatsApp() {
    const cityName = t(`spaceSelfie.cities.${selectedCity?.id}`);
    const text = getLang() === 'tr'
      ? `${cityName} Space Selfiem'e bak! 🚀 xotiji.app`
      : `Check out my ${cityName} Space Selfie! 🚀 xotiji.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  function handleShareInstagram() {
    window.open('https://www.instagram.com/', '_blank');
  }

  function handleTryAgain() {
    setStep(1);
    setSelectedCity(null);
    setUserPhoto(null);
    setResultImage(null);
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

        {/* ── STEP 1: City Selection ── */}
        {step === 1 && (
          <div>
            <h2 style={{ color: 'white', textAlign: 'center', margin: '0 0 8px', fontSize: '22px', fontWeight: 700 }}>
              {t('spaceSelfie.step1Title')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: '0 0 28px', fontSize: '14px' }}>
              {t('spaceSelfie.selectCityPrompt')}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))',
              gap: '16px',
            }}>
              {CITIES.map(city => (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  style={{
                    position: 'relative',
                    height: '168px',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    border: '2px solid rgba(255,255,255,0.12)',
                    cursor: 'pointer',
                    padding: 0,
                    backgroundImage: `url(${city.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.04)';
                    e.currentTarget.style.borderColor = '#0ea5e9';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(14,165,233,0.35)';
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
                    fontSize: '15px',
                    textAlign: 'center',
                    textShadow: '0 1px 6px rgba(0,0,0,0.8)',
                    letterSpacing: '0.01em',
                  }}>
                    {t(`spaceSelfie.cities.${city.id}`)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Photo Upload ── */}
        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
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
                    🏙️ {t(`spaceSelfie.cities.${selectedCity.id}`)}
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
            <h2 style={{ color: 'white', margin: '0 0 8px', fontSize: '22px', fontWeight: 700 }}>
              🎉 {t('spaceSelfie.step4Title')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', margin: '0 0 28px', fontSize: '13px' }}>
              {t('spaceSelfie.shareNote')}
            </p>

            {/* Result image */}
            <img
              src={resultImage}
              alt="Space Selfie"
              style={{
                width: '100%',
                maxWidth: '460px',
                borderRadius: '20px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
                marginBottom: '32px',
                display: 'block',
                margin: '0 auto 32px',
              }}
            />

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '20px',
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
                📸 {t('spaceSelfie.shareInstagram')}
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
                𝕏 {t('spaceSelfie.shareX')}
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
                💬 {t('spaceSelfie.shareWhatsApp')}
              </button>
            </div>

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
