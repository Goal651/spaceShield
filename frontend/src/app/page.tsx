'use client';

import { useEffect, useState } from 'react';
import { AsteroidDTO, FireballDTO, SolarFlareDTO } from '@/types';
import { fetchAsteroids, fetchFireballs, fetchSolarFlares } from '@/lib/api';

function RiskBadge({ level }: { level: string }) {
  const baseClasses = 'px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider';
  switch (level) {
    case 'CRITICAL': return <span className={`${baseClasses} risk-critical pulse-critical`}>{level}</span>;
    case 'WATCH':    return <span className={`${baseClasses} risk-watch`}>{level}</span>;
    case 'SAFE':     return <span className={`${baseClasses} risk-safe`}>{level}</span>;
    default:         return <span className={`${baseClasses} bg-gray-700 text-gray-300`}>{level}</span>;
  }
}

function RiskMeter({ score }: { score: number }) {
  const percentage = Math.min(Math.max(score, 0), 10) * 10;
  const color = score >= 7 ? 'bg-red-500' : score >= 4 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className={`bg-[#1a2234] rounded-lg p-4 glow-border card-hover`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        <div>
          <div className="text-gray-400 text-xs uppercase tracking-wider">{label}</div>
          <div className="text-2xl font-bold text-white">{value}</div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  return (
    <div className="bg-[#1a2234] rounded-xl glow-border card-hover flex flex-col">
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-sm font-mono">{count}</span>
      </div>
      <div className="p-4 overflow-y-auto flex-1 max-h-80 space-y-3">
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const [asteroids, setAsteroids] = useState<AsteroidDTO[]>([]);
  const [fireballs, setFireballs] = useState<FireballDTO[]>([]);
  const [solarFlares, setSolarFlares] = useState<SolarFlareDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        const [asteroidsData, fireballsData, solarFlaresData] = await Promise.all([
          fetchAsteroids(),
          fetchFireballs(),
          fetchSolarFlares(),
        ]);
        setAsteroids(asteroidsData);
        setFireballs(fireballsData);
        setSolarFlares(solarFlaresData);
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (err) {
        setError('Failed to connect to Space Shield API');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e17]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-cyan-500/30 rounded-full animate-ping" />
          </div>
        </div>
        <p className="mt-6 text-cyan-400 font-mono tracking-wider">INITIALIZING SCANNERS...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] p-4">
        <div className="bg-[#1a2234] rounded-xl glow-border p-6 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠</div>
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const hasCritical = asteroids.some(a => a.riskLevel === 'CRITICAL') ||
                      fireballs.some(f => f.riskLevel === 'CRITICAL') ||
                      solarFlares.some(s => s.riskLevel === 'CRITICAL');

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      {/* Header */}
      <header className="border-b border-cyan-500/20 bg-[#0d1424]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🛡</span>
                </div>
                {hasCritical && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                )}
                {hasCritical && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">SPACE SHIELD</h1>
                <p className="text-xs text-gray-400 font-mono">REAL-TIME THREAT MONITOR</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasCritical ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className="text-gray-400">{hasCritical ? 'ALERT ACTIVE' : 'ALL CLEAR'}</span>
              </div>
              <div className="text-gray-500 font-mono text-xs">
                Updated: {lastUpdate}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<span className="text-xl">☄️</span>}
            label="Near-Earth Asteroids"
            value={asteroids.length}
            color="bg-orange-500/20 text-orange-400"
          />
          <StatCard
            icon={<span className="text-xl">🔥</span>}
            label="Fireball Events"
            value={fireballs.length}
            color="bg-red-500/20 text-red-400"
          />
          <StatCard
            icon={<span className="text-xl">☀️</span>}
            label="Solar Flares"
            value={solarFlares.length}
            color="bg-yellow-500/20 text-yellow-400"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asteroids */}
          <SectionCard
            title="Asteroids"
            icon={<span className="text-xl">☄️</span>}
            count={asteroids.length}
          >
            {asteroids.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No asteroid data available</div>
            ) : (
              asteroids.map((asteroid) => (
                <div key={asteroid.nasaId} className="bg-[#111827] rounded-lg p-3 border border-gray-700/50 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-medium text-white text-sm truncate">{asteroid.name}</div>
                    <RiskBadge level={asteroid.riskLevel} />
                  </div>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>NASA ID:</span>
                      <span className="font-mono text-gray-300">{asteroid.nasaId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Diameter:</span>
                      <span className="text-gray-300">{asteroid.diameterMinKm?.toFixed(2)} – {asteroid.diameterMaxKm?.toFixed(2)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Miss Distance:</span>
                      <span className="text-gray-300">{Number(asteroid.missDistanceKm).toLocaleString()} km</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Risk Score</span>
                        <span className="font-mono">{asteroid.riskScore}/10</span>
                      </div>
                      <RiskMeter score={asteroid.riskScore} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </SectionCard>

          {/* Fireballs */}
          <SectionCard
            title="Fireballs"
            icon={<span className="text-xl">🔥</span>}
            count={fireballs.length}
          >
            {fireballs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No fireball data available</div>
            ) : (
              fireballs.map((fireball) => (
                <div key={fireball.id} className="bg-[#111827] rounded-lg p-3 border border-gray-700/50 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-medium text-white text-sm">Event #{fireball.id}</div>
                    <RiskBadge level={fireball.riskLevel} />
                  </div>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="text-gray-300">{fireball.eventDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Energy:</span>
                      <span className="text-gray-300 font-mono">{fireball.energyJoules?.toFixed(2)} ×10¹⁰ J</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impact:</span>
                      <span className="text-gray-300">{fireball.impactEnergyKt?.toFixed(2)} kt</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Risk Score</span>
                        <span className="font-mono">{fireball.riskScore}/10</span>
                      </div>
                      <RiskMeter score={fireball.riskScore} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </SectionCard>

          {/* Solar Flares */}
          <SectionCard
            title="Solar Flares"
            icon={<span className="text-xl">☀️</span>}
            count={solarFlares.length}
          >
            {solarFlares.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No solar flare data available</div>
            ) : (
              solarFlares.map((flare) => (
                <div key={flare.flrId} className="bg-[#111827] rounded-lg p-3 border border-gray-700/50 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-medium text-white text-sm">{flare.classType}</div>
                    <RiskBadge level={flare.riskLevel} />
                  </div>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Peak:</span>
                      <span className="text-gray-300">{flare.peakTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="text-gray-300">{flare.sourceLocation || 'N/A'}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Risk Score</span>
                        <span className="font-mono">{flare.riskScore}/10</span>
                      </div>
                      <RiskMeter score={flare.riskScore} />
                    </div>
                    {flare.riskReason && (
                      <div className="mt-2 text-gray-500 italic">{flare.riskReason}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </SectionCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
          SPACE SHIELD MONITORING SYSTEM • PROTECTING EARTH FROM COSMIC THREATS
        </div>
      </footer>
    </div>
  );
}
