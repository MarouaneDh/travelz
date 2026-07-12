import { Router } from 'express';
import { Photo } from '../models/Photo.js';
import { Moment } from '../models/Moment.js';

const router = Router();

// Only public content is exposed to visitors in v1.
const PUBLIC = { visibility: 'public' };

/**
 * GET /api/moments  → feed (newest first), lightweight cards for the list view.
 */
router.get('/', async (req, res) => {
  const moments = await Moment.find(PUBLIC)
    .sort({ startAt: -1 })
    .populate('coverPhoto', 'thumbUrl url width height')
    .lean();
  res.json(moments);
});

/**
 * GET /api/moments/geojson  → FeatureCollection for the map (clustered pins).
 */
router.get('/geojson', async (req, res) => {
  const moments = await Moment.find({ ...PUBLIC, 'location.coordinates.0': { $exists: true } })
    .populate('coverPhoto', 'thumbUrl')
    .lean();

  const features = moments.map((m) => ({
    type: 'Feature',
    geometry: m.location,
    properties: {
      id: String(m._id),
      title: m.title || m.placeName,
      placeName: m.placeName,
      country: m.country,
      countryCode: m.countryCode,
      photoCount: m.photoCount,
      thumbUrl: m.coverPhoto?.thumbUrl || null,
    },
  }));

  res.json({ type: 'FeatureCollection', features });
});

/**
 * GET /api/moments/passport  → aggregate stats (self-stamping passport / %-of-world).
 */
router.get('/passport', async (req, res) => {
  const rows = await Moment.aggregate([
    { $match: { visibility: 'public', countryCode: { $ne: '' } } },
    {
      $group: {
        _id: '$countryCode',
        country: { $first: '$country' },
        moments: { $sum: 1 },
      },
    },
    { $sort: { country: 1 } },
  ]);

  const WORLD_COUNTRIES = 195;
  res.json({
    countryCount: rows.length,
    percentOfWorld: Math.round((rows.length / WORLD_COUNTRIES) * 1000) / 10,
    countries: rows.map((r) => ({
      code: r._id,
      country: r.country,
      moments: r.moments,
    })),
  });
});

/**
 * GET /api/moments/:id  → full moment with all its photos.
 */
router.get('/:id', async (req, res) => {
  const moment = await Moment.findOne({ _id: req.params.id, ...PUBLIC })
    .populate('coverPhoto', 'thumbUrl url')
    .lean();
  if (!moment) return res.status(404).json({ error: 'Moment not found' });

  const photos = await Photo.find({ moment: moment._id, visibility: 'public' })
    .sort({ takenAt: 1 })
    .select('url thumbUrl width height caption takenAt')
    .lean();

  res.json({ ...moment, photos });
});

export default router;
