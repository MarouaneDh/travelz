import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { CameraIcon } from './Icons.jsx';

export default function AccountMenu() {
  const { user, signOut, isCurator } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="nav-right">
        <Link to="/login" className="btn btn-ghost btn-sm">
          Sign in
        </Link>
        <Link to="/register" className="btn btn-primary btn-sm">
          Join
        </Link>
      </div>
    );
  }

  const myMap = isCurator ? '/' : `/u/${user.username}`;
  const initial = (user.displayName || user.username).charAt(0).toUpperCase();

  return (
    <div className="nav-right">
      <Link to="/studio" className="btn btn-ghost btn-sm" aria-label="Add moments">
        <CameraIcon width={18} height={18} />
        <span className="hide-mobile">Add moments</span>
      </Link>
      <Link to={myMap} className="account-chip" aria-label="My profile">
        <span className="account-avatar">{initial}</span>
        <span className="hide-mobile">{user.displayName || user.username}</span>
      </Link>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => {
          signOut();
          navigate('/');
        }}
      >
        Sign out
      </button>
    </div>
  );
}
