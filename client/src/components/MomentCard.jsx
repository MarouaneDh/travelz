import { Link } from 'react-router-dom';
import { mediaUrl } from '../api.js';
import { PinIcon, CameraIcon } from './Icons.jsx';

const flag = (code) =>
  code
    ? code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    : '';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '';

export default function MomentCard({ moment }) {
  const cover = moment.coverPhoto?.thumbUrl || moment.coverPhoto?.url;
  return (
    <Link to={`/moment/${moment._id}`} className="moment-card">
      <div className="moment-card-media">
        {cover ? (
          <img src={mediaUrl(cover)} alt={moment.title || moment.placeName} loading="lazy" />
        ) : (
          <div className="moment-card-noimg">
            <CameraIcon width={28} height={28} />
          </div>
        )}
        <span className="moment-card-count">
          <CameraIcon width={14} height={14} /> {moment.photoCount}
        </span>
      </div>
      <div className="moment-card-body">
        {moment.owner?.username && (
          <span className="moment-card-author">
            <span className="moment-card-author-avatar">
              {(moment.owner.displayName || moment.owner.username).charAt(0).toUpperCase()}
            </span>
            {moment.owner.displayName || `@${moment.owner.username}`}
          </span>
        )}
        <h3 className="moment-card-title">{moment.title || moment.placeName}</h3>
        <div className="moment-card-meta">
          <span className="moment-card-place">
            <PinIcon width={14} height={14} />
            {moment.city || moment.placeName}{' '}
            <span className="flag">{flag(moment.countryCode)}</span>
          </span>
          <span className="muted">{fmtDate(moment.startAt)}</span>
        </div>
      </div>
    </Link>
  );
}
