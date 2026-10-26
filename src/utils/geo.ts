// Geolocation and navigation utilities for VoltSpot

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates straight-line distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

/**
 * Estimates driving time assuming 35 km/h urban speed with traffic factor
 */
export function estimateDrivingMinutes(km: number): number {
  const avgSpeedKmH = 32;
  const minutes = Math.ceil((km / avgSpeedKmH) * 60);
  return Math.max(minutes, 3);
}

/**
 * Generates turnkey Google Maps turn-by-turn navigation URL
 */
export function getGoogleMapsNavUrl(latitude?: number | null, longitude?: number | null, address?: string): string {
  if (latitude && longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address || 'EV Charger')}&travelmode=driving`;
}
