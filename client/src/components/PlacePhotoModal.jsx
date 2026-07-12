import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { MAP_STYLE } from '../mapStyle.js';
import { mediaUrl, api } from '../api.js';
import { PinIcon } from './Icons.jsx';

/**
 * Modal for placing a GPS-less photo: click anywhere on the map to drop a pin,
 * confirm to run it through the geocode + grouping pipeline.
 */
export default function PlacePhotoModal({ photo, onClose, onPlaced }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [coords, setCoords] = useState(null); // { lng, lat }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [10, 25],
      zoom: 1.3,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setCoords({ lng, lat });
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        const el = document.createElement('div');
        el.className = 'place-marker';
        markerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(map);
      }
    });

    // Close on Escape.
    const onKey = (ev) => ev.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      map.remove();
    };
  }, [onClose]);

  const confirm = async () => {
    if (!coords || saving) return;
    setSaving(true);
    setError(null);
    try {
      const result = await api.placePhoto(photo._id, coords.lat, coords.lng);
      onPlaced(result);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="place-modal" onClick={(e) => e.stopPropagation()}>
        <div className="place-modal-head">
          <img className="place-modal-thumb" src={mediaUrl(photo.thumbUrl)} alt="Photo to place" />
          <div>
            <h2 className="place-modal-title">Where was this taken?</h2>
            <p className="muted">Click the map to drop a pin, then confirm.</p>
          </div>
          <button className="place-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div ref={containerRef} className="place-modal-map" />

        {error && <p className="error-banner" style={{ margin: '0.75rem 1rem 0' }}>{error}</p>}

        <div className="place-modal-foot">
          <span className="muted place-coords">
            {coords ? (
              <>
                <PinIcon width={16} height={16} /> {coords.lat.toFixed(4)},{' '}
                {coords.lng.toFixed(4)}
              </>
            ) : (
              'No location selected yet'
            )}
          </span>
          <div className="place-modal-actions">
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={confirm}
              disabled={!coords || saving}
            >
              {saving ? <span className="spin" /> : 'Place here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
