import { Moment } from '../models/Moment.js';

// Two photos belong to the same moment if they're within ~25km and ~24h.
const DISTANCE_KM = 25;
const TIME_HOURS = 24;

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Find an existing moment a photo belongs to, or null if it should start a new one.
 * Matches on spatial + temporal proximity.
 */
export async function findMatchingMoment({ owner, lat, lng, takenAt }) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  const when = takenAt ? new Date(takenAt) : null;
  const timeWindow = TIME_HOURS * 60 * 60 * 1000;

  // Candidate moments within the distance radius (geospatial pre-filter),
  // scoped to this owner so users never merge into each other's moments.
  const candidates = await Moment.find({
    owner,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: DISTANCE_KM * 1000,
      },
    },
  }).limit(10);

  for (const m of candidates) {
    const coords = m.location?.coordinates;
    if (!coords) continue;
    const distOk =
      haversineKm({ lat, lng }, { lng: coords[0], lat: coords[1] }) <= DISTANCE_KM;
    if (!distOk) continue;

    if (!when || !m.startAt) return m; // no time info → distance is enough
    const start = new Date(m.startAt).getTime();
    const end = new Date(m.endAt || m.startAt).getTime();
    if (when.getTime() >= start - timeWindow && when.getTime() <= end + timeWindow) {
      return m;
    }
  }
  return null;
}
