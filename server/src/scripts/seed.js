/**
 * Seed script — demo data for Travelz "Your Living Map".
 *
 * The real photos in ../Photos partagées avec Mimi have had their GPS stripped
 * (iOS removes location when sharing), so this assigns them to real-world
 * destinations and runs them through the SAME geocode + grouping pipeline the
 * upload route uses. Run with:  npm run seed
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../db.js';
import { Photo } from '../models/Photo.js';
import { Moment } from '../models/Moment.js';
import { ensureUploadDir, processImage } from '../services/images.js';
import { reverseGeocode } from '../services/geocode.js';
import { ensureCurator } from '../services/bootstrap.js';

const PHOTO_DIR = path.resolve('..', 'Photos partagées avec Mimi');

// Real destinations; photos get distributed across them into moments.
const DESTINATIONS = [
  { name: 'Marrakech', lat: 31.6295, lng: -7.9811, date: '2024-03-14' },
  { name: 'Chefchaouen', lat: 35.1688, lng: -5.2636, date: '2024-03-20' },
  { name: 'Lisbon', lat: 38.7223, lng: -9.1393, date: '2024-06-08' },
  { name: 'Rome', lat: 41.8902, lng: 12.4922, date: '2024-09-02' },
  { name: 'Kyoto', lat: 35.0116, lng: 135.7681, date: '2025-04-05' },
  { name: 'Reykjavík', lat: 64.1466, lng: -21.9426, date: '2025-11-19' },
];

const jitter = (v) => v + (Math.floor((Math.abs(v) * 1e6) % 100) / 100 - 0.5) * 0.02;

async function run() {
  await ensureUploadDir();
  await connectDB(process.env.MONGODB_URI);
  const curator = await ensureCurator();

  await Photo.deleteMany({ owner: curator._id });
  await Moment.deleteMany({ owner: curator._id });
  console.log("🧹 Cleared curator's existing photos & moments");

  const files = fs
    .readdirSync(PHOTO_DIR)
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort();

  if (!files.length) {
    console.error('No photos found in', PHOTO_DIR);
    process.exit(1);
  }

  // Round-robin the photos across destinations.
  const buckets = DESTINATIONS.map(() => []);
  files.forEach((f, i) => buckets[i % DESTINATIONS.length].push(f));

  for (let d = 0; d < DESTINATIONS.length; d++) {
    const dest = DESTINATIONS[d];
    const geo = await reverseGeocode(dest.lat, dest.lng);
    const baseDate = new Date(dest.date);

    const moment = await Moment.create({
      owner: curator._id,
      placeName: geo?.placeName || dest.name,
      city: geo?.city || dest.name,
      country: geo?.country || '',
      countryCode: geo?.countryCode || '',
      location: { type: 'Point', coordinates: [dest.lng, dest.lat] },
      startAt: baseDate,
      endAt: baseDate,
    });

    let cover = null;
    for (let i = 0; i < buckets[d].length; i++) {
      const buf = fs.readFileSync(path.join(PHOTO_DIR, buckets[d][i]));
      const img = await processImage(buf);
      const takenAt = new Date(baseDate.getTime() + i * 3600 * 1000);
      const photo = await Photo.create({
        ...img,
        owner: curator._id,
        takenAt,
        location: {
          type: 'Point',
          coordinates: [jitter(dest.lng), jitter(dest.lat)],
        },
        moment: moment._id,
      });
      if (!cover) cover = photo._id;
      if (takenAt > moment.endAt) moment.endAt = takenAt;
    }

    moment.coverPhoto = cover;
    moment.photoCount = buckets[d].length;
    await moment.save();
    console.log(
      `📍 ${moment.placeName} (${moment.countryCode}) — ${buckets[d].length} photos`
    );
  }

  console.log('✅ Seed complete');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
