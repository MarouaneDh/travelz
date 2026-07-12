import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Flag from './Flag.jsx';

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
      <div className="passport-flags">
        {data.countries.slice(0, 12).map((c) => (
          <Flag key={c.code} code={c.code} title={c.country} />
        ))}
      </div>
    </div>
  );
}
