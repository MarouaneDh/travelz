import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';
import { CameraIcon, ListIcon, BellIcon } from './Icons.jsx';

export default function AccountMenu() {
  const { user, signOut, isCurator } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  // Poll the unread notification count, and refresh instantly when the
  // notifications page marks them read (via a window event).
  useEffect(() => {
    if (!user) return;
    let alive = true;
    const refresh = () =>
      api
        .getUnreadCount()
        .then((d) => alive && setUnread(d.unreadCount))
        .catch(() => {});
    refresh();
    const id = setInterval(refresh, 30000);
    const onRead = () => setUnread(0);
    window.addEventListener('tt-notifs-read', onRead);
    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener('tt-notifs-read', onRead);
    };
  }, [user]);

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
      <Link
        to="/notifications"
        className="notif-bell"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
      >
        <BellIcon width={20} height={20} />
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </Link>
      <Link to="/feed" className="btn btn-ghost btn-sm" aria-label="Following feed">
        <ListIcon width={18} height={18} />
        <span className="hide-mobile">Following</span>
      </Link>
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
