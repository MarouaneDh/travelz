import { Router } from 'express';
import { User } from '../models/User.js';
import { Follow } from '../models/Follow.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { feedFor, geojsonFor, passportFor } from '../services/momentQueries.js';

const router = Router();

async function findUser(username) {
  return User.findOne({ username: (username || '').toLowerCase() });
}

/** GET /api/users/:username — public profile + stats + follow relationship. */
router.get('/:username', optionalAuth, async (req, res) => {
  const user = await findUser(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const [passport, followers, following, isFollowing] = await Promise.all([
    passportFor(user._id),
    Follow.countDocuments({ following: user._id }),
    Follow.countDocuments({ follower: user._id }),
    req.user
      ? Follow.exists({ follower: req.user.sub, following: user._id })
      : null,
  ]);

  res.json({
    ...user.toPublic(),
    passport,
    followerCount: followers,
    followingCount: following,
    isFollowing: !!isFollowing,
    isSelf: req.user?.sub === String(user._id),
  });
});

/** POST /api/users/:username/follow — follow this user. */
router.post('/:username/follow', requireAuth, async (req, res) => {
  const target = await findUser(req.params.username);
  if (!target) return res.status(404).json({ error: 'User not found' });
  if (String(target._id) === req.user.sub) {
    return res.status(400).json({ error: "You can't follow yourself" });
  }
  // Idempotent thanks to the unique index; ignore duplicate-key errors.
  try {
    await Follow.create({ follower: req.user.sub, following: target._id });
  } catch (err) {
    if (err.code !== 11000) throw err;
  }
  const followerCount = await Follow.countDocuments({ following: target._id });
  res.json({ isFollowing: true, followerCount });
});

/** DELETE /api/users/:username/follow — unfollow this user. */
router.delete('/:username/follow', requireAuth, async (req, res) => {
  const target = await findUser(req.params.username);
  if (!target) return res.status(404).json({ error: 'User not found' });
  await Follow.deleteOne({ follower: req.user.sub, following: target._id });
  const followerCount = await Follow.countDocuments({ following: target._id });
  res.json({ isFollowing: false, followerCount });
});

/** GET /api/users/:username/followers — who follows this user. */
router.get('/:username/followers', async (req, res) => {
  const user = await findUser(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const rows = await Follow.find({ following: user._id })
    .populate('follower', 'username displayName role')
    .lean();
  res.json(rows.map((r) => r.follower).filter(Boolean));
});

/** GET /api/users/:username/following — who this user follows. */
router.get('/:username/following', async (req, res) => {
  const user = await findUser(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const rows = await Follow.find({ follower: user._id })
    .populate('following', 'username displayName role')
    .lean();
  res.json(rows.map((r) => r.following).filter(Boolean));
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
