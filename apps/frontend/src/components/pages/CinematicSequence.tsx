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
  // DOM refs — mutated in RAF, no React re-renders for continuous values
  const mountRef    = useRef<HTMLDivElement>(null);
  const chromaRRef  = useRef<HTMLDivElement>(null);
  const chromaBRef  = useRef<HTMLDivElement>(null);
  const seqTextRef  = useRef<HTMLDivElement>(null); // "INITIATING TEMPORAL SEQUENCE..."
  const arrivingRef = useRef<HTMLDivElement>(null); // "ARRIVING AT: [ERA]"
  const earthRef    = useRef<HTMLDivElement>(null); // CSS Earth horizon ellipse
  const sunRef      = useRef<HTMLDivElement>(null); // Sun glow anchor (bottom position animated)
  const goldenRef   = useRef<HTMLDivElement>(null); // Golden light flood
  const sunTextRef  = useRef<HTMLDivElement>(null); // "TOWARD THE SUN"
  const rafRef      = useRef(0);

  const phaseRef      = useRef(0); // 0=warp 1=earth 2=sunrise 3=done
  const apiResultRef  = useRef<string | null>(null);
  const apiDoneRef    = useRef(false);
  const completingRef = useRef(false);
  const erroredRef    = useRef(false);

  // React state — structural show/hide only (≤5 transitions)
  const [phase,      setPhaseState] = useState(0);
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

    const advancePhase = (p: number) => {
      if (phaseRef.current < p) { phaseRef.current = p; setPhaseState(p); }
    };

    const tryComplete = () => {
      if (completingRef.current || erroredRef.current) return;
      completingRef.current = true;
      setWhiteFlash(true);
      setTimeout(() => { if (apiResultRef.current) onComplete(apiResultRef.current); }, 600);
    };

    // ── Three.js — warp tunnel LineSegments only ──────────────────────────────
    // alpha: true → canvas background is transparent so CSS Earth/sun show through
    const isMobile = window.innerWidth < 768;
    const N = isMobile ? 1500 : 4000;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent — CSS bg provides black
    const mount = mountRef.current;
    if (mount) mount.appendChild(renderer.domElement);

    const scene3d = new THREE.Scene();
    const camera  = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 5);

    // ── True hyperspace particles: angle-based, stream FROM CENTER outward ────
    //
    // Each particle stores: angle (direction from center), spread (radial reach at camera),
    // and current z. Position = (cos(angle)*spread*(z+800)/800, sin(angle)*..., z)
    // → at z=-800 all particles at center (0,0); as z→0 they radiate outward.
    // Trail vertex uses trailZ → points back toward center = classic hyperspace ✓
    //
    const angleArr  = new Float32Array(N);
    const spreadArr = new Float32Array(N);
    const zArr      = new Float32Array(N);
    const baseVel   = new Float32Array(N);

    const linePos = new Float32Array(N * 2 * 3); // [current, trail] per particle
    const lineCol = new Float32Array(N * 2 * 3);

    for (let i = 0; i < N; i++) {
      angleArr[i]  = Math.random() * Math.PI * 2;
      spreadArr[i] = 4 + Math.random() * 18;         // radial extent 4-22 units at camera
      zArr[i]      = -800 + Math.random() * 790;      // spread through tunnel initially
      baseVel[i]   = 0.6 + Math.random() * 0.8;

      const teal = Math.random() > 0.65;
      const r = teal ? 0 : 1, g = teal ? 0.831 : 1, b = teal ? 0.667 : 1;
      lineCol[i * 6]     = r; lineCol[i * 6 + 1] = g; lineCol[i * 6 + 2] = b;
      lineCol[i * 6 + 3] = r; lineCol[i * 6 + 4] = g; lineCol[i * 6 + 5] = b;

      // Initial geometry positions (will be updated in loop immediately)
      const depth = (zArr[i] + 800) / 800;
      linePos[i * 6]     = Math.cos(angleArr[i]) * spreadArr[i] * depth;
      linePos[i * 6 + 1] = Math.sin(angleArr[i]) * spreadArr[i] * depth;
      linePos[i * 6 + 2] = zArr[i];
      linePos[i * 6 + 3] = linePos[i * 6];
      linePos[i * 6 + 4] = linePos[i * 6 + 1];
      linePos[i * 6 + 5] = zArr[i] - 0.05;
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute('color',    new THREE.BufferAttribute(lineCol, 3));
    const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1 });
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
      if (elapsed >= 6  && ph === 0) advancePhase(1);
      if (elapsed >= 8  && ph === 1) advancePhase(2);
      if (elapsed >= 10 && ph === 2) {
        phaseRef.current = 3;
        if (apiDoneRef.current) {
          tryComplete();
        } else {
          setPhaseState(5); // signal lock
        }
      }
      if (phaseRef.current === 3 && apiDoneRef.current && !completingRef.current) tryComplete();

      // ── Warp speed easing: boost = elapsed² × 0.004 ──
      const boost    = elapsed * elapsed * 0.004;
      const trailLen = Math.max(0.05, boost * 130);

      // ── Particle material fade-out: transparent by 7.5s so Earth shows ──
      // Canvas is alpha:true + clearColor alpha 0 → transparent when no particles
      if (elapsed < 6) {
        lineMat.opacity = 1;
      } else if (elapsed < 7.5) {
        lineMat.opacity = Math.max(0, 1 - (elapsed - 6) / 1.5);
      } else {
        lineMat.opacity = 0;
      }

      // ── Particle update (active 0-7.5s + signal lock) ──
      const warpActive = elapsed < 7.5 || (phaseRef.current === 3 && !apiDoneRef.current);
      if (warpActive) {
        for (let i = 0; i < N; i++) {
          zArr[i] += baseVel[i] * boost * dt * 5000;

          if (zArr[i] > 6) {
            // Reset to far end, new random angle + spread
            angleArr[i]  = Math.random() * Math.PI * 2;
            spreadArr[i] = 4 + Math.random() * 18;
            zArr[i]      = -800;
          }

          const z      = zArr[i];
          const depth  = (z + 800) / 800;           // 0 at start, ~1 near camera
          const ca     = Math.cos(angleArr[i]);
          const sa     = Math.sin(angleArr[i]);
          const r      = spreadArr[i] * depth;

          // Current vertex (tip of streak, furthest from center)
          pArr[i * 6]     = ca * r;
          pArr[i * 6 + 1] = sa * r;
          pArr[i * 6 + 2] = z;

          // Trail vertex (back toward center, always closer to origin)
          const trailZ    = Math.max(z - trailLen, -800);
          const trailD    = (trailZ + 800) / 800;
          const trailR    = spreadArr[i] * trailD;
          pArr[i * 6 + 3] = ca * trailR;
          pArr[i * 6 + 4] = sa * trailR;
          pArr[i * 6 + 5] = trailZ;
        }
        lineGeo.attributes.position.needsUpdate = true;
      }

      // ── CSS: chromatic aberration (elapsed 3-8s, peaks ~5s) ──
      if (elapsed > 3 && elapsed < 8) {
        const t = Math.min((elapsed - 3) / 2.5, 1) * Math.max(0, 1 - (elapsed - 5.5) / 2.5);
        const o = t * 18;
        if (chromaRRef.current) { chromaRRef.current.style.transform = `translate(${o}px,0)`;  chromaRRef.current.style.opacity = String(t * 0.25); }
        if (chromaBRef.current) { chromaBRef.current.style.transform = `translate(-${o}px,0)`; chromaBRef.current.style.opacity = String(t * 0.25); }
      } else if (elapsed >= 8) {
        if (chromaRRef.current) chromaRRef.current.style.opacity = '0';
        if (chromaBRef.current) chromaBRef.current.style.opacity = '0';
      }

      // ── CSS: "INITIATING TEMPORAL SEQUENCE..." fades in at 2s, out at 5.5s ──
      if (seqTextRef.current) {
        const tIn  = Math.max(0, Math.min((elapsed - 2) / 1.0, 1));
        const tOut = elapsed > 5.2 ? Math.max(0, 1 - (elapsed - 5.2) / 0.8) : 1;
        seqTextRef.current.style.opacity = String(tIn * tOut);
      }

      // ── CSS: "ARRIVING AT: [ERA]" fades in at 4s, out at 5.8s ──
      if (arrivingRef.current) {
        const tIn  = Math.max(0, Math.min((elapsed - 4) / 1.0, 1));
        const tOut = elapsed > 5.5 ? Math.max(0, 1 - (elapsed - 5.5) / 0.8) : 1;
        arrivingRef.current.style.opacity = String(tIn * tOut);
      }

      // ── CSS: Earth horizon fades in starting at 6.5s (after particles fade) ──
      if (earthRef.current) {
        if (elapsed >= 6.5) {
          const t = Math.min((elapsed - 6.5) / 1.2, 1);
          earthRef.current.style.opacity = String(t);
        }
      }

      // ── CSS: Sun rises + golden flood (8-10s) ──
      if (ph >= 2 || (phaseRef.current >= 2 && elapsed >= 8)) {
        const t = Math.min((elapsed - 8) / 2, 1);
        if (sunRef.current) {
          // Sun rises: bottom goes from 36vh (below horizon at 40vh) to 50vh
          sunRef.current.style.bottom  = `${36 + t * 14}vh`;
          sunRef.current.style.opacity = String(Math.min(t * 3, 1));
        }
        if (goldenRef.current) goldenRef.current.style.opacity = String(t * 0.72);
        if (sunTextRef.current) sunTextRef.current.style.opacity = String(Math.max(0, Math.min((t - 0.35) * 2.8, 1)));
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
      zIndex: 100, overflow: 'hidden', fontFamily: 'monospace',
    }}>

      {/*
        LAYER ORDER (back to front):
          1. #000000 background (outer div)
          2. Sun glow CSS (z-index 2) — behind Earth
          3. Earth CSS horizon (z-index 3) — occludes sun below horizon
          4. Golden flood CSS (z-index 1) — behind Earth, adds glow to scene
          5. Three.js canvas (z-index 4) — transparent bg, shows particles on top
          6. Text overlays (z-index 5-6)
          7. Signal lock (z-index 7)
          8. White flash (z-index 10)

        When particles fade out (elapsed > 7.5s), canvas becomes fully transparent
        → Earth and sun show clearly through it against the black background.
      */}

      {/* Golden light flood (behind Earth) */}
      <div
        ref={goldenRef}
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(255,195,50,0.8) 0%, rgba(255,90,0,0.35) 38%, transparent 65%)',
          zIndex: 1,
        }}
      />

      {/* Sun glow — behind Earth (z-index lower than Earth) */}
      <div
        ref={sunRef}
        style={{
          position: 'absolute', left: '50%',
          transform: 'translateX(-50%)',
          bottom: '36vh',   // starts just below Earth horizon at 40vh
          opacity: 0, pointerEvents: 'none',
          zIndex: 2,
          width: '1px', height: '1px', // anchor; children are absolutely placed
        }}
      >
        {/* Outer corona — blur 60px */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '700px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,163,71,0.5) 0%, rgba(255,80,0,0.18) 50%, transparent 72%)',
          filter: 'blur(60px)',
        }} />
        {/* Mid halo — blur 20px */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '320px', height: '110px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,225,70,0.9) 0%, rgba(255,163,71,0.6) 45%, transparent 70%)',
          filter: 'blur(20px)',
        }} />
        {/* Inner sliver — blur 4px: appears as a thin golden arc above horizon */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '200px', height: '5px', borderRadius: '3px',
          background: 'rgba(255,255,235,1)',
          filter: 'blur(4px)',
          boxShadow: '0 0 28px 10px rgba(255,240,180,0.95)',
        }} />
      </div>

      {/* Earth curved horizon — CSS ellipse filling bottom 40% of screen */}
      {/* vh units ensure correct proportion on all screen sizes */}
      {/* top of ellipse = (-100vh + 140vh) = 40vh from bottom = bottom 40% ✓ */}
      <div
        ref={earthRef}
        style={{
          position: 'absolute',
          bottom: '-100vh',        // bottom edge 100vh below viewport
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300vw',          // very wide for a convincing curved arc
          height: '140vh',         // top = -100vh + 140vh = 40vh from bottom
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 5%, #122850 0%, #071428 25%, #030a18 60%, #010508 100%)',
          boxShadow: [
            '0 -5px 90px 40px rgba(68,136,255,0.75)',    // bright outer atmosphere
            '0 -2px 50px 20px rgba(100,170,255,0.55)',    // inner atmosphere ring
            '0 -1px 20px 8px  rgba(140,200,255,0.4)',     // sharp limb glow
            'inset 0 6px 80px rgba(68,136,255,0.08)',     // subtle limb brightening
          ].join(', '),
          opacity: 0, pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {/* Three.js canvas — alpha:true, transparent bg, particles on top of Earth */}
      <div ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 4 }} />

      {/* Chromatic aberration (particles phase) */}
      <div ref={chromaRRef} style={{ position: 'absolute', inset: 0, background: 'rgba(255,20,20,0.14)',  opacity: 0, pointerEvents: 'none', zIndex: 5, mixBlendMode: 'screen' }} />
      <div ref={chromaBRef} style={{ position: 'absolute', inset: 0, background: 'rgba(20,60,255,0.14)', opacity: 0, pointerEvents: 'none', zIndex: 5, mixBlendMode: 'screen' }} />

      {/* "INITIATING TEMPORAL SEQUENCE..." — fades in at 2s */}
      <div
        ref={seqTextRef}
        style={{
          position: 'absolute', top: '38%', left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0, pointerEvents: 'none', zIndex: 6,
          color: 'rgba(45,212,191,0.7)',
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
          opacity: 0, pointerEvents: 'none', zIndex: 6, textAlign: 'center',
        }}
      >
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

      {/* "TOWARD THE SUN" — appears during sunrise */}
      <div
        ref={sunTextRef}
        style={{
          position: 'absolute', bottom: '50%', left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0, pointerEvents: 'none', zIndex: 6,
          whiteSpace: 'nowrap', textAlign: 'center',
        }}
      >
        <div style={{
          color: '#FFD700', fontSize: '15px', fontWeight: 300, letterSpacing: '0.42em',
          textShadow: '0 0 18px rgba(255,215,0,0.95), 0 0 50px rgba(255,150,0,0.65)',
        }}>
          TOWARD THE SUN
        </div>
      </div>

      {/* Signal lock */}
      {phase === 5 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none', zIndex: 7,
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
