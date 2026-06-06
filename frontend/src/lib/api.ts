import { AsteroidDTO, FireballDTO, SolarFlareDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function fetchAsteroids(): Promise<AsteroidDTO[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/asteroid`);
  if (!response.ok) {
    throw new Error('Failed to fetch asteroids');
  }
  return response.json();
}

export async function fetchAsteroidById(id: string): Promise<AsteroidDTO> {
  const response = await fetch(`${API_BASE_URL}/api/v1/asteroid/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch asteroid');
  }
  return response.json();
}

export async function fetchFireballs(): Promise<FireballDTO[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/fireball`);
  if (!response.ok) {
    throw new Error('Failed to fetch fireballs');
  }
  return response.json();
}

export async function fetchFireballById(id: number): Promise<FireballDTO> {
  const response = await fetch(`${API_BASE_URL}/api/v1/fireball/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch fireball');
  }
  return response.json();
}

export async function fetchSolarFlares(): Promise<SolarFlareDTO[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/solar`);
  if (!response.ok) {
    throw new Error('Failed to fetch solar flares');
  }
  return response.json();
}

export async function fetchSolarFlareById(id: string): Promise<SolarFlareDTO> {
  const response = await fetch(`${API_BASE_URL}/api/v1/solar/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch solar flare');
  }
  return response.json();
}
