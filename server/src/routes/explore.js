import { Router } from 'express';
import { Moment } from '../models/Moment.js';

const router = Router();

/**
 * GET /api/explore/geojson — every public moment from every traveler, as pins
 * for the global explore map.
 */
router.get('/geojson', async (req, res) => {
  const moments = await Moment.find({
    visibility: 'public',
    'location.coordinates.0': { $exists: true },
  })
    .populate('coverPhoto', 'thumbUrl')
    .populate('owner', 'username displayName')
    .lean();

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

/**
 * GET /api/explore/places — destinations, grouped across ALL travelers, with a
 * moment count, how many different travelers have been, and a cover photo.
 * This is the "discover by place" grid.
 */
router.get('/places', async (req, res) => {
  const rows = await Moment.aggregate([
    { $match: { visibility: 'public', placeName: { $ne: '' } } },
    { $sort: { startAt: -1 } },
    {
      $group: {
        _id: '$placeName',
        city: { $first: '$city' },
        country: { $first: '$country' },
        countryCode: { $first: '$countryCode' },
        coordinates: { $first: '$location.coordinates' },
        coverPhoto: { $first: '$coverPhoto' },
        momentCount: { $sum: 1 },
        travelers: { $addToSet: '$owner' },
      },
    },
    {
      $lookup: {
        from: 'photos',
        localField: 'coverPhoto',
        foreignField: '_id',
        as: 'cover',
      },
    },
    {
      $project: {
        _id: 0,
        placeName: '$_id',
        city: 1,
        country: 1,
        countryCode: 1,
        coordinates: 1,
        momentCount: 1,
        travelerCount: { $size: '$travelers' },
        coverThumb: { $arrayElemAt: ['$cover.thumbUrl', 0] },
      },
    },
    { $sort: { travelerCount: -1, momentCount: -1, placeName: 1 } },
    { $limit: 60 },
  ]);

  res.json(rows);
});

/**
 * GET /api/explore/place?name=<placeName> — every public moment at one place,
 * from all travelers, plus the list of who's been there.
 */
router.get('/place', async (req, res) => {
  const name = (req.query.name || '').trim();
  if (!name) return res.status(400).json({ error: 'A place name is required' });

  const moments = await Moment.find({ placeName: name, visibility: 'public' })
    .sort({ startAt: -1 })
    .populate('coverPhoto', 'thumbUrl url width height')
    .populate('owner', 'username displayName')
    .lean();

  if (!moments.length) return res.status(404).json({ error: 'No moments at this place' });

  // Distinct travelers who've been here.
  const seen = new Map();
  for (const m of moments) {
    if (m.owner?.username && !seen.has(m.owner.username)) {
      seen.set(m.owner.username, {
        username: m.owner.username,
        displayName: m.owner.displayName || m.owner.username,
      });
    }
  }

  res.json({
    placeName: name,
    country: moments[0].country,
    countryCode: moments[0].countryCode,
    momentCount: moments.length,
    travelers: [...seen.values()],
    moments,
  });
});

export default router;
