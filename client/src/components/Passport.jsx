import { useEffect, useState } from 'react';
import { api } from '../api.js';

// ISO alpha-2 → flag emoji (content, not a UI icon — allowed).
const flag = (code) =>
  code
    ? code
        .toUpperCase()
        .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    : '';

export default function Passport({ username = null }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = username ? api.getUserPassport(username) : api.getPassport();
    load.then(setData).catch(() => {});
  }, [username]);

  if (!data || data.countryCount === 0) return null;

  return (
    <div className="passport" aria-label="Travel stats">
      <div className="passport-stat">
        <span className="passport-num">{data.countryCount}</span>
        <span className="passport-label">countries</span>
      </div>
      <div className="passport-divider" />
      <div className="passport-stat">
        <span className="passport-num">{data.percentOfWorld}%</span>
        <span className="passport-label">of the world</span>
      </div>
      <div className="passport-flags" aria-hidden="true">
        {data.countries.slice(0, 12).map((c) => (
          <span key={c.code} className="flag" title={c.country}>
            {flag(c.code)}
          </span>
        ))}
      </div>
    </div>
  );
}
