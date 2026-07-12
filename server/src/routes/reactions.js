import { Router } from 'express';
import { Moment } from '../models/Moment.js';

const router = Router();

// Reaction confetti — no account needed (pure showcase for logged-out visitors).
const ALLOWED = ['😍', '🤤', '🧳', '🔥', '👏'];

/**
 * POST /api/moments/:id/react  { emoji }
 * Increments the reaction counter on a moment. Deliberately account-free.
 */
router.post('/:id/react', async (req, res) => {
  const { emoji } = req.body || {};
  if (!ALLOWED.includes(emoji)) {
    return res.status(400).json({ error: 'Unsupported reaction' });
  }
  const moment = await Moment.findOne({ _id: req.params.id, visibility: 'public' });
  if (!moment) return res.status(404).json({ error: 'Moment not found' });

  const current = moment.reactions.get(emoji) || 0;
  moment.reactions.set(emoji, current + 1);
  await moment.save();

  res.json({ reactions: Object.fromEntries(moment.reactions) });
});

export default router;
