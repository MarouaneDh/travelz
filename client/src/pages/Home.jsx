import Nav from '../components/Nav.jsx';
import MapExperience from '../components/MapExperience.jsx';
import Passport from '../components/Passport.jsx';

export default function Home() {
  const header = (
    <section className="hero">
      <div className="container">
        <p className="hero-kicker">A living map of everywhere I've wandered</p>
        <h1 className="hero-title">
          Every photo is a place.
          <br />
          Every place is a story.
        </h1>
        <Passport />
      </div>
    </section>
  );

  return (
    <div className="home">
      <Nav />
      <MapExperience username={null} header={header} />
    </div>
  );
}
