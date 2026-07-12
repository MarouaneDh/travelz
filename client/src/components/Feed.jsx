import { Link } from 'react-router-dom';
import MomentCard from './MomentCard.jsx';

export default function Feed({ moments, loading, feedMode = false }) {
  if (loading) {
    return (
      <div className="container feed-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card-skeleton" />
        ))}
      </div>
    );
  }

  if (!moments.length) {
    return feedMode ? (
      <div className="container empty-state">
        <h2>Your feed is quiet.</h2>
        <p className="muted">
          Follow some travelers and their new moments will show up here. Not sure where
          to start? Explore the <Link to="/">curator's map</Link>.
        </p>
      </div>
    ) : (
      <div className="container empty-state">
        <h2>The map is waiting for its first pin.</h2>
        <p className="muted">
          Head to <strong>Add moments</strong> and drop in a batch of travel photos —
          they'll place themselves.
        </p>
      </div>
    );
  }

  return (
    <div className="container feed-grid">
      {moments.map((m) => (
        <MomentCard key={m._id} moment={m} />
      ))}
    </div>
  );
}
