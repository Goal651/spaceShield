export interface AsteroidDTO {
  nasaId: string;
  name: string;
  diameterMinKm: number;
  diameterMaxKm: number;
  velocityKmPerSec: number;
  missDistanceKm: number;
  closeApproachDate: string;
  isPotentiallyHazardous: boolean;
  riskLevel: 'SAFE' | 'WATCH' | 'CRITICAL';
  riskScore: number;
  riskReason: string;
  ingestedAt: string;
}

export interface FireballDTO {
  id: number;
  eventDate: string;
  latDir: 'N' | 'S' | null;
  lon: number | null;
  lonDir: 'E' | 'W' | null;
  altitudeKm: number | null;
  energyJoules: number;
  impactEnergyKt: number;
  riskLevel: string;
  riskScore: number;
  riskReason: string;
  ingestedAt: string;
}

export interface SolarFlareDTO {
  flrId: string;
  classType: string;
  beginTime: string;
  peakTime: string;
  endTime: string;
  sourceLocation: string;
  riskLevel: string;
  riskScore: number;
  riskReason: string;
  ingestedAt: string;
}
