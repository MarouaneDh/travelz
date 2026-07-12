import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Reactions from '../components/Reactions.jsx';
import { PinIcon, CalendarIcon, ArrowLeftIcon } from '../components/Icons.jsx';
import Flag from '../components/Flag.jsx';
import { api, mediaUrl } from '../api.js';

const fmtRange = (a, b) => {
  if (!a) return '';
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  const start = new Date(a).toLocaleDateString(undefined, opts);
  if (!b || new Date(a).toDateString() === new Date(b).toDateString()) return start;
  return `${start} – ${new Date(b).toLocaleDateString(undefined, opts)}`;
};

export default function MomentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [moment, setMoment] = useState(null);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.getMoment(id).then(setMoment).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <>
        <Nav />
        <div className="container empty-state">
          <h2>Moment not found</h2>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            Back to map
          </button>
        </div>
      </>
    );
  }

  if (!moment) {
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
    <>
      <Nav />
      <article className="detail container">
        <button className="detail-back" onClick={() => navigate(-1)}>
          <ArrowLeftIcon width={18} height={18} /> Back
        </button>

        <header className="detail-header">
          <h1 className="detail-title">{moment.title || moment.placeName}</h1>
          <div className="detail-meta">
            <span>
              <PinIcon width={16} height={16} /> {moment.placeName} <Flag code={moment.countryCode} />
            </span>
            <span>
              <CalendarIcon width={16} height={16} /> {fmtRange(moment.startAt, moment.endAt)}
            </span>
            {moment.owner?.username && (
              <Link to={`/u/${moment.owner.username}`} className="detail-author">
                by {moment.owner.displayName || `@${moment.owner.username}`}
              </Link>
            )}
          </div>
          {moment.body && <p className="detail-body">{moment.body}</p>}
        </header>

        <Reactions momentId={moment._id} initial={moment.reactions} />

        <div className="gallery">
          {moment.photos.map((p) => (
            <button
              key={p._id}
              className="gallery-item"
              onClick={() => setLightbox(p)}
              aria-label="View photo"
            >
              <img src={mediaUrl(p.thumbUrl)} alt={p.caption || moment.placeName} loading="lazy" />
            </button>
          ))}
        </div>
      </article>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <img src={mediaUrl(lightbox.url)} alt={lightbox.caption || moment.placeName} />
        </div>
      )}
    </>
  );
}
