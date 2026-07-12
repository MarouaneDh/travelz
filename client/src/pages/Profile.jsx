import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import MapExperience from '../components/MapExperience.jsx';
import Passport from '../components/Passport.jsx';
import FollowButton from '../components/FollowButton.jsx';
import { api } from '../api.js';

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setProfile(null);
    setError(null);
    api.getUser(username).then(setProfile).catch((e) => setError(e.message));
  }, [username]);

  if (error) {
    return (
      <>
        <Nav />
        <div className="container empty-state">
          <h2>No traveler named @{username}</h2>
          <p className="muted">This profile doesn't exist yet.</p>
        </div>
      </>
    );
  }

  const header = (
    <section className="hero profile-hero">
      <div className="container">
        <div className="profile-id">
          <span className="profile-avatar">
            {(profile?.displayName || username).charAt(0).toUpperCase()}
          </span>
          <div className="profile-id-main">
            <h1 className="profile-name">{profile?.displayName || username}</h1>
            <p className="profile-handle">
              @{username}
              {profile?.role === 'curator' && <span className="profile-badge">Curator</span>}
            </p>
          </div>
          {profile && !profile.isSelf && (
            <FollowButton
              username={username}
              initialFollowing={profile.isFollowing}
              onCountChange={(n) =>
                setProfile((p) => (p ? { ...p, followerCount: n } : p))
              }
            />
          )}
        </div>

        {profile && (
          <div className="profile-stats">
            <span>
              <strong>{profile.followerCount}</strong> followers
            </span>
            <span>
              <strong>{profile.followingCount}</strong> following
            </span>
          </div>
        )}

        {profile?.bio && <p className="profile-bio">{profile.bio}</p>}
        <Passport username={username} />
      </div>
    </section>
  );

  return (
    <div className="home">
      <Nav />
      <MapExperience username={username} header={header} />
    </div>
  );
}
