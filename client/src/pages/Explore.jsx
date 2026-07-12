import { useEffect, useState } from 'react';
import Nav from '../components/Nav.jsx';
import MapView from '../components/MapView.jsx';
import DestinationCard from '../components/DestinationCard.jsx';
import { MapIcon, GlobeIcon } from '../components/Icons.jsx';
import { api } from '../api.js';

const defaultView = () =>
  typeof window !== 'undefined' && window.innerWidth >= 900 ? 'map' : 'places';

export default function Explore() {
  const [view, setView] = useState(defaultView);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getExplorePlaces()
      .then(setPlaces)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      <Nav />

      <section className="hero">
        <div className="container">
          <p className="hero-kicker">Explore</p>
          <h1 className="hero-title feed-title">Discover travelers through places</h1>
          <p className="explore-sub muted">
            Every public moment on Travelz, from every traveler — browse the world and see
            who's been where.
          </p>
        </div>
      </section>

      <div className="view-toggle-wrap">
        <div className="view-toggle" role="tablist" aria-label="Choose view">
          <button
            role="tab"
            aria-selected={view === 'places'}
            className={`view-toggle-btn ${view === 'places' ? 'active' : ''}`}
            onClick={() => setView('places')}
          >
            <GlobeIcon width={18} height={18} /> Places
          </button>
          <button
            role="tab"
            aria-selected={view === 'map'}
            className={`view-toggle-btn ${view === 'map' ? 'active' : ''}`}
            onClick={() => setView('map')}
          >
            <MapIcon width={18} height={18} /> Map
          </button>
        </div>
      </div>

      <main className="home-main">
        {error && <p className="container error-banner">Couldn't load places: {error}</p>}
        {view === 'map' ? (
          <MapView explore />
        ) : loading ? (
          <div className="container feed-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card-skeleton" />
            ))}
          </div>
        ) : places.length ? (
          <div className="container feed-grid">
            {places.map((p) => (
              <DestinationCard key={p.placeName} place={p} />
            ))}
          </div>
        ) : (
          <div className="container empty-state">
            <h2>No public places yet.</h2>
            <p className="muted">Once travelers add public moments, they'll show up here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
