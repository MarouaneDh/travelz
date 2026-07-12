import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import MomentCard from '../components/MomentCard.jsx';
import { PinIcon } from '../components/Icons.jsx';
import Flag from '../components/Flag.jsx';
import { api } from '../api.js';

export default function Place() {
  const { name } = useParams();
  const placeName = decodeURIComponent(name);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(null);
    setError(null);
    api.getExplorePlace(placeName).then(setData).catch((e) => setError(e.message));
  }, [placeName]);

  if (error) {
    return (
      <>
        <Nav />
        <div className="container empty-state">
          <h2>Nothing here yet</h2>
          <p className="muted">No public moments at {placeName}.</p>
          <Link to="/explore" className="btn btn-ghost" style={{ marginTop: '1rem' }}>
            Back to Explore
          </Link>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Nav />
        <div className="container detail-loading">
          <div className="spin" style={{ borderTopColor: 'var(--sky)' }} />
        </div>
      </>
    );
  }

  return (
    <div className="home">
      <Nav />
      <section className="hero profile-hero">
        <div className="container">
          <p className="hero-kicker">
            <PinIcon width={14} height={14} /> A place on Travelz
          </p>
          <h1 className="profile-name">
            {data.placeName} <Flag code={data.countryCode} />
          </h1>
          <div className="profile-stats">
            <span>
              <strong>{data.momentCount}</strong>{' '}
              {data.momentCount === 1 ? 'moment' : 'moments'}
            </span>
            <span>
              <strong>{data.travelers.length}</strong>{' '}
              {data.travelers.length === 1 ? 'traveler' : 'travelers'}
            </span>
          </div>

          {data.travelers.length > 0 && (
            <div className="place-travelers">
              {data.travelers.map((t) => (
                <Link key={t.username} to={`/u/${t.username}`} className="place-traveler">
                  <span className="account-avatar">
                    {(t.displayName || t.username).charAt(0).toUpperCase()}
                  </span>
                  {t.displayName}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <main className="home-main">
        <div className="container feed-grid">
          {data.moments.map((m) => (
            <MomentCard key={m._id} moment={m} />
          ))}
        </div>
      </main>
    </div>
  );
}
