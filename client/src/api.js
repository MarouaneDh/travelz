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

  getMoments: () => fetch(`${BASE}/api/moments`).then(handle),
  getGeojson: () => fetch(`${BASE}/api/moments/geojson`).then(handle),
  getMoment: (id) => fetch(`${BASE}/api/moments/${id}`).then(handle),
  getPassport: () => fetch(`${BASE}/api/moments/passport`).then(handle),

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

  login: (username, password) =>
    fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
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
