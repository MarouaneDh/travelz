import { Link } from 'react-router-dom';
import { mediaUrl } from '../api.js';
import { PinIcon, CameraIcon } from './Icons.jsx';
import Flag from './Flag.jsx';

export default function DestinationCard({ place }) {
  return (
    <Link to={`/place/${encodeURIComponent(place.placeName)}`} className="moment-card">
      <div className="moment-card-media">
        {place.coverThumb ? (
          <img src={mediaUrl(place.coverThumb)} alt={place.placeName} loading="lazy" />
        ) : (
          <div className="moment-card-noimg">
            <CameraIcon width={28} height={28} />
          </div>
        )}
        <span className="moment-card-count">
          <CameraIcon width={14} height={14} /> {place.momentCount}
        </span>
      </div>
      <div className="moment-card-body">
        <h3 className="moment-card-title">
          {place.city || place.placeName} <Flag code={place.countryCode} />
        </h3>
        <div className="moment-card-meta">
          <span className="moment-card-place">
            <PinIcon width={14} height={14} />
            {place.country || place.placeName}
          </span>
          <span className="muted">
            {place.travelerCount} {place.travelerCount === 1 ? 'traveler' : 'travelers'}
          </span>
        </div>
      </div>
    </Link>
  );
}
