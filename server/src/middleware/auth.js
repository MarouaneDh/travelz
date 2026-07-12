import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

export function signToken(username) {
  return jwt.sign({ sub: username, role: 'curator' }, SECRET, { expiresIn: '7d' });
}

/** Guards curator-only routes (uploading, editing). */
export function requireCurator(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, SECRET);
    if (payload.role !== 'curator') throw new Error('wrong role');
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}
