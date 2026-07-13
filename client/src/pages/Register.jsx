import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';

export default function Register() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { token, user } = await api.register(form);
      signIn(token, user);
      navigate('/onboarding'); // cold-start: pin a few places first
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <Nav />
      <div className="auth-wrap">
        <form className="auth-card" onSubmit={submit}>
          <h1 className="auth-title">Start your map</h1>
          <p className="muted">Join Travelz and pin the places you've been.</p>

          <label htmlFor="dn">Display name</label>
          <input id="dn" value={form.displayName} onChange={set('displayName')} autoComplete="name" />

          <label htmlFor="un">Username</label>
          <input
            id="un"
            value={form.username}
            onChange={set('username')}
            autoComplete="username"
            placeholder="letters, numbers, underscore"
            required
          />

          <label htmlFor="em">Email</label>
          <input id="em" type="email" value={form.email} onChange={set('email')} autoComplete="email" required />

          <label htmlFor="pw">Password</label>
          <input
            id="pw"
            type="password"
            value={form.password}
            onChange={set('password')}
            autoComplete="new-password"
            placeholder="at least 8 characters"
            required
          />

          {error && <p className="error-banner">{error}</p>}

          <button
            className="btn btn-primary"
            disabled={busy}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {busy ? <span className="spin" /> : 'Create account'}
          </button>

          <p className="auth-alt muted">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </>
  );
}
