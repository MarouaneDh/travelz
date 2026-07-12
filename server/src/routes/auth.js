import { Router } from 'express';
import { signToken } from '../middleware/auth.js';

const router = Router();

/**
 * Simple curator login for v1 (single owner). Credentials live in .env.
 * v2 will introduce real Traveler accounts.
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const okUser = username === process.env.ADMIN_USERNAME;
  const okPass = password === process.env.ADMIN_PASSWORD;
  if (!okUser || !okPass) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken(username);
  res.json({ token, username, role: 'curator' });
});

export default router;
