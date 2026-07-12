import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';

export default function FollowButton({ username, initialFollowing, onCountChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  // Not signed in → send them to login.
  if (!user) {
    return (
      <button className="btn btn-primary" onClick={() => navigate('/login')}>
        Follow
      </button>
    );
  }

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = following ? await api.unfollow(username) : await api.follow(username);
      setFollowing(res.isFollowing);
      onCountChange?.(res.followerCount);
    } catch {
      // no-op; leave state as-is
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      className={`btn ${following ? 'btn-ghost' : 'btn-primary'}`}
      onClick={toggle}
      disabled={busy}
    >
      {busy ? <span className="spin" /> : following ? 'Following' : 'Follow'}
    </button>
  );
}
