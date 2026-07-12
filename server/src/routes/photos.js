import { Router } from 'express';
import { Photo } from '../models/Photo.js';
import { requireCurator } from '../middleware/auth.js';
import { attachPhotoToMoment } from '../services/attach.js';

const router = Router();

/**
 * GET /api/photos/unplaced  (curator only)
 * Photos that had no GPS EXIF and are waiting to be placed on the map.
 */
router.get('/unplaced', requireCurator, async (req, res) => {
  const photos = await Photo.find({ needsPlacement: true })
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
router.post('/:id/place', requireCurator, async (req, res) => {
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

  const photo = await Photo.findById(req.params.id);
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
