'use client';

import { useEffect, useState } from 'react';
import { AsteroidDTO, FireballDTO, SolarFlareDTO } from '@/types';
import { fetchAsteroids, fetchFireballs, fetchSolarFlares } from '@/lib/api';

export default function Home() {
  const [asteroids, setAsteroids] = useState<AsteroidDTO[]>([]);
  const [fireballs, setFireballs] = useState<FireballDTO[]>([]);
  const [solarFlares, setSolarFlares] = useState<SolarFlareDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Space Shield Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asteroids Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Asteroids ({asteroids.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {asteroids.map((asteroid) => (
                <div key={asteroid.nasaId} className="border-b pb-2">
                  <div className="font-medium text-gray-900">{asteroid.name}</div>
                  <div className="text-sm text-gray-600">NASA ID: {asteroid.nasaId}</div>
                  <div className="text-sm text-gray-600">
                    Diameter: {asteroid.diameterMinKm?.toFixed(2)} - {asteroid.diameterMaxKm?.toFixed(2)} km
                  </div>
                  <div className="text-sm text-gray-600">
                    Miss Distance: {asteroid.missDistanceKm?.toFixed(0)} km
                  </div>
                  <div className={`text-sm font-medium ${
                    asteroid.riskLevel === 'CRITICAL' ? 'text-red-600' :
                    asteroid.riskLevel === 'WATCH' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    Risk: {asteroid.riskLevel} (Score: {asteroid.riskScore})
                  </div>
                </div>
              ))}
              {asteroids.length === 0 && <div className="text-gray-500">No asteroids data available</div>}
            </div>
          </div>

          {/* Fireballs Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Fireballs ({fireballs.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {fireballs.map((fireball) => (
                <div key={fireball.id} className="border-b pb-2">
                  <div className="font-medium text-gray-900">Event #{fireball.id}</div>
                  <div className="text-sm text-gray-600">Date: {fireball.eventDate}</div>
                  <div className="text-sm text-gray-600">
                    Energy: {fireball.energyJoules?.toFixed(2)} ×10¹⁰ J
                  </div>
                  <div className="text-sm text-gray-600">
                    Impact: {fireball.impactEnergyKt?.toFixed(2)} kt
                  </div>
                  <div className={`text-sm font-medium ${
                    fireball.riskLevel === 'CRITICAL' ? 'text-red-600' :
                    fireball.riskLevel === 'WATCH' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    Risk: {fireball.riskLevel} (Score: {fireball.riskScore})
                  </div>
                </div>
              ))}
              {fireballs.length === 0 && <div className="text-gray-500">No fireballs data available</div>}
            </div>
          </div>

          {/* Solar Flares Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Solar Flares ({solarFlares.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {solarFlares.map((flare) => (
                <div key={flare.flrId} className="border-b pb-2">
                  <div className="font-medium text-gray-900">{flare.classType}</div>
                  <div className="text-sm text-gray-600">ID: {flare.flrId}</div>
                  <div className="text-sm text-gray-600">Peak: {flare.peakTime}</div>
                  <div className="text-sm text-gray-600">Location: {flare.sourceLocation}</div>
                  <div className={`text-sm font-medium ${
                    flare.riskLevel === 'CRITICAL' ? 'text-red-600' :
                    flare.riskLevel === 'WATCH' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    Risk: {flare.riskLevel} (Score: {flare.riskScore})
                  </div>
                </div>
              ))}
              {solarFlares.length === 0 && <div className="text-gray-500">No solar flares data available</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
