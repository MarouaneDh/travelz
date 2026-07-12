import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

/** POST /api/auth/register — create a traveler account. */
router.post('/register', async (req, res) => {
  const { username, email, password, displayName } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }
  if (!/^[a-z0-9_]{3,24}$/i.test(username)) {
    return res
      .status(400)
      .json({ error: 'Username must be 3–24 chars: letters, numbers, underscore' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const handle = username.toLowerCase();
  const mail = email.toLowerCase();
  const clash = await User.findOne({ $or: [{ username: handle }, { email: mail }] });
  if (clash) {
    const which = clash.username === handle ? 'Username' : 'Email';
    return res.status(409).json({ error: `${which} is already taken` });
  }

  const user = await User.create({
    username: handle,
    email: mail,
    passwordHash: await bcrypt.hash(password, 10),
    displayName: displayName?.trim() || '',
    role: 'traveler',
  });

  res.status(201).json({ token: signToken(user), user: user.toPublic() });
});

/** POST /api/auth/login — sign in with username OR email + password. */
router.post('/login', async (req, res) => {
  const { identifier, username, password } = req.body || {};
  const id = (identifier || username || '').toLowerCase().trim();
  if (!id || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const user = await User.findOne({ $or: [{ username: id }, { email: id }] });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ token: signToken(user), user: user.toPublic() });
});

/** GET /api/auth/me — current user from token. */
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: user.toPublic() });
});

export default router;
