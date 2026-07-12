import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import { UploadIcon, CameraIcon, PinIcon } from '../components/Icons.jsx';
import PlacePhotoModal from '../components/PlacePhotoModal.jsx';
import { api, mediaUrl } from '../api.js';

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('tt_token'));

  if (!token) return <Login onDone={setToken} />;
  return <Uploader onLogout={() => { localStorage.removeItem('tt_token'); setToken(null); }} />;
}

function Login({ onDone }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { token } = await api.login(username, password);
      localStorage.setItem('tt_token', token);
      onDone(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Nav />
      <div className="auth-wrap">
        <form className="auth-card" onSubmit={submit}>
          <h1 className="auth-title">Curator sign in</h1>
          <p className="muted">Only the curator can add moments.</p>

          <label htmlFor="u">Username</label>
          <input
            id="u"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="p">Password</label>
          <input
            id="p"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="error-banner">{error}</p>}

          <button className="btn btn-primary" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
            {busy ? <span className="spin" /> : 'Sign in'}
          </button>
        </form>
      </div>
    </>
  );
}

function Uploader({ onLogout }) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null); // { uploading, result, error }
  const [unplaced, setUnplaced] = useState([]);
  const [placing, setPlacing] = useState(null); // photo being placed
  const [justPlaced, setJustPlaced] = useState(null); // toast after placing

  const loadUnplaced = () =>
    api.getUnplaced().then(setUnplaced).catch(() => {});

  useEffect(() => {
    loadUnplaced();
  }, []);

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setStatus({ uploading: true });
    setProgress(0);
    try {
      const result = await api.upload(files, setProgress);
      setStatus({ result });
      loadUnplaced(); // new uploads may include GPS-less photos
    } catch (err) {
      setStatus({ error: err.message });
    }
  };

  const handlePlaced = (result) => {
    setUnplaced((list) => list.filter((p) => p._id !== result.photoId));
    setPlacing(null);
    setJustPlaced(result.moment);
    setTimeout(() => setJustPlaced(null), 4000);
  };

  return (
    <>
      <Nav
        right={
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>
            Sign out
          </button>
        }
      />
      <div className="container uploader">
        <h1 className="uploader-title">Add moments</h1>
        <p className="muted">
          Drop a batch of travel photos. They'll auto-group by place &amp; time — geotagged
          photos land on the map instantly.
        </p>

        <label
          className={`dropzone ${dragging ? 'dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
          <UploadIcon width={40} height={40} />
          <span className="dropzone-title">Drop photos here</span>
          <span className="muted">or click to browse</span>
        </label>

        {status?.uploading && (
          <div className="upload-progress">
            <div className="upload-bar">
              <div className="upload-bar-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <span className="muted">
              {progress < 1 ? `Uploading ${Math.round(progress * 100)}%` : 'Processing photos…'}
            </span>
          </div>
        )}

        {status?.result && (
          <div className="upload-result">
            <CameraIcon width={22} height={22} />
            <div>
              <strong>{status.result.uploaded} photos processed</strong>
              <p className="muted">
                {status.result.placed} placed on the map
                {status.result.needsPlacement > 0 &&
                  ` · ${status.result.needsPlacement} need a location (no GPS)`}
                .
              </p>
              <Link to="/" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                View the map
              </Link>
            </div>
          </div>
        )}

        {status?.error && <p className="error-banner">{status.error}</p>}

        {justPlaced && (
          <div className="place-toast">
            <PinIcon width={18} height={18} /> Placed in{' '}
            <strong>{justPlaced.placeName}</strong>.
          </div>
        )}

        {unplaced.length > 0 && (
          <section className="unplaced">
            <div className="unplaced-head">
              <h2 className="unplaced-title">
                Needs a location
                <span className="unplaced-badge">{unplaced.length}</span>
              </h2>
              <p className="muted">
                These photos had no GPS. Drop each one onto the map to add it.
              </p>
            </div>
            <div className="unplaced-grid">
              {unplaced.map((p) => (
                <button
                  key={p._id}
                  className="unplaced-item"
                  onClick={() => setPlacing(p)}
                  aria-label="Place this photo on the map"
                >
                  <img src={mediaUrl(p.thumbUrl)} alt="Unplaced photo" loading="lazy" />
                  <span className="unplaced-overlay">
                    <PinIcon width={18} height={18} /> Place
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {placing && (
        <PlacePhotoModal
          photo={placing}
          onClose={() => setPlacing(null)}
          onPlaced={handlePlaced}
        />
      )}
    </>
  );
}
