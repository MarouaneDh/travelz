import { Link } from 'react-router-dom';
import { GlobeIcon } from './Icons.jsx';

export default function Nav({ right }) {
  return (
    <header className="nav">
      <Link to="/" className="nav-brand" aria-label="Travelz home">
        <GlobeIcon width={22} height={22} />
        <span>
          Travel<span className="nav-brand-accent">z</span>
        </span>
      </Link>
      <div className="nav-right">{right}</div>
    </header>
  );
}
