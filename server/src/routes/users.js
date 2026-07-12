import { Router } from 'express';
import { User } from '../models/User.js';
import { feedFor, geojsonFor, passportFor } from '../services/momentQueries.js';

const router = Router();

async function findUser(username) {
  return User.findOne({ username: (username || '').toLowerCase() });
}

/** GET /api/users/:username — public profile + travel stats. */
router.get('/:username', async (req, res) => {
  const user = await findUser(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const passport = await passportFor(user._id);
  res.json({ ...user.toPublic(), passport });
});

/** GET /api/users/:username/moments — that user's feed. */
router.get('/:username/moments', async (req, res) => {
  const user = await findUser(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(await feedFor(user._id));
});

/** GET /api/users/:username/geojson — that user's map. */
router.get('/:username/geojson', async (req, res) => {
  const user = await findUser(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(await geojsonFor(user._id));
});

/** GET /api/users/:username/passport — that user's passport. */
router.get('/:username/passport', async (req, res) => {
  const user = await findUser(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(await passportFor(user._id));
});

export default router;
