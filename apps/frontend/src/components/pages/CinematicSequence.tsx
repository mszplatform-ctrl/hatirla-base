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

export function CinematicSequence({ scene, apiPromise, onComplete, onError }: Props) {
  // DOM refs — updated imperatively in RAF to avoid React re-renders
  const mountRef    = useRef<HTMLDivElement>(null); // Three.js canvas container
  const sceneRef    = useRef<HTMLDivElement>(null); // inception rotation target
  const chromaRRef  = useRef<HTMLDivElement>(null);
  const chromaBRef  = useRef<HTMLDivElement>(null);
  const seqTextRef  = useRef<HTMLDivElement>(null);
  const arrivingRef = useRef<HTMLDivElement>(null);
  const earthRef    = useRef<HTMLDivElement>(null);
  const sunRef      = useRef<HTMLDivElement>(null);
  const goldenRef   = useRef<HTMLDivElement>(null);
  const sunTextRef  = useRef<HTMLDivElement>(null);
  const dotRef      = useRef<HTMLDivElement>(null); // initial ignition white point
  const rafRef      = useRef(0);

  const phaseRef      = useRef(0); // 0=hyperspace 1=reality-bends 2=earth-sunrise 3=done
  const apiResultRef  = useRef<string | null>(null);
  const apiDoneRef    = useRef(false);
  const completingRef = useRef(false);
  const erroredRef    = useRef(false);

  // React state — structural transitions only
  const [phase,      setPhaseState] = useState(0);
  const [whiteFlash, setWhiteFlash] = useState(false);
  const [shaking,    setShaking]    = useState(true);

  useEffect(() => {
    // ── API promise ──────────────────────────────────────────────────────────
    apiPromise
      .then((img: string) => { apiResultRef.current = img; apiDoneRef.current = true; })
      .catch((err: unknown) => {
        if (!completingRef.current) {
          erroredRef.current = true;
          onError(err instanceof Error ? err.message : 'Generation failed');
        }
      });

    // Stop screen shake after 2s
    const shakeTimer = setTimeout(() => setShaking(false), 2000);

    // ── Web Audio — sawtooth oscillator charge-up ────────────────────────────
    let audioCtx: AudioContext | null = null;
    let osc1: OscillatorNode | null = null;
    let osc2: OscillatorNode | null = null;

    try {
      audioCtx = new AudioContext();
      const t0 = audioCtx.currentTime;

      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0, t0);
      masterGain.gain.linearRampToValueAtTime(0.12, t0 + 0.4);
      masterGain.gain.linearRampToValueAtTime(0.20, t0 + 3.5);
      masterGain.gain.linearRampToValueAtTime(0.06, t0 + 5.5);
      masterGain.gain.linearRampToValueAtTime(0,    t0 + 7.5);
      masterGain.connect(audioCtx.destination);

      // Primary sawtooth: 80Hz → 640Hz over 4s, then drops as reality bends
      osc1 = audioCtx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(80, t0);
      osc1.frequency.exponentialRampToValueAtTime(640, t0 + 4);
      osc1.frequency.exponentialRampToValueAtTime(180, t0 + 6.5);
      osc1.frequency.exponentialRampToValueAtTime(60,  t0 + 8);
      osc1.connect(masterGain);
      osc1.start(t0);
      osc1.stop(t0 + 8.2);

      // Sub sawtooth octave below for depth
      osc2 = audioCtx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(40, t0);
      osc2.frequency.exponentialRampToValueAtTime(320, t0 + 4);
      osc2.frequency.exponentialRampToValueAtTime(90,  t0 + 6.5);
      const subGain = audioCtx.createGain();
      subGain.gain.value = 0.45;
      osc2.connect(subGain);
      subGain.connect(masterGain);
      osc2.start(t0);
      osc2.stop(t0 + 8.2);
    } catch { /* audio context blocked or unsupported */ }

    // ── Phase helpers ─────────────────────────────────────────────────────────
    const advancePhase = (p: number) => {
      if (phaseRef.current < p) { phaseRef.current = p; setPhaseState(p); }
    };

    const tryComplete = () => {
      if (completingRef.current || erroredRef.current) return;
      completingRef.current = true;
      setWhiteFlash(true);
      setTimeout(() => { if (apiResultRef.current) onComplete(apiResultRef.current); }, 600);
    };

    // ── Three.js — angle-based hyperspace LineSegments ────────────────────────
    // All particles start at z=-800 (appears as single white dot at center).
    // x = cos(angle) * spread * (z+800)/800 — at z=-800, x=0 (all at center)
    // As z → 0, particles radiate outward = classic hyperspace stream
    const isMobile = window.innerWidth < 768;
    const N = isMobile ? 1500 : 4000;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent — CSS bg is black

    const mount = mountRef.current;
    if (mount) mount.appendChild(renderer.domElement);

    const scene3d = new THREE.Scene();
    const camera  = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 5);

    const angleArr  = new Float32Array(N);
    const spreadArr = new Float32Array(N);
    const zArr      = new Float32Array(N);
    const baseVel   = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      angleArr[i]  = Math.random() * Math.PI * 2;
      spreadArr[i] = 4 + Math.random() * 18;
      zArr[i]      = -800; // all start collapsed at center point
      baseVel[i]   = 0.6 + Math.random() * 0.8;
    }

    const linePos = new Float32Array(N * 6);
    const lineCol = new Float32Array(N * 6);

    // All white star streaks
    for (let i = 0; i < N * 6; i += 3) {
      lineCol[i] = 1; lineCol[i + 1] = 1; lineCol[i + 2] = 1;
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute('color',    new THREE.BufferAttribute(lineCol, 3));
    const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1 });
    scene3d.add(new THREE.LineSegments(lineGeo, lineMat));

    // ── Animation loop ────────────────────────────────────────────────────────
    const startTime = performance.now();
    let lastTime = startTime;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const now     = performance.now();
      const elapsed = (now - startTime) / 1000;
      const dt      = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const ph   = phaseRef.current;
      const pArr = lineGeo.attributes.position.array as Float32Array;

      // ── Phase transitions ──
      if (elapsed >= 4 && ph === 0) advancePhase(1); // reality bends
      if (elapsed >= 6 && ph === 1) advancePhase(2); // earth sunrise
      if (elapsed >= 8 && ph === 2) {
        phaseRef.current = 3;
        if (apiDoneRef.current) tryComplete();
        else setPhaseState(5); // signal lock: wait for API
      }
      if (phaseRef.current === 3 && apiDoneRef.current && !completingRef.current) tryComplete();

      // ── Warp speed: exponential during 0-4s, slows during 4-6.5s ──
      let speedMult: number;
      if (elapsed < 4) {
        speedMult = Math.pow(elapsed / 4, 3) * 50;
      } else if (elapsed < 6.5) {
        speedMult = Math.max(0, 50 * (1 - (elapsed - 4) / 2.5));
      } else {
        speedMult = 0;
      }
      const trailLen = Math.max(0.1, speedMult * 2.5);

      // ── Particle opacity: fade out 5.5-7s so Earth shows through ──
      if (elapsed < 5.5) {
        lineMat.opacity = 1;
      } else if (elapsed < 7) {
        lineMat.opacity = Math.max(0, 1 - (elapsed - 5.5) / 1.5);
      } else {
        lineMat.opacity = 0;
      }

      // ── Particle update ──
      if (elapsed < 7) {
        for (let i = 0; i < N; i++) {
          zArr[i] += baseVel[i] * speedMult * dt * 5;

          if (zArr[i] > 6) {
            zArr[i]      = -800;
            angleArr[i]  = Math.random() * Math.PI * 2;
            spreadArr[i] = 4 + Math.random() * 18;
          }

          const z     = zArr[i];
          const depth = (z + 800) / 800;
          const ca    = Math.cos(angleArr[i]);
          const sa    = Math.sin(angleArr[i]);
          const r     = spreadArr[i] * depth;

          pArr[i * 6]     = ca * r;
          pArr[i * 6 + 1] = sa * r;
          pArr[i * 6 + 2] = z;

          const trailZ = Math.max(z - trailLen, -800);
          const trailD = (trailZ + 800) / 800;
          pArr[i * 6 + 3] = ca * spreadArr[i] * trailD;
          pArr[i * 6 + 4] = sa * spreadArr[i] * trailD;
          pArr[i * 6 + 5] = trailZ;
        }
        lineGeo.attributes.position.needsUpdate = true;
      }

      // ── Ignition dot: visible at t=0, fades as hyperspace takes over ──
      if (dotRef.current) {
        dotRef.current.style.opacity = String(Math.max(0, 1 - elapsed * 5));
      }

      // ── Perspective pulse on canvas during hyperspace (0-4s) ──
      if (mountRef.current) {
        if (elapsed < 4) {
          const pulse = Math.sin(elapsed * 4) * 2;
          mountRef.current.style.transform = `perspective(500px) rotateX(${pulse}deg)`;
        } else {
          mountRef.current.style.transform = 'none';
        }
      }

      // ── Chromatic aberration: red LEFT, blue RIGHT ──
      // 0-4s: constant 8px | 4-6s: intensifies to ~22px then fades
      if (chromaRRef.current && chromaBRef.current) {
        if (elapsed < 4) {
          const fadeIn = Math.min(elapsed / 0.5, 1);
          chromaRRef.current.style.transform = 'translateX(-8px)';
          chromaRRef.current.style.opacity   = String(fadeIn * 0.22);
          chromaBRef.current.style.transform = 'translateX(8px)';
          chromaBRef.current.style.opacity   = String(fadeIn * 0.22);
        } else if (elapsed < 6) {
          const t = (elapsed - 4) / 2;
          const burst = Math.sin(t * Math.PI); // peaks at t=0.5 (elapsed=5)
          const offset = 8 + burst * 14;
          const opacity = Math.max(0, 0.22 + burst * 0.28 - Math.max(0, (t - 0.7) / 0.3) * 0.5);
          chromaRRef.current.style.transform = `translateX(-${offset}px)`;
          chromaRRef.current.style.opacity   = String(opacity);
          chromaBRef.current.style.transform = `translateX(${offset}px)`;
          chromaBRef.current.style.opacity   = String(opacity);
        } else {
          chromaRRef.current.style.opacity = '0';
          chromaBRef.current.style.opacity = '0';
        }
      }

      // ── Inception rotation: 0→360° over 1.5s starting at 4s ──
      if (sceneRef.current) {
        if (elapsed >= 4 && elapsed < 5.5) {
          const t = (elapsed - 4) / 1.5; // 0 → 1
          const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out
          sceneRef.current.style.transform = `rotateZ(${eased * 360}deg)`;
        } else if (elapsed >= 5.5) {
          sceneRef.current.style.transform = 'rotateZ(0deg)';
        }
      }

      // ── "INITIATING TEMPORAL SEQUENCE" — 2-4s ──
      if (seqTextRef.current) {
        const tIn  = Math.max(0, Math.min((elapsed - 2) / 0.8, 1));
        const tOut = elapsed > 3.8 ? Math.max(0, 1 - (elapsed - 3.8) / 0.5) : 1;
        seqTextRef.current.style.opacity = String(tIn * tOut);
      }

      // ── "ARRIVING AT: [ERA]" — 3-5s ──
      if (arrivingRef.current) {
        const tIn  = Math.max(0, Math.min((elapsed - 3) / 0.8, 1));
        const tOut = elapsed > 4.7 ? Math.max(0, 1 - (elapsed - 4.7) / 0.5) : 1;
        arrivingRef.current.style.opacity = String(tIn * tOut);
      }

      // ── Earth horizon: fades in 6.5-7.5s ──
      if (earthRef.current && elapsed >= 6.5) {
        earthRef.current.style.opacity = String(Math.min((elapsed - 6.5) / 1, 1));
      }

      // ── Sun rises + golden flood: 7-8s ──
      if (elapsed >= 7) {
        const t = Math.min((elapsed - 7) / 1, 1);
        if (sunRef.current) {
          sunRef.current.style.bottom  = `${36 + t * 14}vh`;
          sunRef.current.style.opacity = String(Math.min(t * 2, 1));
        }
        if (goldenRef.current) goldenRef.current.style.opacity = String(t * 0.6);
        if (sunTextRef.current) sunTextRef.current.style.opacity = String(Math.max(0, (t - 0.4) * 1.7));
      }

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
      clearTimeout(shakeTimer);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      try { osc1?.stop(); } catch { /* may already be stopped */ }
      try { osc2?.stop(); } catch { /* may already be stopped */ }
      try { audioCtx?.close(); } catch { /* ignore */ }
      lineGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
      try {
        if (mount && renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
      } catch { /* ignore */ }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000',
      zIndex: 100, overflow: 'hidden', fontFamily: 'monospace',
    }}>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0px);  }
          25%      { transform: translateX(-3px); }
          75%      { transform: translateX(3px);  }
        }
        @keyframes sigBlink { 0%,100% { opacity:1 } 50% { opacity:0.1 } }
        @keyframes wFlash   { from { opacity:1 } to { opacity:0 } }
      `}</style>

      {/* Shake wrapper — runs CSS shake animation during ignition */}
      <div style={{
        position: 'absolute', inset: 0,
        animation: shaking ? 'shake 0.1s linear infinite' : 'none',
      }}>
        {/* Scene wrapper — inception rotation applied via JS */}
        <div ref={sceneRef} style={{ position: 'absolute', inset: 0 }}>

          {/* 1. Golden light flood (behind Earth) */}
          <div ref={goldenRef} style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0,
            background: 'radial-gradient(ellipse at 50% 100%, rgba(255,195,50,0.8) 0%, rgba(255,90,0,0.35) 38%, transparent 65%)',
            zIndex: 1,
          }} />

          {/* 2. Sun glow — behind Earth so Earth occludes it below horizon */}
          <div ref={sunRef} style={{
            position: 'absolute', left: '50%',
            transform: 'translateX(-50%)',
            bottom: '36vh', opacity: 0, pointerEvents: 'none',
            zIndex: 2, width: '1px', height: '1px',
          }}>
            {/* Outer corona */}
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%,-50%)',
              width: '700px', height: '280px', borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(255,163,71,0.5) 0%, rgba(255,80,0,0.18) 50%, transparent 72%)',
              filter: 'blur(60px)',
            }} />
            {/* Mid halo */}
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%,-50%)',
              width: '320px', height: '110px', borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(255,225,70,0.9) 0%, rgba(255,163,71,0.6) 45%, transparent 70%)',
              filter: 'blur(20px)',
            }} />
            {/* Inner sliver arc */}
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%,-50%)',
              width: '200px', height: '5px', borderRadius: '3px',
              background: 'rgba(255,255,235,1)',
              filter: 'blur(4px)',
              boxShadow: '0 0 28px 10px rgba(255,240,180,0.95)',
            }} />
          </div>

          {/* 3. Earth curved horizon — vh units = correct on all screen sizes */}
          {/* top of ellipse = (-100vh + 140vh) = 40vh from bottom ✓ */}
          <div ref={earthRef} style={{
            position: 'absolute',
            bottom: '-100vh',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '300vw',
            height: '140vh',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at 50% 5%, #122850 0%, #071428 25%, #030a18 60%, #010508 100%)',
            boxShadow: [
              '0 -5px 90px 40px rgba(68,136,255,0.75)',
              '0 -2px 50px 20px rgba(100,170,255,0.55)',
              '0 -1px 20px 8px rgba(140,200,255,0.4)',
              'inset 0 6px 80px rgba(68,136,255,0.08)',
            ].join(', '),
            opacity: 0, pointerEvents: 'none',
            zIndex: 3,
          }} />

          {/* 4. Three.js canvas — alpha:true transparent bg, particles over Earth */}
          <div ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 4 }} />

          {/* 5. Chromatic aberration (mix-blend-mode: screen) */}
          <div ref={chromaRRef} style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,0,0,0.15)',
            opacity: 0, pointerEvents: 'none',
            zIndex: 5, mixBlendMode: 'screen',
          }} />
          <div ref={chromaBRef} style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,40,255,0.15)',
            opacity: 0, pointerEvents: 'none',
            zIndex: 5, mixBlendMode: 'screen',
          }} />

          {/* 6. Ignition point — single white dot visible at t=0 */}
          <div ref={dotRef} style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%,-50%)',
            width: '3px', height: '3px', borderRadius: '50%',
            background: 'white',
            boxShadow: '0 0 12px 4px rgba(255,255,255,0.9)',
            pointerEvents: 'none', zIndex: 6,
          }} />

          {/* 7. "INITIATING TEMPORAL SEQUENCE" — fades in at 2s */}
          <div ref={seqTextRef} style={{
            position: 'absolute', top: '38%', left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0, pointerEvents: 'none', zIndex: 6,
            color: 'rgba(45,212,191,0.7)',
            fontSize: '11px', letterSpacing: '0.24em', whiteSpace: 'nowrap',
          }}>
            INITIATING TEMPORAL SEQUENCE...
          </div>

          {/* 8. "ARRIVING AT: [ERA]" — fades in at 3s */}
          <div ref={arrivingRef} style={{
            position: 'absolute', top: '46%', left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0, pointerEvents: 'none', zIndex: 6, textAlign: 'center',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '0.26em', marginBottom: '10px' }}>
              ARRIVING AT:
            </div>
            <div style={{
              color: 'white',
              fontSize: 'clamp(18px, 2.8vw, 28px)', fontWeight: 700, letterSpacing: '0.1em',
              textShadow: scene.cosmic ? '0 0 30px rgba(139,92,246,0.9)' : '0 0 30px rgba(45,212,191,0.9)',
              whiteSpace: 'nowrap',
            }}>
              {scene.label}
            </div>
            <div style={{
              color: scene.cosmic ? '#a78bfa' : '#2dd4bf',
              fontSize: '12px', marginTop: '8px', letterSpacing: '0.14em',
            }}>
              {scene.year}
            </div>
          </div>

          {/* 9. "TOWARD THE SUN" — appears during sunrise */}
          <div ref={sunTextRef} style={{
            position: 'absolute', bottom: '50%', left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0, pointerEvents: 'none', zIndex: 6,
            whiteSpace: 'nowrap', textAlign: 'center',
          }}>
            <div style={{
              color: '#FFD700', fontSize: '15px', fontWeight: 300, letterSpacing: '0.42em',
              textShadow: '0 0 18px rgba(255,215,0,0.95), 0 0 50px rgba(255,150,0,0.65)',
            }}>
              TOWARD THE SUN
            </div>
          </div>

        </div>
      </div>

      {/* Signal lock — outside shake/rotation wrappers */}
      {phase === 5 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none', zIndex: 20,
        }}>
          <div style={{
            color: '#00d4aa', fontSize: '14px', fontWeight: 700,
            letterSpacing: '0.24em', animation: 'sigBlink 1.2s ease-in-out infinite',
          }}>
            SIGNAL LOCK...
          </div>
          <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: '10px', marginTop: '12px', letterSpacing: '0.12em' }}>
            TRANSMISSION IN PROGRESS
          </div>
        </div>
      )}

      {/* White arrival flash */}
      {whiteFlash && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'white', animation: 'wFlash 0.6s ease forwards' }} />
        </div>
      )}
    </div>
  );
}
