/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Interactive 3D Indian Craft Showcase (Three.js)
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Eye, Sparkles } from 'lucide-react';

export const CraftShowcase3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [materialMode, setMaterialMode] = useState<'brass' | 'bronze' | 'kansa'>('brass');
  const [isRotating, setIsRotating] = useState(true);
  const [activeView, setActiveView] = useState<'perspective' | 'detail'>('perspective');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.8);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    dirLight.position.set(5, 8, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(0xd4af37, 1.5, 10);
    rimLight.position.set(-4, -1, -2);
    scene.add(rimLight);

    // 5. Build Artisanal Dhokra Bell-Metal Artifact Group
    const group = new THREE.Group();
    meshRef.current = group;

    // Base Pedestal
    const baseGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.15, 32);
    // Vessel Body (Urli / Kalash form)
    const bodyGeo = new THREE.SphereGeometry(0.75, 32, 24);
    bodyGeo.scale(1, 0.65, 1);
    // Vessel Flared Rim
    const rimGeo = new THREE.TorusGeometry(0.68, 0.08, 16, 32);
    rimGeo.rotateX(Math.PI / 2);
    // Tribal Dhokra Rib Filigree Rings
    const ring1Geo = new THREE.TorusGeometry(0.76, 0.03, 12, 32);
    ring1Geo.rotateX(Math.PI / 2);

    const getMaterial = (mode: 'brass' | 'bronze' | 'kansa') => {
      if (mode === 'brass') {
        return new THREE.MeshStandardMaterial({
          color: 0xd4af37, // Rich antique brass gold
          metalness: 0.85,
          roughness: 0.32
        });
      }
      if (mode === 'bronze') {
        return new THREE.MeshStandardMaterial({
          color: 0x8c6239, // Aged lost-wax bronze patina
          metalness: 0.75,
          roughness: 0.45
        });
      }
      return new THREE.MeshStandardMaterial({
        color: 0xe6c794, // Luminous Kansa bell chime alloy
        metalness: 0.92,
        roughness: 0.22
      });
    };

    const mat = getMaterial(materialMode);

    const baseMesh = new THREE.Mesh(baseGeo, mat);
    baseMesh.position.y = -0.5;
    group.add(baseMesh);

    const bodyMesh = new THREE.Mesh(bodyGeo, mat);
    bodyMesh.position.y = 0;
    group.add(bodyMesh);

    const rimMesh = new THREE.Mesh(rimGeo, mat);
    rimMesh.position.y = 0.48;
    group.add(rimMesh);

    const ringMesh = new THREE.Mesh(ring1Geo, mat);
    ringMesh.position.y = 0.05;
    group.add(ringMesh);

    scene.add(group);

    // 6. Interaction: Mouse drag to rotate
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !meshRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      meshRef.current.rotation.y += deltaX * 0.01;
      meshRef.current.rotation.x += deltaY * 0.005;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 7. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (group && isRotating && !isDragging) {
        group.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [materialMode, isRotating]);

  return (
    <div className="relative w-full h-[400px] sm:h-[460px] bg-stone-900 rounded-lg overflow-hidden border border-stone-800 flex flex-col justify-between">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Badge & Craft Info */}
      <div className="relative z-10 p-5 flex items-start justify-between pointer-events-none">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
            3D Craft Inspector
          </span>
          <h4 className="font-serif text-lg font-medium text-stone-100 mt-0.5">
            Dhokra Ceremonial Urli Alloy
          </h4>
          <p className="text-xs text-stone-400">Drag to inspect 360° lost-wax casting details</p>
        </div>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className="pointer-events-auto p-2 rounded bg-stone-800/80 text-stone-300 hover:text-white backdrop-blur-sm transition-colors cursor-pointer text-xs flex items-center gap-1.5"
          title="Toggle rotation"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isRotating ? 'Auto-Rotate' : 'Paused'}</span>
        </button>
      </div>

      {/* Bottom Controls: Alloy Alloy Selector & Dimensions */}
      <div className="relative z-10 p-5 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent flex flex-wrap items-center justify-between gap-4">
        {/* Metal Alloy Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-800/80 backdrop-blur-sm rounded">
          <button
            onClick={() => setMaterialMode('brass')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              materialMode === 'brass'
                ? 'bg-amber-400 text-stone-950 font-semibold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Antique Brass
          </button>
          <button
            onClick={() => setMaterialMode('bronze')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              materialMode === 'bronze'
                ? 'bg-amber-400 text-stone-950 font-semibold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Aged Bronze
          </button>
          <button
            onClick={() => setMaterialMode('kansa')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              materialMode === 'kansa'
                ? 'bg-amber-400 text-stone-950 font-semibold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Kansa Alloy
          </button>
        </div>

        {/* Spec Callout */}
        <div className="text-right text-xs text-stone-300 font-mono tabular-nums">
          <div>H: 18cm · Dia: 24cm · 2.4 kg</div>
          <div className="text-amber-400 text-[11px] font-sans">GI Tag Bastar · Kondagaon Cluster</div>
        </div>
      </div>
    </div>
  );
};
