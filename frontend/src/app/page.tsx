'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { AsteroidDTO, FireballDTO, SolarFlareDTO, DashboardDTO } from '@/types';
import { fetchDashboard } from '@/lib/api';

// Dynamically import the map (Leaflet needs browser APIs)
const FireballMap = dynamic(() => import('@/components/FireballMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <div className="h-[400px] flex items-center justify-center text-gray-500">
        Loading map...
      </div>
    </div>
  ),
});

/** Color for traditional risk levels: SAFE / WATCH / CRITICAL */
function riskColor(level: string): string {
  switch (level) {
    case 'CRITICAL': return 'text-red-600';
    case 'WATCH':    return 'text-yellow-600';
    case 'SAFE':     return 'text-green-600';
    default:         return 'text-gray-400';
  }
}

/** Color for solar-flare-specific risk levels */
function solarRiskColor(level: string): string {
  switch (level) {
    case 'CRITICAL': return 'text-red-700 font-bold';
    case 'EXTREME':  return 'text-red-500';
    case 'SEVERE':   return 'text-orange-500';
    case 'MODERATE': return 'text-yellow-500';
    case 'MINOR':    return 'text-green-500';
    default:         return 'text-gray-400';
  }
}

export default function Home() {
  const [asteroids, setAsteroids] = useState<AsteroidDTO[]>([]);
  const [fireballs, setFireballs] = useState<FireballDTO[]>([]);
  const [mappableFireballs, setMappableFireballs] = useState<FireballDTO[]>([]);
  const [solarFlares, setSolarFlares] = useState<SolarFlareDTO[]>([]);
  const [summary, setSummary] = useState<{
    totalAsteroids: number;
    totalFireballs: number;
    totalSolarFlares: number;
    criticalEvents: number;
    watchEvents: number;
    significantSolarFlares: number;
    lastUpdated: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data: DashboardDTO = await fetchDashboard();
        setAsteroids(data.asteroids);
        setFireballs(data.fireballs);
        setMappableFireballs(data.mappableFireballs);
        setSolarFlares(data.solarFlares);
        setSummary({
          totalAsteroids: data.totalAsteroids,
          totalFireballs: data.totalFireballs,
          totalSolarFlares: data.totalSolarFlares,
          criticalEvents: data.criticalEvents,
          watchEvents: data.watchEvents,
          significantSolarFlares: data.significantSolarFlares,
          lastUpdated: data.lastUpdated,
        });
      } catch (err) {
        setError('Failed to load data from server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-white">Loading Space Shield...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🛸 Space Shield
            </h1>
            <p className="text-gray-400">
              Real-time space intelligence — asteroids, fireballs &amp; solar activity
            </p>
          </div>
          {summary && (
            <div className="text-right text-sm text-gray-400">
              <div>Updated: {new Date(summary.lastUpdated).toLocaleTimeString()}</div>
              <div className="flex gap-4 mt-1">
                <span className="text-red-400">{summary.criticalEvents} Critical</span>
                <span className="text-yellow-400">{summary.watchEvents} Watch</span>
              </div>
            </div>
          )}
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Asteroids ────────────────────────────────── */}
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              ☄️ Asteroids{' '}
              <span className="text-gray-400 text-lg">({asteroids.length})</span>
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {asteroids.map((asteroid) => (
                <div key={asteroid.nasaId} className="border-b border-gray-700 pb-2">
                  <div className="font-medium text-white">{asteroid.name}</div>
                  <div className="text-sm text-gray-400">NASA ID: {asteroid.nasaId}</div>
                  <div className="text-sm text-gray-400">
                    Ø {asteroid.diameterMinKm?.toFixed(2)} – {asteroid.diameterMaxKm?.toFixed(2)} km
                  </div>
                  <div className="text-sm text-gray-400">
                    Miss: {asteroid.missDistanceKm?.toFixed(0)} km
                  </div>
                  <div className={`text-sm font-medium ${riskColor(asteroid.riskLevel)}`}>
                    Risk: {asteroid.riskLevel} (Score: {asteroid.riskScore})
                  </div>
                </div>
              ))}
              {asteroids.length === 0 && (
                <div className="text-gray-500">No asteroids data available</div>
              )}
            </div>
          </div>

          {/* ── Fireballs ────────────────────────────────── */}
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              🔥 Fireballs{' '}
              <span className="text-gray-400 text-lg">({fireballs.length})</span>
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {fireballs.map((fireball) => (
                <div key={fireball.id} className="border-b border-gray-700 pb-2">
                  <div className="font-medium text-white">Event #{fireball.id}</div>
                  <div className="text-sm text-gray-400">Date: {fireball.eventDate}</div>
                  <div className="text-sm text-gray-400">
                    Energy: {fireball.energyJoules?.toFixed(2)} ×10¹⁰ J
                  </div>
                  <div className="text-sm text-gray-400">
                    Impact: {fireball.impactEnergyKt?.toFixed(2)} kt
                  </div>
                  <div className="text-sm text-gray-400">
                    {fireball.latitude !== null && fireball.longitude !== null
                      ? `📍 ${fireball.latitude.toFixed(2)}°, ${fireball.longitude.toFixed(2)}°`
                      : '📍 No location data'}
                  </div>
                  <div className={`text-sm font-medium ${riskColor(fireball.riskLevel)}`}>
                    Risk: {fireball.riskLevel} (Score: {fireball.riskScore})
                  </div>
                </div>
              ))}
              {fireballs.length === 0 && (
                <div className="text-gray-500">No fireballs data available</div>
              )}
            </div>
          </div>

          {/* ── Solar Flares ─────────────────────────────── */}
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              ☀️ Solar Flares{' '}
              <span className="text-gray-400 text-lg">({solarFlares.length})</span>
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {solarFlares.map((flare) => (
                <div key={flare.flrId} className="border-b border-gray-700 pb-2">
                  <div className="font-medium text-white">{flare.classType}</div>
                  <div className="text-sm text-gray-400">ID: {flare.flrId}</div>
                  <div className="text-sm text-gray-400">Peak: {flare.peakTime}</div>
                  <div className="text-sm text-gray-400">Location: {flare.sourceLocation || 'N/A'}</div>
                  <div className={`text-sm font-medium ${solarRiskColor(flare.riskLevel)}`}>
                    Space Weather: {flare.riskLevel} (Score: {flare.riskScore})
                  </div>
                </div>
              ))}
              {solarFlares.length === 0 && (
                <div className="text-gray-500">No solar flares data available</div>
              )}
            </div>
          </div>

        </div>

        {/* ── Full-width Fireball Map (uses mappableFireballs from API) ── */}
        <FireballMap fireballs={mappableFireballs} />

      </div>
    </div>
  );
}
