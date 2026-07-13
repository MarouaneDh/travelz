import { useEffect, useRef, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import Nav from '../components/Nav.jsx';
import Flag from '../components/Flag.jsx';
import { PinIcon } from '../components/Icons.jsx';
import { MAP_STYLE } from '../mapStyle.js';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [pins, setPins] = useState([]); // { id, placeName, countryCode }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [10, 25],
      zoom: 1.4,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      setBusy(true);
      try {
        const { moment, existed } = await api.pinPlace(lat, lng);
        if (!existed) {
          const el = document.createElement('div');
          el.className = 'place-marker';
          new maplibregl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat(moment.coordinates)
            .addTo(map);
          setPins((prev) =>
            prev.some((p) => p.id === moment.id) ? prev : [...prev, moment]
          );
        }
      } catch {
        // ignore a failed pin; user can click again
      } finally {
        setBusy(false);
      }
    });

    return () => map.remove();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const done = () => navigate(`/u/${user.username}`);

  return (
    <div className="home">
      <Nav />
      <div className="onboard">
        <div className="container">
          <p className="hero-kicker">Welcome, {user.displayName || user.username}</p>
          <h1 className="onboard-title">Bring your map to life</h1>
          <p className="onboard-sub muted">
            Tap the map to pin places you've already been — no photos needed yet. You can
            add them (and the stories) later.
          </p>
        </div>

        <div className="onboard-map-wrap">
          <div ref={containerRef} className="onboard-map" />
          {busy && <div className="onboard-pinning">Pinning…</div>}
        </div>

        <div className="container">
          {pins.length > 0 && (
            <div className="onboard-pins">
              {pins.map((p) => (
                <span key={p.id} className="onboard-chip">
                  <PinIcon width={14} height={14} />
                  {p.placeName} <Flag code={p.countryCode} />
                </span>
              ))}
            </div>
          )}

          <div className="onboard-actions">
            <button className="btn btn-ghost" onClick={done}>
              {pins.length ? 'Done' : 'Skip for now'}
            </button>
            {pins.length > 0 && (
              <button className="btn btn-primary" onClick={done}>
                View my map ({pins.length} {pins.length === 1 ? 'place' : 'places'})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
