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
  // DOM refs — mutated directly in RAF, zero re-renders for continuous values
  const mountRef    = useRef<HTMLDivElement>(null);
  const chromaRRef  = useRef<HTMLDivElement>(null);
  const chromaBRef  = useRef<HTMLDivElement>(null);
  const seqTextRef  = useRef<HTMLDivElement>(null); // "INITIATING TEMPORAL SEQUENCE..."
  const arrivingRef = useRef<HTMLDivElement>(null); // "ARRIVING AT: [ERA]"
  const earthRef    = useRef<HTMLDivElement>(null); // Earth horizon ellipse
  const sunRef      = useRef<HTMLDivElement>(null); // Sun glow anchor (position animated)
  const goldenRef   = useRef<HTMLDivElement>(null); // Golden light flood
  const sunTextRef  = useRef<HTMLDivElement>(null); // "TOWARD THE SUN"
  const rafRef      = useRef(0);

  // Internal animation state — refs only
  const phaseRef      = useRef(0); // 0=warp(0-6s) 1=earth(6-8s) 2=sunrise(8-10s) 3=done
  const apiResultRef  = useRef<string | null>(null);
  const apiDoneRef    = useRef(false);
  const completingRef = useRef(false);
  const erroredRef    = useRef(false);

  // React state — only for structural show/hide (≤4 changes total)
  const [phase,      setPhaseState] = useState(0); // mirrors phaseRef for JSX
  const [whiteFlash, setWhiteFlash] = useState(false);

  useEffect(() => {
    apiPromise
      .then((img: string) => { apiResultRef.current = img; apiDoneRef.current = true; })
      .catch((err: unknown) => {
        if (!completingRef.current) {
          erroredRef.current = true;
          onError(err instanceof Error ? err.message : 'Generation failed');
        }
      });

    const setPhase = (p: number) => {
      if (phaseRef.current < p) { phaseRef.current = p; setPhaseState(p); }
    };

    const tryComplete = () => {
      if (completingRef.current || erroredRef.current) return;
      completingRef.current = true;
      setWhiteFlash(true);
      setTimeout(() => { if (apiResultRef.current) onComplete(apiResultRef.current); }, 600);
    };

    // ── Three.js — LineSegments warp tunnel only ──────────────────────────────
    const isMobile = window.innerWidth < 768;
    const N = isMobile ? 1500 : 4000;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    const mount = mountRef.current;
    if (mount) mount.appendChild(renderer.domElement);

    const scene3d = new THREE.Scene();
    const camera  = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 5);

    // Each "star" = one LineSegment: [trail vertex, current vertex]
    const linePos = new Float32Array(N * 2 * 3); // N lines × 2 vertices × 3 components
    const lineCol = new Float32Array(N * 2 * 3);
    const baseVel = new Float32Array(N);           // per-particle speed multiplier

    for (let i = 0; i < N; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 40;
      const z = -800 + Math.random() * 790;
      baseVel[i] = 0.6 + Math.random() * 0.8;

      // current vertex (vertices 0)
      linePos[i * 6]     = x;
      linePos[i * 6 + 1] = y;
      linePos[i * 6 + 2] = z;
      // trail vertex (vertices 1) — initially same position, 0-length line
      linePos[i * 6 + 3] = x;
      linePos[i * 6 + 4] = y;
      linePos[i * 6 + 5] = z - 0.05;

      // teal #00d4aa (35%) or white (65%)
      const teal = Math.random() > 0.65;
      const r = teal ? 0 : 1, g = teal ? 0.831 : 1, b = teal ? 0.667 : 1;
      lineCol[i * 6]     = r; lineCol[i * 6 + 1] = g; lineCol[i * 6 + 2] = b;
      lineCol[i * 6 + 3] = r; lineCol[i * 6 + 4] = g; lineCol[i * 6 + 5] = b;
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute('color',    new THREE.BufferAttribute(lineCol, 3));
    const lineMat = new THREE.LineBasicMaterial({ vertexColors: true });
    scene3d.add(new THREE.LineSegments(lineGeo, lineMat));

    // ── Animation loop ────────────────────────────────────────────────────────
    const startTime = performance.now();
    let lastTime    = startTime;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const now     = performance.now();
      const elapsed = (now - startTime) / 1000;
      const dt      = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const ph   = phaseRef.current;
      const pArr = lineGeo.attributes.position.array as Float32Array;

      // ── Phase transitions ──
      if (elapsed >= 6  && ph === 0) setPhase(1);
      if (elapsed >= 8  && ph === 1) setPhase(2);
      if (elapsed >= 10 && ph === 2) {
        phaseRef.current = 3; // don't use setPhase — may become 5 below
        if (apiDoneRef.current) {
          tryComplete();
        } else {
          setPhaseState(5); // signal lock UI
        }
      }
      // Signal lock: check every frame until API resolves
      if (ph === 3 && apiDoneRef.current && !completingRef.current) tryComplete();

      // ── Warp speed easing: speed = elapsed² × 0.004 (spec) ──
      const boost    = elapsed * elapsed * 0.004;
      const trailLen = Math.max(0.05, boost * 120); // 0.05 = nearly a dot at start

      // Particle update: active during warp phases + signal lock
      const warpActive = ph < 3 || (ph === 3 && !apiDoneRef.current);
      if (warpActive) {
        for (let i = 0; i < N; i++) {
          const cx = pArr[i * 6];
          const cy = pArr[i * 6 + 1];
          let   cz = pArr[i * 6 + 2];

          cz += baseVel[i] * boost * dt * 5000;

          if (cz > 6) {
            // Reset to far end of tunnel
            pArr[i * 6]     = (Math.random() - 0.5) * 40;
            pArr[i * 6 + 1] = (Math.random() - 0.5) * 40;
            pArr[i * 6 + 2] = -800;
            pArr[i * 6 + 3] = pArr[i * 6];
            pArr[i * 6 + 4] = pArr[i * 6 + 1];
            pArr[i * 6 + 5] = -800.05;
          } else {
            pArr[i * 6 + 2] = cz;
            pArr[i * 6 + 3] = cx;
            pArr[i * 6 + 4] = cy;
            pArr[i * 6 + 5] = Math.max(cz - trailLen, -800);
          }
        }
        lineGeo.attributes.position.needsUpdate = true;
      }

      // ── Chromatic aberration (peaks at elapsed ≈ 5, fades by 8s) ──
      if (elapsed > 3 && elapsed < 8) {
        const t = Math.min((elapsed - 3) / 3, 1) * Math.max(0, 1 - (elapsed - 6) / 2);
        const o = t * 16;
        if (chromaRRef.current) { chromaRRef.current.style.transform = `translate(${o}px,0)`;  chromaRRef.current.style.opacity = String(t * 0.22); }
        if (chromaBRef.current) { chromaBRef.current.style.transform = `translate(-${o}px,0)`; chromaBRef.current.style.opacity = String(t * 0.22); }
      } else if (elapsed >= 8) {
        if (chromaRRef.current) chromaRRef.current.style.opacity = '0';
        if (chromaBRef.current) chromaBRef.current.style.opacity = '0';
      }

      // ── "INITIATING TEMPORAL SEQUENCE..." fades in at 2s, out at 6s ──
      if (seqTextRef.current) {
        const tIn  = Math.max(0, Math.min((elapsed - 2) / 1.2, 1));
        const tOut = elapsed > 5.5 ? Math.max(0, 1 - (elapsed - 5.5) / 0.7) : 1;
        seqTextRef.current.style.opacity = String(tIn * tOut);
      }

      // ── "ARRIVING AT: [ERA]" fades in at 4s, out at 6s ──
      if (arrivingRef.current) {
        const tIn  = Math.max(0, Math.min((elapsed - 4) / 1.2, 1));
        const tOut = elapsed > 5.5 ? Math.max(0, 1 - (elapsed - 5.5) / 0.7) : 1;
        arrivingRef.current.style.opacity = String(tIn * tOut);
      }

      // ── Earth horizon fades in at 6s ──
      if (ph >= 1 && earthRef.current) {
        const t = Math.min((elapsed - 6) / 1.8, 1);
        earthRef.current.style.opacity = String(t);
      }

      // ── Sunrise: sun rises + golden flood (8-10s) ──
      if (ph >= 2) {
        const t = Math.min((elapsed - 8) / 2, 1);
        if (sunRef.current) {
          // Sun rises: bottom goes from 32vw (just below horizon) to 46vw (clearly above)
          sunRef.current.style.bottom  = `${32 + t * 14}vw`;
          sunRef.current.style.opacity = String(Math.min(t * 3, 1));
        }
        if (goldenRef.current) goldenRef.current.style.opacity = String(t * 0.7);
        if (sunTextRef.current) sunTextRef.current.style.opacity = String(Math.max(0, Math.min((t - 0.4) * 2.5, 1)));
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
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      lineGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
      try { if (mount && renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement); } catch { /* ignore */ }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000',
      zIndex: 100, overflow: 'hidden',
      fontFamily: 'monospace',
    }}>
      {/* Three.js warp tunnel canvas */}
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Chromatic aberration */}
      <div ref={chromaRRef} style={{ position: 'absolute', inset: 0, background: 'rgba(255,20,20,0.14)',  opacity: 0, pointerEvents: 'none', mixBlendMode: 'screen' }} />
      <div ref={chromaBRef} style={{ position: 'absolute', inset: 0, background: 'rgba(20,60,255,0.14)', opacity: 0, pointerEvents: 'none', mixBlendMode: 'screen' }} />

      {/* "INITIATING TEMPORAL SEQUENCE..." — fades in at 2s */}
      <div
        ref={seqTextRef}
        style={{
          position: 'absolute', top: '38%', left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0, pointerEvents: 'none', zIndex: 2,
          color: 'rgba(45,212,191,0.65)',
          fontSize: '11px', letterSpacing: '0.24em', whiteSpace: 'nowrap',
        }}
      >
        INITIATING TEMPORAL SEQUENCE...
      </div>

      {/* "ARRIVING AT: [ERA]" — fades in at 4s */}
      <div
        ref={arrivingRef}
        style={{
          position: 'absolute', top: '46%', left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0, pointerEvents: 'none', zIndex: 2, textAlign: 'center',
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '9px', letterSpacing: '0.24em', marginBottom: '10px' }}>
          ARRIVING AT:
        </div>
        <div style={{
          color: 'white',
          fontSize: 'clamp(18px, 2.8vw, 28px)', fontWeight: 700, letterSpacing: '0.1em',
          textShadow: scene.cosmic
            ? '0 0 30px rgba(139,92,246,0.9)'
            : '0 0 30px rgba(45,212,191,0.9)',
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

      {/*
        ── EARTH + SUN LAYER (phase >= 1) ─────────────────────────────────────
        Earth horizon: wide CSS ellipse at bottom, blue atmosphere boxShadow.
        Top of ellipse appears at ~40vw from bottom of viewport.
        Sun: positioned behind Earth (lower z-index), rises from 32vw to 46vw.
      */}

      {/* Sun glow — rises from behind Earth horizon (z-index below Earth) */}
      <div
        ref={sunRef}
        style={{
          position: 'absolute', left: '50%',
          transform: 'translateX(-50%)',
          bottom: '32vw',        // starts just below Earth horizon (~40vw)
          opacity: 0, pointerEvents: 'none',
          zIndex: 3,             // BELOW Earth (z-index 4)
          width: '1px', height: '1px', // anchor point; children are absolutely placed
        }}
      >
        {/* Layer 1: wide outer corona — blur 60px */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '600px', height: '260px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,163,71,0.45) 0%, rgba(255,80,0,0.15) 55%, transparent 75%)',
          filter: 'blur(60px)',
        }} />
        {/* Layer 2: mid halo — blur 20px */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '260px', height: '100px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,220,60,0.85) 0%, rgba(255,163,71,0.55) 45%, transparent 70%)',
          filter: 'blur(20px)',
        }} />
        {/* Layer 3: bright inner core / thin sliver — blur 4px */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '160px', height: '6px', borderRadius: '3px',
          background: 'rgba(255,255,230,1)',
          filter: 'blur(4px)',
          boxShadow: '0 0 24px 8px rgba(255,240,180,0.95)',
        }} />
      </div>

      {/* Earth curved horizon (z-index above sun, below text) */}
      <div
        ref={earthRef}
        style={{
          position: 'absolute',
          bottom: '-80vw',        // most of ellipse below viewport
          left: '50%',
          transform: 'translateX(-50%)',
          width: '280vw',
          height: '120vw',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 6%, #0e2244 0%, #060f20 35%, #020810 100%)',
          boxShadow: [
            '0 -6px 80px 35px rgba(68,136,255,0.65)',    // outer atmosphere
            '0 -3px 40px 15px rgba(100,170,255,0.45)',    // inner atmosphere
            'inset 0 8px 70px rgba(68,136,255,0.12)',     // limb brightening
          ].join(', '),
          opacity: 0, pointerEvents: 'none',
          zIndex: 4,
        }}
      />

      {/* Golden light flood (sunrise, z-index below text) */}
      <div
        ref={goldenRef}
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(255,200,50,0.75) 0%, rgba(255,100,0,0.3) 40%, transparent 68%)',
          zIndex: 2,
        }}
      />

      {/* "TOWARD THE SUN" — thin, elegant, gold */}
      <div
        ref={sunTextRef}
        style={{
          position: 'absolute', bottom: '48%', left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0, pointerEvents: 'none',
          zIndex: 5, whiteSpace: 'nowrap', textAlign: 'center',
        }}
      >
        <div style={{
          color: '#FFD700', fontSize: '15px', fontWeight: 300, letterSpacing: '0.42em',
          textShadow: '0 0 18px rgba(255,215,0,0.95), 0 0 50px rgba(255,150,0,0.65)',
        }}>
          TOWARD THE SUN
        </div>
      </div>

      {/* Signal lock (API taking > 10s) */}
      {phase === 5 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none', zIndex: 6,
        }}>
          <style>{`@keyframes sigBlink { 0%,100%{opacity:1} 50%{opacity:0.1} }`}</style>
          <div style={{ color: '#00d4aa', fontSize: '14px', fontWeight: 700, letterSpacing: '0.24em', animation: 'sigBlink 1.2s ease-in-out infinite' }}>
            SIGNAL LOCK...
          </div>
          <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: '10px', marginTop: '12px', letterSpacing: '0.12em' }}>
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
