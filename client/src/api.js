const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const mediaUrl = (path) => (path?.startsWith('http') ? path : `${BASE}${path}`);

function authHeaders() {
  const token = localStorage.getItem('tt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  base: BASE,

  // Curator brand home
  getMoments: () => fetch(`${BASE}/api/moments`).then(handle),
  getGeojson: () => fetch(`${BASE}/api/moments/geojson`).then(handle),
  getMoment: (id) => fetch(`${BASE}/api/moments/${id}`).then(handle),
  getPassport: () => fetch(`${BASE}/api/moments/passport`).then(handle),

  // Traveler profiles (per-user maps)
  getUser: (username) => fetch(`${BASE}/api/users/${username}`).then(handle),
  getUserMoments: (username) =>
    fetch(`${BASE}/api/users/${username}/moments`).then(handle),
  getUserGeojson: (username) =>
    fetch(`${BASE}/api/users/${username}/geojson`).then(handle),
  getUserPassport: (username) =>
    fetch(`${BASE}/api/users/${username}/passport`).then(handle),

  follow: (username) =>
    fetch(`${BASE}/api/users/${username}/follow`, {
      method: 'POST',
      headers: authHeaders(),
    }).then(handle),

  unfollow: (username) =>
    fetch(`${BASE}/api/users/${username}/follow`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handle),

  getFeed: () => fetch(`${BASE}/api/feed`, { headers: authHeaders() }).then(handle),
  getFeedGeojson: () =>
    fetch(`${BASE}/api/feed/geojson`, { headers: authHeaders() }).then(handle),

  // Explore-by-place (public)
  getExploreGeojson: () => fetch(`${BASE}/api/explore/geojson`).then(handle),
  getExplorePlaces: () => fetch(`${BASE}/api/explore/places`).then(handle),
  getExplorePlace: (name) =>
    fetch(`${BASE}/api/explore/place?name=${encodeURIComponent(name)}`).then(handle),

  me: () => fetch(`${BASE}/api/auth/me`, { headers: authHeaders() }).then(handle),

  register: (payload) =>
    fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handle),

  react: (id, emoji) =>
    fetch(`${BASE}/api/moments/${id}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    }).then(handle),

  getUnplaced: () =>
    fetch(`${BASE}/api/photos/unplaced`, { headers: authHeaders() }).then(handle),

  placePhoto: (id, lat, lng) =>
    fetch(`${BASE}/api/photos/${id}/place`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ lat, lng }),
    }).then(handle),

  login: (identifier, password) =>
    fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    }).then(handle),

  upload: (files, onProgress) => {
    const form = new FormData();
    [...files].forEach((f) => form.append('photos', f));
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE}/api/upload`);
      const token = localStorage.getItem('tt_token');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
      };
      xhr.onload = () => {
        try {
          const body = JSON.parse(xhr.responseText);
          xhr.status >= 200 && xhr.status < 300
            ? resolve(body)
            : reject(new Error(body.error || 'Upload failed'));
        } catch {
          reject(new Error('Upload failed'));
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(form);
    });
  },
};
