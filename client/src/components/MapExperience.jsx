import { useEffect, useState } from 'react';
import Feed from './Feed.jsx';
import MapView from './MapView.jsx';
import { MapIcon, ListIcon } from './Icons.jsx';
import { api } from '../api.js';

// Adaptive default (idea #4 + #5): feed-first on phones, map-first on desktop.
const defaultView = () =>
  typeof window !== 'undefined' && window.innerWidth >= 900 ? 'map' : 'feed';

/**
 * The shared map/feed experience.
 *  - `feed`            → the friend feed (moments from people you follow)
 *  - `username` = null → the curator's brand home
 *  - `username` set    → that traveler's own map
 * `header` is the hero above it.
 */
export default function MapExperience({ username = null, feed = false, header }) {
  const [view, setView] = useState(defaultView);
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const load = feed
      ? api.getFeed()
      : username
      ? api.getUserMoments(username)
      : api.getMoments();
    load
      .then(setMoments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username, feed]);

  return (
    <>
      {header}

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
          <MapView username={username} feed={feed} />
        ) : (
          <Feed moments={moments} loading={loading} feedMode={feed} />
        )}
      </main>
    </>
  );
}
