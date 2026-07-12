import { Navigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import MapExperience from '../components/MapExperience.jsx';
import { useAuth } from '../auth.jsx';

export default function FeedPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const header = (
    <section className="hero feed-hero">
      <div className="container">
        <p className="hero-kicker">Following</p>
        <h1 className="hero-title feed-title">Where your people have been</h1>
      </div>
    </section>
  );

  return (
    <div className="home">
      <Nav />
      <MapExperience feed header={header} />
    </div>
  );
}
