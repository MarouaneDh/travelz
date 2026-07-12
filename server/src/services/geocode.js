/**
 * Reverse geocoding via OpenStreetMap Nominatim (free, no API key).
 * Results are cached in-memory by a coarse coordinate key to respect the
 * usage policy (max ~1 req/sec) and avoid hammering the service.
 */
const cache = new Map();
const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse';
const email = process.env.NOMINATIM_EMAIL || '';

// Round to ~1km so nearby photos share a cache entry / a single request.
function keyFor(lat, lng) {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

let lastCall = 0;
async function polite() {
  const now = Date.now();
  const wait = Math.max(0, 1100 - (now - lastCall));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();
}

export async function reverseGeocode(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  const key = keyFor(lat, lng);
  if (cache.has(key)) return cache.get(key);

  await polite();

  const url = `${NOMINATIM}?format=jsonv2&lat=${lat}&lng=${lng}&lon=${lng}&zoom=10&addressdetails=1${
    email ? `&email=${encodeURIComponent(email)}` : ''
  }`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Travelz/1.0 (personal travel map)',
        'Accept-Language': 'en', // prefer English place names
      },
    });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const data = await res.json();
    const addr = data.address || {};
    const city =
      addr.city || addr.town || addr.village || addr.county || addr.state || '';
    const country = addr.country || '';
    const countryCode = (addr.country_code || '').toUpperCase();
    const placeName = [city, country].filter(Boolean).join(', ');

    const result = { city, country, countryCode, placeName };
    cache.set(key, result);
    return result;
  } catch (err) {
    console.warn('reverseGeocode failed:', err.message);
    return null;
  }
}
