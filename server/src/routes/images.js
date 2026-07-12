import { Router } from 'express';
import mongoose from 'mongoose';
import { Image } from '../models/Image.js';

const router = Router();

/** GET /api/images/:id — serve an image's bytes from MongoDB. */
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).end();

  const img = await Image.findById(req.params.id);
  if (!img) return res.status(404).end();

  res.set('Content-Type', img.contentType || 'image/webp');
  // Image bytes for a given id never change → cache hard.
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(img.data);
});

export default router;
