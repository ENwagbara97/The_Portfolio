import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const EARTH_DAY    = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
const EARTH_BUMP   = 'https://unpkg.com/three-globe/example/img/earth-topology.png';
const EARTH_SPEC   = 'https://unpkg.com/three-globe/example/img/earth-water.png';
const EARTH_CLOUDS = 'https://unpkg.com/three-globe/example/img/earth-clouds.png';
const EARTH_NIGHT  = 'https://unpkg.com/three-globe/example/img/earth-night.jpg';

export default function ThreeGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight;

    // Fallback if container is initially 0x0
    if (width === 0) width = 500;
    if (height === 0) height = 500;

    const isMobile = window.innerWidth < 768;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      setIsLoading(false);
      if (containerRef.current && !containerRef.current.contains(renderer.domElement)) {
        containerRef.current.appendChild(renderer.domElement);
      }
    };

    const loader = new THREE.TextureLoader(manager);
    const texture = loader.load(EARTH_DAY);
    const bumpMap = loader.load(EARTH_BUMP);
    const specMap = loader.load(EARTH_SPEC);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      bumpMap: bumpMap,
      bumpScale: 0.05,
      roughnessMap: specMap,
      roughness: 0.8,
      metalness: 0.2,
    });

    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    const cloudGeometry = new THREE.SphereGeometry(1.015, 64, 64);
    const cloudTexture = loader.load(EARTH_CLOUDS);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.4,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);

    const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, ${isMobile ? '0.06' : '1.0'}) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.01 });
    const starVertices = [];
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;
    controls.minDistance = 1.5;
    controls.maxDistance = 4.0;
    controlsRef.current = controls;

    let animationId: number;
    let isDestroyed = false;

    const animate = () => {
      if (isDestroyed) return;
      animationId = requestAnimationFrame(animate);
      
      const spinSpeed = isMobile ? 0.001 : 0.0015;
      earth.rotation.y += spinSpeed;
      clouds.rotation.y += spinSpeed * 1.5;
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, []);

  const handleZoom = (delta: number) => {
    if (controlsRef.current) {
      const targetZ = controlsRef.current.object.position.z + delta;
      controlsRef.current.object.position.z = Math.max(1.5, Math.min(4.0, targetZ));
      controlsRef.current.update();
    }
  };

  return (
    <div 
      style={{
        width: '100%',
        height: 'clamp(280px, 50vw, 520px)',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        background: '#0A0A0A',
      }}
      className="group"
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      {isLoading && (
        <div style={{
          width: '100%', height: '100%',
          position: 'absolute', top: 0, left: 0,
          background: 'linear-gradient(90deg, #111 25%, #222 50%, #111 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }} />
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing" 
        style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s' }}
      />
      
      {!isLoading && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 10
        }}>
          <button 
            onClick={() => handleZoom(-0.5)}
            style={{
              width: '44px', height: '44px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              backdropFilter: 'blur(4px)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px'
            }}
          >
            +
          </button>
          <button 
            onClick={() => handleZoom(0.5)}
            style={{
              width: '44px', height: '44px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              backdropFilter: 'blur(4px)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px'
            }}
          >
            -
          </button>
        </div>
      )}
    </div>
  );
}
