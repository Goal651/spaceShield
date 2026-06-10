'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { FireballDTO } from '@/types';

function ImpactMarker({ fireball }: { fireball: FireballDTO }) {
  const { latitude, longitude, riskLevel } = fireball;
  
  // Convert lat/long to 3D coordinates on a sphere of radius 2
  const position = useMemo(() => {
    if (latitude === null || longitude === null) return new THREE.Vector3(0, 0, 0);
    
    const phi = (90 - latitude) * (Math.PI / 180);
    const theta = (longitude + 180) * (Math.PI / 180);
    
    return new THREE.Vector3(
      -2 * Math.sin(phi) * Math.cos(theta),
      2 * Math.cos(phi),
      2 * Math.sin(phi) * Math.sin(theta)
    );
  }, [latitude, longitude]);

  if (latitude === null || longitude === null) return null;

  const color = riskLevel === 'CRITICAL' ? '#f43f5e' : riskLevel === 'WATCH' ? '#f59e0b' : '#10b981';

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      {riskLevel === 'CRITICAL' && (
        <Html distanceFactor={10}>
          <div className="flex flex-col items-center pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping mb-1" />
            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/50 px-2 py-0.5 rounded text-[8px] font-bold text-red-500 uppercase whitespace-nowrap">
              Critical Impact
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Earth({ fireballs }: { fireballs: FireballDTO[] }) {
  const earthRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={earthRef}>
      {/* Atmosphere Glow */}
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
      
      {/* Main Earth Sphere */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          color="#0d1424" 
          emissive="#06b6d4" 
          emissiveIntensity={0.1} 
          wireframe={true} 
          transparent 
          opacity={0.4} 
        />
      </mesh>

      {/* Solid Core */}
      <mesh>
        <sphereGeometry args={[1.98, 64, 64]} />
        <meshStandardMaterial color="#0a0e17" />
      </mesh>

      {/* Impact Markers */}
      {fireballs.map((fb) => (
        <ImpactMarker key={fb.id} fireball={fb} />
      ))}
    </group>
  );
}

export default function Earth3D({ fireballs }: { fireballs: FireballDTO[] }) {
  return (
    <div className="h-[500px] w-full relative bg-[#0a0e17] rounded-2xl overflow-hidden glass">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <Earth fireballs={fireballs} />
        </Float>
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          minDistance={4} 
          maxDistance={10} 
          autoRotate={false}
        />
      </Canvas>
      
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-cyan-500/10 backdrop-blur-md border border-cyan-500/20 p-3 rounded-xl">
          <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-1">Orbital Projection</div>
          <div className="text-[8px] text-slate-500 font-mono">3D REAL-TIME TELEMETRY</div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Earth Rotational Sync</span>
        </div>
      </div>
    </div>
  );
}
