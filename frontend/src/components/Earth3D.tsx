'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Float, Stars, Html, Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { 
  AsteroidDTO, 
  FireballDTO, 
  SolarFlareDTO 
} from '@/types';

// Helper to convert lat/lon to 3D position
const latLonToVector3 = (lat: number, lon: number, radius: number = 2) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

// Component to render solar activity indicators
const SolarActivityIndicator = ({ flares }: { flares: SolarFlareDTO[] }) => {
  // Find most intense flare
  const mostIntense = flares.reduce((prev, current) => 
    (current.riskScore > prev.riskScore ? current : prev), flares[0] || { riskScore: 0, classType: 'N/A' });

  // Solar light source position
  const sunPosition = new THREE.Vector3(8, 2, -8);

  return (
    <group>
      {/* Sun-like light source */}
      <pointLight position={sunPosition} intensity={2.5} color="#fbbf24" distance={50} decay={2} />
      
      {/* Subtle solar glow */}
      <mesh position={sunPosition}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial 
          color="#fbbf24" 
          transparent 
          opacity={0.7}
        />
      </mesh>
      
      {/* Soft corona effect */}
      <mesh position={sunPosition}>
        <sphereGeometry args={[1.2 + (mostIntense.riskScore * 0.01), 32, 32]} />
        <meshBasicMaterial 
          color={mostIntense.riskLevel === 'CRITICAL' ? '#f43f5e' : '#f59e0b'} 
          transparent 
          opacity={0.15}
        />
      </mesh>
    </group>
  );
};

// Component to render asteroid orbital paths and markers (simplified)
const AsteroidTrajectories = ({ asteroids }: { asteroids: AsteroidDTO[] }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  // Generate simple orbital data
  const generateOrbitalPoints = (i: number, isHazardous: boolean) => {
    const radius = 2.8 + (i * 0.25);
    const points = [];
    const numPoints = 40;
    const tilt = (i * 12) * (Math.PI / 180);
    
    for (let t = 0; t <= numPoints; t++) {
      const angle = (t / numPoints) * Math.PI * 2;
      
      const x = radius * Math.cos(angle) * Math.cos(tilt);
      const y = radius * 0.25 * Math.sin(angle * 2);
      const z = radius * Math.sin(angle);
      
      points.push(new THREE.Vector3(x, y, z));
    }
    
    return points;
  };

  return (
    <group ref={groupRef}>
      {asteroids.slice(0, 8).map((asteroid, index) => { // Limit to top 8 for visual clarity
        const orbitalPoints = generateOrbitalPoints(index, asteroid.isPotentiallyHazardous);
        const currentPosition = orbitalPoints[Math.floor(Date.now() / 6000) % orbitalPoints.length];
        
        const asteroidColor = 
          asteroid.riskLevel === 'CRITICAL' ? '#fb7185' :
          asteroid.riskLevel === 'WATCH' ? '#fbbf24' : '#4ade80';
        
        const size = Math.max(0.06, Math.min(0.18, (asteroid.diameterMinKm + asteroid.diameterMaxKm) / 2 * 0.0015));
        
        return (
          <group key={asteroid.nasaId}>
            {/* Orbital Path */}
            <Line 
              points={orbitalPoints} 
              color={asteroid.isPotentiallyHazardous ? '#fb7185' : '#4b5563'} 
              lineWidth={asteroid.isPotentiallyHazardous ? 1.5 : 0.8} 
              transparent 
              opacity={asteroid.isPotentiallyHazardous ? 0.4 : 0.15} 
            />
            
            {/* Asteroid Marker */}
            <mesh position={currentPosition}>
              <sphereGeometry args={[size, 12, 12]} />
              <meshStandardMaterial color={asteroidColor} />
            </mesh>
            <mesh position={currentPosition}>
              <sphereGeometry args={[size * 1.8, 12, 12]} />
              <meshBasicMaterial color={asteroidColor} transparent opacity={0.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Component to render fireball impact markers
const FireballImpacts = ({ fireballs }: { fireballs: FireballDTO[] }) => {
  return (
    <group>
      {fireballs.map((fireball) => {
        if (fireball.latitude === null || fireball.longitude === null) return null;

        const position = latLonToVector3(fireball.latitude, fireball.longitude, 2.02);
        
        const markerColor = 
          fireball.riskLevel === 'CRITICAL' ? '#fb7185' :
          fireball.riskLevel === 'WATCH' ? '#fbbf24' : '#4ade80';
        
        return (
          <group key={fireball.id} position={position}>
            <mesh>
              <sphereGeometry args={[0.025 + (fireball.riskScore * 0.002), 12, 12]} />
              <meshBasicMaterial color={markerColor} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.06 + (fireball.riskScore * 0.003), 12, 12]} />
              <meshBasicMaterial color={markerColor} transparent opacity={0.35} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Earth component with all visualizations
const SpaceScene = ({ 
  asteroids, 
  fireballs, 
  solarFlares 
}: { 
  asteroids: AsteroidDTO[], 
  fireballs: FireballDTO[], 
  solarFlares: SolarFlareDTO[] 
}) => {
  const earthRef = useRef<THREE.Group>(null);
  
  // High-quality Earth textures
  const [colorMap, nightMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-night.jpg'
  ]);
  
  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.006;
    }
  });
  
  return (
    <>
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />
      
      <group ref={earthRef}>
        {/* Outer Atmosphere */}
        <mesh scale={[1.12, 1.12, 1.12]}>
          <sphereGeometry args={[2, 64, 64]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.05} side={THREE.BackSide} />
        </mesh>
        
        {/* Earth Surface with Map */}
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial 
            map={colorMap}
            emissiveMap={nightMap}
            emissive="#4ade80"
            emissiveIntensity={1.2}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
        
        {/* Subtle Grid Overlay */}
        <mesh scale={[1.005, 1.005, 1.005]}>
          <sphereGeometry args={[2, 32, 16]} />
          <meshBasicMaterial 
            color="#a78bfa" 
            wireframe={true} 
            transparent 
            opacity={0.06} 
          />
        </mesh>

        {/* Fireball Impact Markers */}
        <FireballImpacts fireballs={fireballs} />
      </group>
      
      {/* Asteroid Orbital Paths */}
      <AsteroidTrajectories asteroids={asteroids} />
      
      {/* Solar Activity */}
      <SolarActivityIndicator flares={solarFlares} />
    </>
  );
};

// Main 3D Map Component
export default function Earth3D({ 
  asteroids, 
  fireballs, 
  solarFlares 
}: { 
  asteroids: AsteroidDTO[], 
  fireballs: FireballDTO[], 
  solarFlares: SolarFlareDTO[] 
}) {
  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-b-2xl bg-[#05040c]">
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
        <color attach="background" args={['#05040c']} />
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
          <SpaceScene 
            asteroids={asteroids} 
            fireballs={fireballs} 
            solarFlares={solarFlares} 
          />
        </Float>
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          minDistance={3} 
          maxDistance={15} 
        />
      </Canvas>
      
      {/* Legend/Overlay */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2 rounded-xl border border-white/10 bg-[#0c0818]/90 p-3 backdrop-blur-md">
        <div className="mb-1 border-b border-white/5 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Legend
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full border border-violet-400 bg-violet-500/40" />
          <span className="text-[9px] text-slate-300">Earth</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-[9px] text-slate-300">All clear</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-[9px] text-slate-300">Worth watching</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-rose-400" />
          <span className="text-[9px] text-slate-300">Needs attention</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-300" />
          <span className="text-[9px] text-slate-300">Solar activity</span>
        </div>
      </div>
    </div>
  );
}
