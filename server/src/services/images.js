import sharp from 'sharp';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.resolve('uploads');

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * Process an uploaded image buffer:
 * - strips ALL metadata (privacy: EXIF GPS could leak home addresses)
 * - writes a web-friendly full image + a small thumbnail
 * Returns served paths + dimensions.
 */
export async function processImage(buffer) {
  const id = randomUUID();
  const fullName = `${id}.webp`;
  const thumbName = `${id}_thumb.webp`;

  const base = sharp(buffer).rotate(); // respect orientation, then drop metadata
  const meta = await base.metadata();

  await base
    .clone()
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(UPLOAD_DIR, fullName));

  await base
    .clone()
    .resize({ width: 400, height: 400, fit: 'cover' })
    .webp({ quality: 78 })
    .toFile(path.join(UPLOAD_DIR, thumbName));

  return {
    url: `/uploads/${fullName}`,
    thumbUrl: `/uploads/${thumbName}`,
    width: meta.width || null,
    height: meta.height || null,
  };
}
