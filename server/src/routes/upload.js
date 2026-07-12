import { Router } from 'express';
import multer from 'multer';
import { Photo } from '../models/Photo.js';
import { requireCurator } from '../middleware/auth.js';
import { extractExif } from '../services/exif.js';
import { processImage } from '../services/images.js';
import { attachPhotoToMoment } from '../services/attach.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 50 },
});

/**
 * POST /api/upload  (curator only)
 * "Drop & Done": accept a batch of photos, run each through the pipeline
 * (EXIF → strip metadata → thumbnail → reverse geocode → group into a moment).
 * Returns the affected moments so the client can refresh the map.
 */
router.post('/', requireCurator, upload.array('photos', 50), async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ error: 'No photos uploaded' });
  }

  const touchedMomentIds = new Set();
  const created = [];

  for (const file of req.files) {
    try {
      const { lat, lng, takenAt } = await extractExif(file.buffer);
      const img = await processImage(file.buffer); // strips EXIF for privacy

      const hasGps = typeof lat === 'number' && typeof lng === 'number';
      const when = takenAt ? new Date(takenAt) : new Date();

      const photo = await Photo.create({
        ...img,
        takenAt: when,
        location: hasGps ? { type: 'Point', coordinates: [lng, lat] } : undefined,
        needsPlacement: !hasGps,
      });

      if (hasGps) {
        const moment = await attachPhotoToMoment(photo, { lat, lng, takenAt: when });
        touchedMomentIds.add(String(moment._id));
      }

      created.push({ photoId: photo._id, placed: hasGps });
    } catch (err) {
      console.error('Failed to process a photo:', err);
      created.push({ error: err.message });
    }
  }

  res.json({
    uploaded: created.length,
    placed: created.filter((c) => c.placed).length,
    needsPlacement: created.filter((c) => c.placed === false).length,
    moments: [...touchedMomentIds],
  });
});

export default router;
