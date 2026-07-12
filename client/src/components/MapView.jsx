import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import { api, mediaUrl } from '../api.js';
import { MAP_STYLE } from '../mapStyle.js';

export default function MapView({ username = null, feed = false, explore = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({}); // id -> maplibre.Marker
  const navigate = useNavigate();
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [10, 25],
      zoom: 1.4,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', async () => {
      let geojson;
      try {
        geojson = explore
          ? await api.getExploreGeojson()
          : feed
          ? await api.getFeedGeojson()
          : username
          ? await api.getUserGeojson(username)
          : await api.getGeojson();
      } catch {
        return;
      }
      if (!geojson.features.length) {
        setEmpty(true);
        return;
      }

      map.addSource('moments', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterRadius: 55,
        clusterMaxZoom: 12,
      });

      // Invisible circle layers force the GeoJSON source to be tiled — without a
      // layer referencing it, querySourceFeatures() returns nothing. We draw the
      // real pins as HTML markers on top, so these stay transparent.
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'moments',
        filter: ['has', 'point_count'],
        paint: { 'circle-radius': 1, 'circle-opacity': 0 },
      });
      map.addLayer({
        id: 'unclustered',
        type: 'circle',
        source: 'moments',
        filter: ['!', ['has', 'point_count']],
        paint: { 'circle-radius': 1, 'circle-opacity': 0 },
      });

      // Register render triggers BEFORE fitBounds — for inline GeoJSON the
      // source 'data' and 'moveend' events fire almost immediately, so
      // registering afterwards would miss them and leave the map marker-less.
      // 'idle' guarantees we render once tiles are actually built.
      const render = () => syncMarkers(map, markersRef, navigate);
      map.on('data', (e) => {
        if (e.sourceId === 'moments' && map.getSource('moments')?.loaded()) render();
      });
      map.on('idle', render);
      map.on('move', render);
      map.on('moveend', render);

      // Fit the map to the pins.
      const bounds = new maplibregl.LngLatBounds();
      geojson.features.forEach((f) => bounds.extend(f.geometry.coordinates));
      map.fitBounds(bounds, { padding: 80, maxZoom: 6, duration: 0 });

      render();
    });

    return () => map.remove();
  }, [navigate, username, feed, explore]);

  return (
    <div className="map-wrap">
      <div ref={containerRef} className="map-canvas" />
      {empty && (
        <div className="map-empty">
          <p>No placed moments yet — upload some geotagged photos to light up the map.</p>
        </div>
      )}
    </div>
  );
}

/**
 * Official MapLibre pattern: build HTML markers from the current cluster/point
 * features so we can show photo thumbnails (which symbol layers can't do per-feature).
 */
function syncMarkers(map, markersRef, navigate) {
  if (!map.getSource('moments')) return;
  const features = map.querySourceFeatures('moments');
  const next = {};

  for (const f of features) {
    const coords = f.geometry.coordinates;
    const props = f.properties;

    if (props.cluster) {
      const id = `cluster-${props.cluster_id}`;
      next[id] = markersRef.current[id] || makeClusterMarker(map, coords, props);
    } else {
      const id = `pt-${props.id}`;
      next[id] =
        markersRef.current[id] || makePhotoMarker(map, coords, props, navigate);
    }
  }

  // Remove markers no longer visible.
  for (const id in markersRef.current) {
    if (!next[id]) markersRef.current[id].remove();
  }
  // Add new markers.
  for (const id in next) {
    if (!markersRef.current[id]) next[id].addTo(map);
  }
  markersRef.current = next;
}

// NOTE: MapLibre writes `transform: translate(...)` onto the marker's root
// element to position it. So the root must stay transform-free; all visual
// transforms (rotate/scale) live on an inner child element.
function makeClusterMarker(map, coords, props) {
  const wrap = document.createElement('div'); // positioned by MapLibre
  const el = document.createElement('button');
  el.className = 'map-cluster';
  el.type = 'button';
  el.textContent = props.point_count_abbreviated;
  el.setAttribute('aria-label', `${props.point_count} moments — zoom in`);
  el.addEventListener('click', () => {
    map
      .getSource('moments')
      .getClusterExpansionZoom(props.cluster_id)
      .then((zoom) => map.easeTo({ center: coords, zoom }));
  });
  wrap.appendChild(el);
  return new maplibregl.Marker({ element: wrap }).setLngLat(coords);
}

function makePhotoMarker(map, coords, props, navigate) {
  const wrap = document.createElement('div'); // positioned by MapLibre
  const el = document.createElement('button');
  el.className = 'map-pin';
  el.type = 'button';
  el.setAttribute('aria-label', `${props.placeName} — ${props.photoCount} photos`);
  if (props.thumbUrl) {
    const img = document.createElement('img');
    img.src = mediaUrl(props.thumbUrl);
    img.alt = '';
    el.appendChild(img);
  }
  if (props.photoCount > 1) {
    const badge = document.createElement('span');
    badge.className = 'map-pin-badge';
    badge.textContent = props.photoCount;
    el.appendChild(badge);
  }
  el.addEventListener('click', () => navigate(`/moment/${props.id}`));

  let pop = null;
  el.addEventListener('mouseenter', () => {
    pop = new maplibregl.Popup({
      closeButton: false,
      offset: 30,
      className: 'map-popup',
    })
      .setLngLat(coords)
      .setHTML(`<strong>${props.placeName}</strong>`)
      .addTo(map);
  });
  el.addEventListener('mouseleave', () => {
    pop?.remove();
    pop = null;
  });

  wrap.appendChild(el);
  return new maplibregl.Marker({ element: wrap, anchor: 'bottom' }).setLngLat(coords);
}
