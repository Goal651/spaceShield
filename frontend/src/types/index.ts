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
  lat: number | null;
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
  /** Computed decimal latitude from NASA raw coords */
  latitude: number | null;
  /** Computed decimal longitude from NASA raw coords */
  longitude: number | null;
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

export interface DashboardDTO {
  asteroids: AsteroidDTO[];
  fireballs: FireballDTO[];
  /** Fireballs with known coordinates (for map) */
  mappableFireballs: FireballDTO[];
  solarFlares: SolarFlareDTO[];
  totalAsteroids: number;
  totalFireballs: number;
  totalSolarFlares: number;
  criticalEvents: number;
  watchEvents: number;
  significantSolarFlares: number;
  lastUpdated: string;
}
