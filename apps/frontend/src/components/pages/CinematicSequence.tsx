import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface SelectedScene {
  id: string;
  label: string;
  year: string;
  era: string;
  cosmic: boolean;
  image: string;
}

interface Props {
  scene: SelectedScene;
  apiPromise: Promise<string>;
  onComplete: (image: string) => void;
  onError: (msg: string) => void;
}

// ── Soft circular sprite for PointsMaterial ──────────────────────────────────
function makeCircleSprite(): THREE.CanvasTexture {
  const size = 64;
  const cvs  = document.createElement('canvas');
  cvs.width  = size;
  cvs.height = size;
  const ctx  = cvs.getContext('2d')!;
  const c    = size / 2;
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0,   'rgba(255,255,255,1)');
  grad.addColorStop(0.45,'rgba(255,255,255,0.85)');
  grad.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(cvs);
}

// ── Canvas-generated Earth texture ───────────────────────────────────────────
function makeEarthTexture(): THREE.CanvasTexture {
  const W = 1024, H = 512;
  const cvs = document.createElement('canvas');
  cvs.width  = W;
  cvs.height = H;
  const ctx  = cvs.getContext('2d')!;

  // Deep ocean gradient
  const ocean = ctx.createLinearGradient(0, 0, 0, H);
  ocean.addColorStop(0,   '#061830');
  ocean.addColorStop(0.5, '#0a2245');
  ocean.addColorStop(1,   '#040e1e');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, W, H);

  // Irregular continent blobs
  function blob(x: number, y: number, rx: number, ry: number, rot: number, color: string) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    const steps = 14;
    for (let s = 0; s <= steps; s++) {
      const a = (s / steps) * Math.PI * 2;
      const r = 0.68 + Math.random() * 0.64;
      const px = Math.cos(a) * rx * r;
      const py = Math.sin(a) * ry * r;
      s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Continents
  blob(190, 195, 68,  130, -0.25, '#1a3d12'); // Americas N
  blob(210, 350, 50,  85,   0.15, '#1e3a10'); // Americas S
  blob(490, 160, 52,  78,   0.1,  '#1f3d16'); // Europe
  blob(510, 295, 60,  115,  0.0,  '#2a3212'); // Africa
  blob(700, 160, 130, 90,   0.0,  '#1a3a14'); // Asia W+C
  blob(820, 185, 75,  58,  -0.2,  '#213818'); // Asia E
  blob(825, 335, 60,  42,   0.25, '#2e3014'); // Australia
  blob(318, 78,  42,  30,   0.1,  '#b8d0e0'); // Greenland (ice)
  // Poles
  const arcticGrad = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 100);
  arcticGrad.addColorStop(0, 'rgba(190,215,235,0.9)');
  arcticGrad.addColorStop(1, 'rgba(190,215,235,0)');
  ctx.fillStyle = arcticGrad;
  ctx.fillRect(0, 0, W, 90);
  const antarcticGrad = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, 120);
  antarcticGrad.addColorStop(0, 'rgba(200,220,240,0.95)');
  antarcticGrad.addColorStop(1, 'rgba(200,220,240,0)');
  ctx.fillStyle = antarcticGrad;
  ctx.fillRect(0, H - 100, W, 100);

  return new THREE.CanvasTexture(cvs);
}

// ── Web Audio API warp sound ──────────────────────────────────────────────────
function startWarpSound(): AudioContext | null {
  try {
    const ac = new AudioContext();

    // Impulse reverb
    const revLen = Math.floor(ac.sampleRate * 2.8);
    const revBuf = ac.createBuffer(2, revLen, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = revBuf.getChannelData(ch);
      for (let i = 0; i < revLen; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / revLen, 1.6);
      }
    }
    const conv = ac.createConvolver();
    conv.buffer = revBuf;

    // Master gain: 0.3 → 0 over 10s
    const master = ac.createGain();
    master.gain.setValueAtTime(0.3, ac.currentTime);
    master.gain.linearRampToValueAtTime(0, ac.currentTime + 10);
    master.connect(ac.destination);

    const dry = ac.createGain(); dry.gain.value = 0.55; dry.connect(master);
    const wet = ac.createGain(); wet.gain.value = 0.45; conv.connect(wet); wet.connect(master);

    // Osc 1: sawtooth sweep 800 → 100 Hz over 3s
    const osc1 = ac.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(800, ac.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(100, ac.currentTime + 3);
    osc1.connect(dry);
    osc1.connect(conv);
    osc1.start();
    osc1.stop(ac.currentTime + 10);

    // Osc 2: deep 60 Hz rumble
    const osc2 = ac.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 60;
    const rumble = ac.createGain(); rumble.gain.value = 0.55;
    osc2.connect(rumble); rumble.connect(master);
    osc2.start();
    osc2.stop(ac.currentTime + 10);

    return ac;
  } catch {
    return null; // silently skip if AudioContext unavailable
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CinematicSequence({ scene, apiPromise, onComplete, onError }: Props) {
  // DOM refs — mutated directly in RAF, no re-renders
  const mountRef    = useRef<HTMLDivElement>(null);
  const countRef    = useRef<HTMLDivElement>(null);  // countdown number
  const chromaRRef  = useRef<HTMLDivElement>(null);
  const chromaBRef  = useRef<HTMLDivElement>(null);
  const arrivingRef = useRef<HTMLDivElement>(null);  // "ARRIVING AT:" block
  const sunGlowRef  = useRef<HTMLDivElement>(null);  // 3-layer sun glow
  const goldenRef   = useRef<HTMLDivElement>(null);  // golden light flood
  const sunTextRef  = useRef<HTMLDivElement>(null);  // "TOWARD THE SUN"
  const rafRef      = useRef(0);

  // Internal animation state (refs only, no re-renders)
  const phaseRef      = useRef(0);
  const apiResultRef  = useRef<string | null>(null);
  const apiDoneRef    = useRef(false);
  const completingRef = useRef(false);
  const erroredRef    = useRef(false);
  const signalRef     = useRef(false);

  // React state — only for structural show/hide (≤6 transitions total)
  const [phase,      setPhaseState]  = useState(0); // 0-5 (5 = signal lock)
  const [whiteFlash, setWhiteFlash]  = useState(false);

  useEffect(() => {
    // ── API tracking ──
    apiPromise
      .then((img: string) => { apiResultRef.current = img; apiDoneRef.current = true; })
      .catch((err: unknown) => {
        if (!completingRef.current) {
          erroredRef.current = true;
          onError(err instanceof Error ? err.message : 'Generation failed');
        }
      });

    // ── Sound (immediately after LAUNCH click gesture) ──
    const audioCtx = startWarpSound();

    // ── Phase helper (called from RAF, safe because refs are stable) ──
    const advancePhase = (p: number) => {
      if (phaseRef.current < p) { phaseRef.current = p; setPhaseState(p); }
    };

    const tryComplete = () => {
      if (completingRef.current || erroredRef.current) return;
      completingRef.current = true;
      setWhiteFlash(true);
      setTimeout(() => { if (apiResultRef.current) onComplete(apiResultRef.current); }, 600);
    };

    // ── Three.js ──
    const isMobile = window.innerWidth < 768;
    const N = isMobile ? 2000 : 5000;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    const mount = mountRef.current;
    if (mount) mount.appendChild(renderer.domElement);

    const scene3d = new THREE.Scene();
    const camera  = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 5);

    // ── Warp particles ──
    const posArr  = new Float32Array(N * 3);
    const baseVel = new Float32Array(N); // per-particle speed multiplier (0.5-1.5)
    const colArr  = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      posArr[i * 3]     = (Math.random() - 0.5) * 40;
      posArr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      posArr[i * 3 + 2] = -800 + Math.random() * 790;
      baseVel[i]        = 0.5 + Math.random();
      if (Math.random() > 0.65) {        // teal #00d4aa
        colArr[i * 3] = 0; colArr[i * 3 + 1] = 0.831; colArr[i * 3 + 2] = 0.667;
      } else {                           // white
        colArr[i * 3] = 1; colArr[i * 3 + 1] = 1; colArr[i * 3 + 2] = 1;
      }
    }
    const sprite = makeCircleSprite();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colArr, 3));
    const mat = new THREE.PointsMaterial({
      size: 2, sizeAttenuation: true, vertexColors: true,
      map: sprite, transparent: true, alphaTest: 0.05, depthWrite: false,
    });
    scene3d.add(new THREE.Points(geo, mat));

    // ── 200 static background stars ──
    const starPos = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      starPos[i * 3]     = (Math.random() - 0.5) * 350;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 350;
      starPos[i * 3 + 2] = -160 - Math.random() * 80;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat    = new THREE.PointsMaterial({ size: 0.6, color: 0xffffff, sizeAttenuation: true });
    const starPoints = new THREE.Points(starGeo, starMat);
    starPoints.visible = false;
    scene3d.add(starPoints);

    // ── Earth ──
    const earthTex = makeEarthTexture();
    const earthGeo = new THREE.SphereGeometry(2, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTex, shininess: 25,
      specular: new THREE.Color(0x1a3366),
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.position.set(0, 0, -30);
    earth.visible = false;
    scene3d.add(earth);

    // Atmosphere glow: slightly larger, #4488ff, opacity 0.15
    const atmoGeo = new THREE.SphereGeometry(2.22, 32, 32);
    const atmoMat = new THREE.MeshPhongMaterial({
      color: 0x4488ff, transparent: true, opacity: 0,
      side: THREE.FrontSide, depthWrite: false,
    });
    earth.add(new THREE.Mesh(atmoGeo, atmoMat));

    // ── Lights ──
    scene3d.add(new THREE.AmbientLight(0x1a1a2e, 1.5));
    const sunLight = new THREE.DirectionalLight(0xffd0a0, 0);
    sunLight.position.set(0, -2, -4);
    scene3d.add(sunLight);

    // ── Animation loop ──
    const startTime = performance.now();
    let lastTime    = startTime;
    let lastCt      = 10;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const now     = performance.now();
      const elapsed = (now - startTime) / 1000;
      const dt      = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // ── Phase transitions ──
      if (elapsed >= 3  && phaseRef.current === 0) advancePhase(1);
      if (elapsed >= 6  && phaseRef.current === 1) {
        advancePhase(2);
        earth.visible      = true;
        starPoints.visible = true;
      }
      if (elapsed >= 8  && phaseRef.current === 2) advancePhase(3);
      if (elapsed >= 10 && phaseRef.current === 3) {
        if (apiDoneRef.current) {
          advancePhase(4);
          tryComplete();
        } else {
          signalRef.current = true;
          advancePhase(5);
        }
      }
      if (phaseRef.current === 5 && apiDoneRef.current && !completingRef.current) {
        advancePhase(4);
        tryComplete();
      }

      const ph   = phaseRef.current;
      const pArr = geo.attributes.position.array as Float32Array;

      // ── Countdown: update once per second via DOM ref ──
      const ct = Math.max(1, 10 - Math.floor(elapsed));
      if (ct !== lastCt && countRef.current) { lastCt = ct; countRef.current.textContent = String(ct); }

      // ── Warp particles: easing speed = elapsed² * 0.003, floored at 0.01 ──
      if (ph === 0 || ph === 1 || ph === 5) {
        const boost = Math.max(elapsed * elapsed * 0.003, 0.01);
        for (let i = 0; i < N; i++) {
          pArr[i * 3 + 2] += baseVel[i] * boost * dt * 4000;

          if (ph === 1) {
            // Spiral
            const a = elapsed * 1.5 + i * 0.003;
            pArr[i * 3]     += Math.cos(a) * 0.01;
            pArr[i * 3 + 1] += Math.sin(a) * 0.01;
          }
          if (pArr[i * 3 + 2] > 8) {
            pArr[i * 3]     = (Math.random() - 0.5) * 40;
            pArr[i * 3 + 1] = (Math.random() - 0.5) * 40;
            pArr[i * 3 + 2] = -800;
          }
        }
        geo.attributes.position.needsUpdate = true;
      }

      // ── Earth approach (phase 2: 6-8s) ──
      if (ph === 2) {
        const t = Math.min((elapsed - 6) / 2, 1);
        earth.position.z  = -30 + t * 26;   // -30 → -4
        atmoMat.opacity   = t * 0.15;
        camera.rotation.z = Math.sin(t * Math.PI) * 0.04;
      }

      // ── Sunrise (phase 3: 8-10s) ──
      if (ph === 3) {
        const t = Math.min((elapsed - 8) / 2, 1);
        sunLight.intensity = t * 4;
        atmoMat.opacity    = 0.15 + t * 0.25;
        if (sunGlowRef.current) {
          sunGlowRef.current.style.bottom  = `${-10 + t * 55}%`;
          sunGlowRef.current.style.opacity = String(Math.min(t * 2.5, 1));
        }
        if (goldenRef.current) goldenRef.current.style.opacity = String(t * 0.75);
        if (sunTextRef.current) sunTextRef.current.style.opacity = String(Math.min((t - 0.3) * 2.5, 1));
      }

      // ── Chromatic aberration (phase 1: 3-6s) ──
      if (ph === 1) {
        const t = Math.min((elapsed - 3) / 3, 1);
        const o = t * 16;
        if (chromaRRef.current) { chromaRRef.current.style.transform = `translate(${o}px,0)`;  chromaRRef.current.style.opacity = String(t * 0.22); }
        if (chromaBRef.current) { chromaBRef.current.style.transform = `translate(-${o}px,0)`; chromaBRef.current.style.opacity = String(t * 0.22); }
      } else if (ph >= 2) {
        if (chromaRRef.current) chromaRRef.current.style.opacity = '0';
        if (chromaBRef.current) chromaBRef.current.style.opacity = '0';
      }

      // ── "ARRIVING AT:" fade-in (phase 1) + fade-out (phase 2 start) ──
      if (ph === 1 && arrivingRef.current) {
        const t = Math.min((elapsed - 3) / 1.5, 1);
        arrivingRef.current.style.opacity   = String(t);
        arrivingRef.current.style.transform = `translate(-50%, ${-50 + (1 - t) * 5}%)`;
      }
      if (ph === 2 && arrivingRef.current) {
        const t = Math.min((elapsed - 6) / 0.6, 1);
        arrivingRef.current.style.opacity = String(1 - t);
      }

      if (earth.visible) earth.rotation.y += 0.004;

      renderer.render(scene3d, camera);
    };

    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      try { audioCtx?.close(); } catch { /* ignore */ }
      geo.dispose(); mat.dispose(); sprite.dispose();
      starGeo.dispose(); starMat.dispose();
      earthGeo.dispose(); earthMat.dispose(); earthTex.dispose();
      atmoGeo.dispose(); atmoMat.dispose();
      renderer.dispose();
      try {
        if (mount && renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      } catch { /* ignore */ }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showCountdown = phase === 0 || phase === 1 || phase === 3;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000000', zIndex: 100, overflow: 'hidden' }}>

      {/* Three.js canvas */}
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Chromatic aberration */}
      <div ref={chromaRRef} style={{ position: 'absolute', inset: 0, background: 'rgba(255,20,20,0.14)',  opacity: 0, pointerEvents: 'none', mixBlendMode: 'screen' }} />
      <div ref={chromaBRef} style={{ position: 'absolute', inset: 0, background: 'rgba(20,60,255,0.14)', opacity: 0, pointerEvents: 'none', mixBlendMode: 'screen' }} />

      {/* Golden light flood (rises during phase 3) */}
      <div
        ref={goldenRef}
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0,
          background: 'radial-gradient(ellipse at 50% 70%, rgba(255,195,50,0.85) 0%, rgba(255,100,0,0.4) 45%, transparent 75%)',
        }}
      />

      {/* Countdown — large monospace, center screen */}
      {showCountdown && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', zIndex: 2, textAlign: 'center',
        }}>
          <div
            ref={countRef}
            style={{
              fontFamily: 'monospace',
              fontSize: '15vw',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1,
              userSelect: 'none',
              textShadow:
                '0 0 40px rgba(255,255,255,0.9), 0 0 100px rgba(14,165,233,0.7), 0 0 200px rgba(14,165,233,0.3)',
            }}
          >
            10
          </div>
        </div>
      )}

      {/* "ARRIVING AT:" (phase 1 — always in DOM, opacity via ref) */}
      <div
        ref={arrivingRef}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none', opacity: 0, zIndex: 2,
        }}
      >
        <div style={{ color: 'rgba(45,212,191,0.7)', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.28em', marginBottom: '14px' }}>
          ARRIVING AT:
        </div>
        <div style={{
          color: 'white', fontFamily: 'monospace',
          fontSize: 'clamp(20px, 3.5vw, 34px)', fontWeight: 800, letterSpacing: '0.1em',
          textShadow: scene.cosmic ? '0 0 40px rgba(139,92,246,0.9)' : '0 0 40px rgba(45,212,191,0.9)',
        }}>
          {scene.label}
        </div>
        <div style={{ color: scene.cosmic ? '#a78bfa' : '#2dd4bf', fontFamily: 'monospace', fontSize: '14px', marginTop: '10px', letterSpacing: '0.15em' }}>
          {scene.year}
        </div>
      </div>

      {/* Sun glow — 3 concentric CSS layers, rises during phase 3 */}
      <div
        ref={sunGlowRef}
        style={{
          position: 'absolute', left: '50%', bottom: '-10%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none', opacity: 0, zIndex: 1,
          width: '1px', height: '1px', // anchor point; children use absolute positioning
        }}
      >
        {/* Outer halo — blur 60px */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,179,71,0.4) 0%, rgba(255,120,30,0.15) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        {/* Mid halo — blur 20px */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,220,60,0.7) 0%, rgba(255,179,71,0.4) 45%, transparent 70%)',
          filter: 'blur(20px)',
        }} />
        {/* Inner core — blur 4px */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(255,255,215,1)',
          filter: 'blur(4px)',
          boxShadow: '0 0 30px 10px rgba(255,240,180,0.8)',
        }} />
      </div>

      {/* "TOWARD THE SUN" — thin elegant, gold */}
      <div
        ref={sunTextRef}
        style={{
          position: 'absolute', bottom: '18%', left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center', pointerEvents: 'none', opacity: 0, zIndex: 3,
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{
          color: '#FFD700', fontFamily: 'monospace',
          fontSize: '18px', fontWeight: 300, letterSpacing: '0.4em',
          textShadow: '0 0 20px rgba(255,215,0,0.95), 0 0 60px rgba(255,150,0,0.7)',
        }}>
          TOWARD THE SUN
        </div>
      </div>

      {/* Signal lock (phase 5) */}
      {phase === 5 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none', zIndex: 4,
        }}>
          <style>{`@keyframes sigBlink { 0%,100%{opacity:1} 50%{opacity:0.12} }`}</style>
          <div style={{
            color: '#00d4aa', fontFamily: 'monospace', fontSize: '16px',
            fontWeight: 700, letterSpacing: '0.22em',
            animation: 'sigBlink 1.2s ease-in-out infinite',
          }}>
            SIGNAL LOCK...
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: '11px', marginTop: '14px', letterSpacing: '0.12em' }}>
            TRANSMISSION IN PROGRESS
          </div>
        </div>
      )}

      {/* White arrival flash */}
      {whiteFlash && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
          <style>{`@keyframes wFlash { from{opacity:1} to{opacity:0} }`}</style>
          <div style={{ position: 'absolute', inset: 0, background: 'white', animation: 'wFlash 0.6s ease forwards' }} />
        </div>
      )}
    </div>
  );
}
