import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { token, user } = await api.login(identifier, password);
      signIn(token, user);
      navigate(user.role === 'curator' ? '/' : `/u/${user.username}`);
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
          <h1 className="auth-title">Welcome back</h1>
          <p className="muted">Sign in to your Travelz map.</p>

          <label htmlFor="id">Username or email</label>
          <input
            id="id"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
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

          <button
            className="btn btn-primary"
            disabled={busy}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {busy ? <span className="spin" /> : 'Sign in'}
          </button>

          <p className="auth-alt muted">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </>
  );
}
