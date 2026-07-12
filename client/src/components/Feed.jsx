import MomentCard from './MomentCard.jsx';

export default function Feed({ moments, loading }) {
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
    return (
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
