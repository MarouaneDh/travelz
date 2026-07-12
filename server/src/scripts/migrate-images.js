/**
 * One-time migration: move images that live on local disk (/uploads/*.webp)
 * into MongoDB, and repoint each Photo's url/thumbUrl at /api/images/:id so they
 * load in every environment. Photos whose local file is missing (e.g. uploaded
 * on Render, whose disk is ephemeral) are left as-is and reported.
 *
 * Run with:  npm run migrate:images
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../db.js';
import { Photo } from '../models/Photo.js';
import { Image } from '../models/Image.js';

const UPLOAD_DIR = path.resolve('uploads');

// Move one served /uploads path into the DB; returns the new /api/images path,
// the same path if already migrated/external, or null if the file is missing.
async function toDbUrl(servedPath, owner) {
  if (!servedPath || !servedPath.startsWith('/uploads/')) return servedPath;
  const file = path.join(UPLOAD_DIR, servedPath.split('/').pop());
  if (!fs.existsSync(file)) return null;
  const img = await Image.create({
    data: fs.readFileSync(file),
    contentType: 'image/webp',
    owner,
  });
  return `/api/images/${img._id}`;
}

async function run() {
  await connectDB(process.env.MONGODB_URI);

  const photos = await Photo.find({
    $or: [{ url: /^\/uploads\// }, { thumbUrl: /^\/uploads\// }],
  });

  let migrated = 0;
  let skipped = 0;
  for (const p of photos) {
    const url = await toDbUrl(p.url, p.owner);
    const thumbUrl = await toDbUrl(p.thumbUrl, p.owner);
    if (url === null || thumbUrl === null) {
      skipped++;
      console.warn(`   ⚠️  missing local file for photo ${p._id} — left unchanged`);
      continue;
    }
    p.url = url;
    p.thumbUrl = thumbUrl;
    await p.save();
    migrated++;
  }

  console.log(`\n✅ Migrated ${migrated} photos into the database.`);
  if (skipped) console.log(`   ${skipped} skipped (local file missing — re-upload those).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
