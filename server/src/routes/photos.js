import { Router } from 'express';
import { Photo } from '../models/Photo.js';
import { requireAuth } from '../middleware/auth.js';
import { attachPhotoToMoment } from '../services/attach.js';

const router = Router();

/**
 * GET /api/photos/unplaced
 * The current user's photos that had no GPS EXIF and await placement.
 */
router.get('/unplaced', requireAuth, async (req, res) => {
  const photos = await Photo.find({ owner: req.user.sub, needsPlacement: true })
    .sort({ takenAt: 1, createdAt: 1 })
    .select('url thumbUrl takenAt')
    .lean();
  res.json(photos);
});

/**
 * POST /api/photos/:id/place  { lat, lng }   (curator only)
 * Manually place a GPS-less photo — runs the same geocode + grouping pipeline
 * as an EXIF-tagged upload, then attaches it to the matching/new moment.
 */
router.post('/:id/place', requireAuth, async (req, res) => {
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

  const photo = await Photo.findOne({ _id: req.params.id, owner: req.user.sub });
  if (!photo) return res.status(404).json({ error: 'Photo not found' });
  if (!photo.needsPlacement) {
    return res.status(409).json({ error: 'Photo is already placed' });
  }

  const moment = await attachPhotoToMoment(photo, { lat, lng });

  res.json({
    photoId: String(photo._id),
    moment: {
      id: String(moment._id),
      placeName: moment.placeName,
      countryCode: moment.countryCode,
      photoCount: moment.photoCount,
    },
  });
});

export default router;
