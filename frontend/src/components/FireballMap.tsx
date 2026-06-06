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
    case 'CRITICAL': return '#ef4444'; // red-500
    case 'WATCH':    return '#f59e0b'; // amber-500
    case 'SAFE':     return '#10b981'; // emerald-500
    default:         return '#64748b'; // slate-500
  }
}

function riskIcon(level: string): L.DivIcon {
  const color = riskColor(level);
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 20px; height: 20px;
      background: ${color};
      border: 2px solid rgba(255,255,255,0.8);
      border-radius: 50%;
      box-shadow: 0 0 10px ${color}80;
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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
    <div className="h-[450px] w-full relative z-0">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%', background: '#0a0e17' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {validFireballs.map((fb) => (
          <Marker
            key={fb.id}
            position={[fb.latitude!, fb.longitude!]}
            icon={riskIcon(fb.riskLevel)}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[150px]">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Impact Event</div>
                <div className="text-sm font-bold text-slate-900 mb-2">Event #{fb.id}</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Energy</span>
                    <span className="font-mono font-bold text-slate-800">{fb.energyJoules?.toFixed(1)}e10 J</span>
                  </div>
                  <div className={`text-[10px] font-bold uppercase mt-2 pt-2 border-t border-slate-100 ${
                    fb.riskLevel === 'CRITICAL' ? 'text-red-600' :
                    fb.riskLevel === 'WATCH' ? 'text-amber-600' :
                    'text-emerald-600'
                  }`}>
                    Risk: {fb.riskLevel} ({fb.riskScore}/10)
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-2 rounded-lg text-[10px] text-slate-400 font-mono z-[1000]">
        PROJECTION ACTIVE • {validFireballs.length} TARGETS
      </div>
    </div>
  );
}
