import { Router } from 'express';
import { Follow } from '../models/Follow.js';
import { Moment } from '../models/Moment.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

async function followingIds(userId) {
  const rows = await Follow.find({ follower: userId }).select('following').lean();
  return rows.map((r) => r.following);
}

/**
 * GET /api/feed — the friend feed (idea #17): a chronological stream of new
 * moments from everyone the current user follows.
 */
router.get('/', requireAuth, async (req, res) => {
  const ids = await followingIds(req.user.sub);
  if (!ids.length) return res.json([]);

  const moments = await Moment.find({ owner: { $in: ids }, visibility: 'public' })
    .sort({ startAt: -1 })
    .limit(60)
    .populate('coverPhoto', 'thumbUrl url width height')
    .populate('owner', 'username displayName')
    .lean();

  res.json(moments);
});

/**
 * GET /api/feed/geojson — a blended map of pins from everyone you follow.
 */
router.get('/geojson', requireAuth, async (req, res) => {
  const ids = await followingIds(req.user.sub);
  const moments = ids.length
    ? await Moment.find({
        owner: { $in: ids },
        visibility: 'public',
        'location.coordinates.0': { $exists: true },
      })
        .populate('coverPhoto', 'thumbUrl')
        .populate('owner', 'username displayName')
        .lean()
    : [];

  res.json({
    type: 'FeatureCollection',
    features: moments.map((m) => ({
      type: 'Feature',
      geometry: m.location,
      properties: {
        id: String(m._id),
        title: m.title || m.placeName,
        placeName: m.placeName,
        countryCode: m.countryCode,
        photoCount: m.photoCount,
        thumbUrl: m.coverPhoto?.thumbUrl || null,
        author: m.owner?.displayName || m.owner?.username || '',
      },
    })),
  });
});

export default router;
