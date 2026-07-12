import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Feed from '../components/Feed.jsx';
import MapView from '../components/MapView.jsx';
import Passport from '../components/Passport.jsx';
import { MapIcon, ListIcon, CameraIcon } from '../components/Icons.jsx';
import { api } from '../api.js';

// Adaptive default (idea #4 + #5): feed-first on phones, map-first on desktop.
const defaultView = () =>
  typeof window !== 'undefined' && window.innerWidth >= 900 ? 'map' : 'feed';

export default function Home() {
  const [view, setView] = useState(defaultView);
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getMoments()
      .then((data) => setMoments(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      <Nav
        right={
          <Link to="/admin" className="btn btn-ghost btn-sm" aria-label="Curator area">
            <CameraIcon width={18} height={18} />
            <span className="hide-mobile">Add moments</span>
          </Link>
        }
      />

      <section className="hero">
        <div className="container">
          <p className="hero-kicker">A living map of everywhere I've wandered</p>
          <h1 className="hero-title">
            Every photo is a place.
            <br />
            Every place is a story.
          </h1>
          <Passport />
        </div>
      </section>

      <div className="view-toggle-wrap">
        <div className="view-toggle" role="tablist" aria-label="Choose view">
          <button
            role="tab"
            aria-selected={view === 'feed'}
            className={`view-toggle-btn ${view === 'feed' ? 'active' : ''}`}
            onClick={() => setView('feed')}
          >
            <ListIcon width={18} height={18} /> Feed
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
        {error && <p className="container error-banner">Couldn't load moments: {error}</p>}

        {view === 'map' ? (
          <MapView />
        ) : (
          <Feed moments={moments} loading={loading} />
        )}
      </main>
    </div>
  );
}
