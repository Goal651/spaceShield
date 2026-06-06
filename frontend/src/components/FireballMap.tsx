'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FireballDTO } from '@/types';

import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icon issue (webpack/vite)
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

function riskColor(level: string): string {
  switch (level) {
    case 'CRITICAL': return '#dc2626';
    case 'WATCH':    return '#ca8a04';
    case 'SAFE':     return '#16a34a';
    default:         return '#6b7280';
  }
}

function riskIcon(level: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px; height: 24px;
      background: ${riskColor(level)};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

interface FireballMapProps {
  fireballs: FireballDTO[];
}

export default function FireballMap({ fireballs }: FireballMapProps) {
  const validFireballs = fireballs.filter(
    (fb) => fb.latitude !== null && fb.longitude !== null
  );

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-white mb-4">
        🌍 Fireball Impact Map{' '}
        <span className="text-gray-400 text-lg">({validFireballs.length} located)</span>
      </h2>
      <div className="h-[400px] w-full rounded-md overflow-hidden">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {validFireballs.map((fb) => (
            <Marker
              key={fb.id}
              position={[fb.latitude!, fb.longitude!]}
              icon={riskIcon(fb.riskLevel)}
            >
              <Popup>
                <div className="text-sm text-gray-900">
                  <div className="font-bold">Fireball #{fb.id}</div>
                  <div>Date: {fb.eventDate}</div>
                  <div>Energy: {fb.energyJoules?.toFixed(2)} ×10¹⁰ J</div>
                  <div>Impact: {fb.impactEnergyKt?.toFixed(2)} kt</div>
                  <div>Altitude: {fb.altitudeKm?.toFixed(1) ?? 'N/A'} km</div>
                  <div className={`font-medium ${
                    fb.riskLevel === 'CRITICAL' ? 'text-red-600' :
                    fb.riskLevel === 'WATCH' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    Risk: {fb.riskLevel} (Score: {fb.riskScore})
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
