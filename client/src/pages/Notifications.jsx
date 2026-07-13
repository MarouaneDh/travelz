import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Flag from '../components/Flag.jsx';
import { UserPlusIcon, PinIcon } from '../components/Icons.jsx';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (!user) return;
    api
      .getNotifications()
      .then((d) => {
        setItems(d.items);
        // Mark read once loaded, and tell the nav bell to clear its badge.
        if (d.unreadCount > 0) {
          api.markNotificationsRead().catch(() => {});
          window.dispatchEvent(new Event('tt-notifs-read'));
        }
      })
      .catch(() => setItems([]));
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Nav />
      <div className="container notif-page">
        <h1 className="notif-title">Notifications</h1>

        {items === null ? (
          <div className="notif-list">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="notif-skeleton" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h2>You're all caught up.</h2>
            <p className="muted">
              New followers and moments from people you follow will show up here.
            </p>
          </div>
        ) : (
          <div className="notif-list">
            {items.map((n) => (
              <NotificationRow key={n._id} n={n} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function NotificationRow({ n }) {
  const actor = n.actor || {};
  const name = actor.displayName || actor.username || 'Someone';
  const initial = name.charAt(0).toUpperCase();

  const inner = (
    <>
      <span className="notif-avatar">{initial}</span>
      <span className="notif-icon">
        {n.type === 'follow' ? (
          <UserPlusIcon width={16} height={16} />
        ) : (
          <PinIcon width={16} height={16} />
        )}
      </span>
      <span className="notif-text">
        {n.type === 'follow' ? (
          <>
            <strong>{name}</strong> started following you
          </>
        ) : (
          <>
            <strong>{name}</strong> added a moment in{' '}
            <strong>{n.moment?.placeName || 'a new place'}</strong>{' '}
            {n.moment?.countryCode && <Flag code={n.moment.countryCode} />}
          </>
        )}
        <span className="notif-time">{timeAgo(n.createdAt)}</span>
      </span>
    </>
  );

  const to =
    n.type === 'follow'
      ? `/u/${actor.username}`
      : n.moment
      ? `/moment/${n.moment._id}`
      : '#';

  return (
    <Link to={to} className={`notif-row ${n.read ? '' : 'unread'}`}>
      {inner}
    </Link>
  );
}
