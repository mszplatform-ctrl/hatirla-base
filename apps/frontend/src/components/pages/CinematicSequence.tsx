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

type UIMode = 'year' | 'arriving' | 'none' | 'sunrise' | 'signal';

function formatDisplayYear(raw: string, t: number): string {
  if (raw === '∞') {
    const n = Math.floor(2026 + t * 99_999_999);
    return n > 9999 ? `${(n / 1_000_000).toFixed(0)}M` : String(n);
  }
  if (raw.startsWith('-') && raw.endsWith('B')) {
    const bn = 2026 + (-13_800_000_000 - 2026) * t;
    return `${Math.abs(bn / 1e9).toFixed(1)}B BC`;
  }
  const dest = parseInt(raw, 10);
  if (isNaN(dest)) return raw;
  const current = Math.round(2026 + (dest - 2026) * t);
  return current < 0 ? `${Math.abs(current)} BC` : String(current);
}

export function CinematicSequence({ scene, apiPromise, onComplete, onError }: Props) {
  const mountRef      = useRef<HTMLDivElement>(null);
  const yearRef       = useRef<HTMLDivElement>(null);
  const lensRef       = useRef<HTMLDivElement>(null);
  const chromaRedRef  = useRef<HTMLDivElement>(null);
  const chromaBlueRef = useRef<HTMLDivElement>(null);

  const [uiMode,    setUIMode]    = useState<UIMode>('year');
  const [whiteFlash, setWhiteFlash] = useState(false);

  const phaseRef      = useRef(0);
  const uiModeRef     = useRef<UIMode>('year');
  const apiResultRef  = useRef<string | null>(null);
  const apiDoneRef    = useRef(false);
  const completingRef = useRef(false);
  const erroredRef    = useRef(false);
  const rafRef        = useRef(0);

  function transitionUI(mode: UIMode) {
    if (uiModeRef.current !== mode) {
      uiModeRef.current = mode;
      setUIMode(mode);
    }
  }

  useEffect(() => {
    apiPromise
      .then((img: string) => {
        apiResultRef.current = img;
        apiDoneRef.current   = true;
      })
      .catch((err: unknown) => {
        if (!completingRef.current) {
          erroredRef.current = true;
          const msg = err instanceof Error ? err.message : 'Generation failed';
          onError(msg);
        }
      });

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
    const posArr = new Float32Array(N * 3);
    const velArr = new Float32Array(N);
    const colArr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      posArr[i * 3]     = (Math.random() - 0.5) * 40;
      posArr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      posArr[i * 3 + 2] = -800 + Math.random() * 790;
      velArr[i]         = 3 + Math.random() * 12;
      if (Math.random() > 0.65) {
        colArr[i * 3] = 0.17; colArr[i * 3 + 1] = 0.83; colArr[i * 3 + 2] = 0.75; // teal
      } else {
        colArr[i * 3] = 1; colArr[i * 3 + 1] = 1; colArr[i * 3 + 2] = 1; // white
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colArr, 3));
    const mat = new THREE.PointsMaterial({ size: 0.18, vertexColors: true });
    scene3d.add(new THREE.Points(geo, mat));

    // ── Earth ──
    const earthGeo = new THREE.SphereGeometry(2, 48, 48);
    const earthMat = new THREE.MeshPhongMaterial({ color: 0x1a6b9a, emissive: 0x0a2d40, shininess: 80 });
    const earth    = new THREE.Mesh(earthGeo, earthMat);
    earth.position.set(0, 0, -30);
    earth.visible = false;
    scene3d.add(earth);

    const atmoGeo = new THREE.SphereGeometry(2.2, 32, 32);
    const atmoMat = new THREE.MeshPhongMaterial({ color: 0x4dd0e1, transparent: true, opacity: 0, side: THREE.FrontSide });
    earth.add(new THREE.Mesh(atmoGeo, atmoMat));

    // ── Sun glow ──
    const sunGeo  = new THREE.SphereGeometry(3.5, 32, 32);
    const sunMat  = new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(0, -6, -40);
    sunMesh.visible = false;
    scene3d.add(sunMesh);

    // ── Lights ──
    scene3d.add(new THREE.AmbientLight(0x111827, 1));
    const sunLight = new THREE.DirectionalLight(0xfffde7, 0);
    sunLight.position.set(0, -1, -1);
    scene3d.add(sunLight);

    const startTime = performance.now();
    let lastTime    = startTime;

    const tryComplete = () => {
      if (completingRef.current || erroredRef.current) return;
      completingRef.current = true;
      setWhiteFlash(true);
      setTimeout(() => {
        if (apiResultRef.current) onComplete(apiResultRef.current);
      }, 500);
    };

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const now     = performance.now();
      const elapsed = (now - startTime) / 1000;
      const dt      = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // ── Phase transitions ──
      if (elapsed >= 3 && phaseRef.current === 0) {
        phaseRef.current = 1;
        transitionUI('arriving');
      }
      if (elapsed >= 6 && phaseRef.current === 1) {
        phaseRef.current = 2;
        transitionUI('none');
        earth.visible    = true;
        sunMesh.visible  = true;
      }
      if (elapsed >= 8 && phaseRef.current === 2) {
        phaseRef.current = 3;
        transitionUI('sunrise');
      }
      if (elapsed >= 10 && phaseRef.current === 3) {
        phaseRef.current = 4;
        if (apiDoneRef.current) {
          tryComplete();
        } else {
          transitionUI('signal');
        }
      }
      if (phaseRef.current === 4 && uiModeRef.current === 'signal' && apiDoneRef.current && !completingRef.current) {
        tryComplete();
      }

      const ph    = phaseRef.current;
      const pArr  = geo.attributes.position.array as Float32Array;

      // ── Particles (phases 0, 1, signal) ──
      if (ph === 0 || ph === 1 || (ph === 4 && uiModeRef.current === 'signal')) {
        for (let i = 0; i < N; i++) {
          pArr[i * 3 + 2] += velArr[i] * dt;
          if (ph === 1) {
            const angle = elapsed * 1.5 + i * 0.002;
            pArr[i * 3]     += Math.cos(angle) * 0.015;
            pArr[i * 3 + 1] += Math.sin(angle) * 0.015;
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
        earth.position.z    = -30 + t * 26;
        atmoMat.opacity      = t * 0.25;
        camera.rotation.z    = Math.sin(t * Math.PI) * 0.05;
      }

      // ── Sunrise (phase 3: 8-10s) ──
      if (ph === 3) {
        const t = Math.min((elapsed - 8) / 2, 1);
        sunLight.intensity   = t * 3;
        sunMesh.position.y   = -6 + t * 10;
        sunMat.opacity       = t * 0.6;
        atmoMat.opacity      = 0.25 + t * 0.3;
        if (lensRef.current) lensRef.current.style.opacity = String(t * 0.85);
      }

      // ── Chromatic aberration (phase 1: 3-6s) ──
      if (ph === 1) {
        const t      = Math.min((elapsed - 3) / 3, 1);
        const offset = t * 14;
        if (chromaRedRef.current)  { chromaRedRef.current.style.transform  = `translate(${offset}px, 0)`;   chromaRedRef.current.style.opacity  = String(t * 0.18); }
        if (chromaBlueRef.current) { chromaBlueRef.current.style.transform = `translate(-${offset}px, 0)`;  chromaBlueRef.current.style.opacity = String(t * 0.18); }
      } else if (ph === 2) {
        if (chromaRedRef.current)  chromaRedRef.current.style.opacity  = '0';
        if (chromaBlueRef.current) chromaBlueRef.current.style.opacity = '0';
      }

      // ── Year counter (phase 0) ──
      if (ph === 0 && yearRef.current) {
        yearRef.current.textContent = formatDisplayYear(scene.year, Math.min(elapsed / 3, 1));
      }

      if (earth.visible) earth.rotation.y += 0.003;

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
      geo.dispose();
      mat.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      atmoGeo.dispose();
      atmoMat.dispose();
      sunGeo.dispose();
      sunMat.dispose();
      renderer.dispose();
      try { if (mount && renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement); } catch { /* ignore */ }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 100 }}>
      {/* Three.js canvas mount */}
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Chromatic aberration overlays */}
      <div ref={chromaRedRef}  style={{ position: 'absolute', inset: 0, background: 'rgba(255,30,30,0.12)',  opacity: 0, pointerEvents: 'none', mixBlendMode: 'screen' }} />
      <div ref={chromaBlueRef} style={{ position: 'absolute', inset: 0, background: 'rgba(30,80,255,0.12)', opacity: 0, pointerEvents: 'none', mixBlendMode: 'screen' }} />

      {/* Year counter (phase 0) */}
      {uiMode === 'year' && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.25em', marginBottom: '8px' }}>
            YEAR
          </div>
          <div ref={yearRef} style={{ color: 'white', fontFamily: 'monospace', fontSize: '52px', fontWeight: 800, letterSpacing: '0.04em', textShadow: '0 0 40px rgba(14,165,233,0.9)' }}>
            2026
          </div>
        </div>
      )}

      {/* Arriving at (phase 1) */}
      {uiMode === 'arriving' && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <style>{`@keyframes cinFadeIn { from { opacity:0; transform:translate(-50%,-46%) } to { opacity:1; transform:translate(-50%,-50%) } }`}</style>
          <div style={{ animation: 'cinFadeIn 0.5s ease forwards' }}>
            <div style={{ color: 'rgba(45,212,191,0.65)', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.25em', marginBottom: '14px' }}>
              ARRIVING AT:
            </div>
            <div style={{
              color: 'white', fontFamily: 'monospace', fontSize: '34px', fontWeight: 800, letterSpacing: '0.1em',
              textShadow: scene.cosmic ? '0 0 40px rgba(139,92,246,0.9)' : '0 0 40px rgba(45,212,191,0.9)',
            }}>
              {scene.label}
            </div>
            <div style={{ color: scene.cosmic ? '#a78bfa' : '#2dd4bf', fontFamily: 'monospace', fontSize: '14px', marginTop: '10px', letterSpacing: '0.15em' }}>
              {scene.year}
            </div>
          </div>
        </div>
      )}

      {/* Toward the sun (phase 3) */}
      {uiMode === 'sunrise' && (
        <div style={{ position: 'absolute', bottom: '18%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ color: 'rgba(255,204,68,0.9)', fontFamily: 'monospace', fontSize: '18px', fontWeight: 700, letterSpacing: '0.25em', textShadow: '0 0 30px rgba(255,204,68,0.8)' }}>
            TOWARD THE SUN
          </div>
        </div>
      )}

      {/* Lens flare */}
      <div ref={lensRef} style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,220,100,0.65) 0%, rgba(255,160,40,0.35) 40%, transparent 70%)', opacity: 0, pointerEvents: 'none' }} />

      {/* Signal lock (API still running after 10s) */}
      {uiMode === 'signal' && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <style>{`@keyframes signalBlink { 0%,100%{opacity:1} 50%{opacity:0.15} }`}</style>
          <div style={{ color: '#2dd4bf', fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, letterSpacing: '0.2em', animation: 'signalBlink 1.2s infinite' }}>
            SIGNAL LOCK...
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: '11px', marginTop: '14px', letterSpacing: '0.12em' }}>
            TRANSMISSION IN PROGRESS
          </div>
        </div>
      )}

      {/* White flash on completion */}
      {whiteFlash && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <style>{`@keyframes flashFade { from{opacity:1} to{opacity:0} }`}</style>
          <div style={{ position: 'absolute', inset: 0, background: 'white', animation: 'flashFade 0.5s ease forwards' }} />
        </div>
      )}
    </div>
  );
}
