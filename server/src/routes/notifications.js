import { Router } from 'express';
import { Notification } from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/** GET /api/notifications — recent notifications + unread count. */
router.get('/', requireAuth, async (req, res) => {
  const [items, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('actor', 'username displayName')
      .populate('moment', 'placeName countryCode')
      .lean(),
    Notification.countDocuments({ recipient: req.user.sub, read: false }),
  ]);
  res.json({ items, unreadCount });
});

/** GET /api/notifications/unread-count — just the badge number. */
router.get('/unread-count', requireAuth, async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user.sub,
    read: false,
  });
  res.json({ unreadCount });
});

/** POST /api/notifications/read — mark all as read. */
router.post('/read', requireAuth, async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.sub, read: false },
    { $set: { read: true } }
  );
  res.json({ ok: true });
});

export default router;
