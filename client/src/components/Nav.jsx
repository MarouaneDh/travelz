import { Link } from 'react-router-dom';
import { GlobeIcon } from './Icons.jsx';
import AccountMenu from './AccountMenu.jsx';

export default function Nav({ showAccount = true }) {
  return (
    <header className="nav">
      <Link to="/" className="nav-brand" aria-label="Travelz home">
        <GlobeIcon width={22} height={22} />
        <span>
          Travel<span className="nav-brand-accent">z</span>
        </span>
      </Link>
      {showAccount && <AccountMenu />}
    </header>
  );
}
