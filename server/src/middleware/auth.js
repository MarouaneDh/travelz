import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

// A token is only usable if its subject is a real ObjectId. This also makes the
// app self-heal from stale pre-v2 tokens (which stored a username in `sub`).
const validSub = (p) => p && mongoose.isValidObjectId(p.sub);

export function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), username: user.username, role: user.role },
    SECRET,
    { expiresIn: '7d' }
  );
}

function readToken(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

/** Any signed-in user (curator or traveler). Sets req.user = { sub, username, role }. */
export function requireAuth(req, res, next) {
  const payload = readToken(req);
  if (!validSub(payload)) return res.status(401).json({ error: 'Not authenticated' });
  req.user = payload;
  next();
}

/** Curator (owner) only. */
export function requireCurator(req, res, next) {
  const payload = readToken(req);
  if (!validSub(payload)) return res.status(401).json({ error: 'Not authenticated' });
  if (payload.role !== 'curator') {
    return res.status(403).json({ error: 'Curator only' });
  }
  req.user = payload;
  next();
}

/** Optional auth: populates req.user if a valid token is present, else continues. */
export function optionalAuth(req, res, next) {
  const payload = readToken(req);
  req.user = validSub(payload) ? payload : null;
  next();
}
