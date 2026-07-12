import sharp from 'sharp';
import { Image } from '../models/Image.js';

// Kept for backward-compat with callers; images now live in MongoDB, not on disk.
export async function ensureUploadDir() {
  /* no-op — images are stored in the database */
}

/**
 * Process an uploaded image buffer:
 * - strips ALL metadata (privacy: EXIF GPS could leak home addresses)
 * - produces a web-friendly full image + a thumbnail (both webp, in memory)
 * - stores both in MongoDB so every environment serves the same bytes
 * Returns served API paths + dimensions.
 */
export async function processImage(buffer, owner) {
  const base = sharp(buffer).rotate(); // respect orientation, then drop metadata
  const meta = await base.metadata();

  const [fullBuf, thumbBuf] = await Promise.all([
    base
      .clone()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer(),
    base.clone().resize({ width: 400, height: 400, fit: 'cover' }).webp({ quality: 78 }).toBuffer(),
  ]);

  const [full, thumb] = await Promise.all([
    Image.create({ data: fullBuf, contentType: 'image/webp', owner }),
    Image.create({ data: thumbBuf, contentType: 'image/webp', owner }),
  ]);

  return {
    url: `/api/images/${full._id}`,
    thumbUrl: `/api/images/${thumb._id}`,
    width: meta.width || null,
    height: meta.height || null,
  };
}
