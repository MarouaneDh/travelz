import { Router } from 'express';
import { getCurator } from '../services/bootstrap.js';
import { Moment } from '../models/Moment.js';
import { requireAuth } from '../middleware/auth.js';
import { reverseGeocode } from '../services/geocode.js';
import { findMatchingMoment } from '../services/grouping.js';
import {
  feedFor,
  geojsonFor,
  passportFor,
  momentById,
} from '../services/momentQueries.js';

const router = Router();

// The bare /api/moments endpoints represent the curator's brand home ("/").
async function curatorId() {
  const c = await getCurator();
  return c?._id;
}

router.get('/', async (req, res) => res.json(await feedFor(await curatorId())));

router.get('/geojson', async (req, res) => res.json(await geojsonFor(await curatorId())));

router.get('/passport', async (req, res) => res.json(await passportFor(await curatorId())));

/**
 * POST /api/moments/pin  { lat, lng }  (auth)
 * Cold-start onboarding (#22): drop a "been here" pin without photos, so a new
 * traveler's map isn't empty. Photos backfill the moment later. Dedupes against
 * a nearby existing moment so pinning the same place twice is a no-op.
 */
router.post('/pin', requireAuth, async (req, res) => {
  const { lat, lng } = req.body || {};
  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return res.status(400).json({ error: 'Valid lat/lng required' });
  }

  const owner = req.user.sub;
  const existing = await findMatchingMoment({ owner, lat, lng });
  if (existing) {
    return res.json({
      existed: true,
      moment: {
        id: String(existing._id),
        placeName: existing.placeName,
        countryCode: existing.countryCode,
        coordinates: existing.location?.coordinates,
      },
    });
  }

  const geo = await reverseGeocode(lat, lng);
  const now = new Date();
  const moment = await Moment.create({
    owner,
    placeName: geo?.placeName || 'Unknown place',
    city: geo?.city || '',
    country: geo?.country || '',
    countryCode: geo?.countryCode || '',
    location: { type: 'Point', coordinates: [lng, lat] },
    startAt: now,
    endAt: now,
    photoCount: 0,
  });

  res.status(201).json({
    existed: false,
    moment: {
      id: String(moment._id),
      placeName: moment.placeName,
      countryCode: moment.countryCode,
      coordinates: [lng, lat],
    },
  });
});

router.get('/:id', async (req, res) => {
  const moment = await momentById(req.params.id);
  if (!moment) return res.status(404).json({ error: 'Moment not found' });
  res.json(moment);
});

export default router;
