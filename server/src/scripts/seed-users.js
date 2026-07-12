/**
 * Seed demo travelers — creates a few registered users, each with their own
 * placed moments, so the network has people worth following. Idempotent:
 * re-running skips users that already exist. Run with:  npm run seed:users
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../db.js';
import { User } from '../models/User.js';
import { Photo } from '../models/Photo.js';
import { Moment } from '../models/Moment.js';
import { ensureUploadDir, processImage } from '../services/images.js';
import { reverseGeocode } from '../services/geocode.js';

const PHOTO_DIR = path.resolve('..', 'Photos partagées avec Mimi');
const PASSWORD = 'travelpass'; // demo password for every seeded traveler

const TRAVELERS = [
  {
    username: 'lea',
    displayName: 'Léa',
    bio: 'Chasing markets, museums and good coffee across Europe.',
    trips: [
      { name: 'Barcelona', lat: 41.3874, lng: 2.1686, date: '2024-05-10' },
      { name: 'Amsterdam', lat: 52.3676, lng: 4.9041, date: '2024-08-22' },
    ],
  },
  {
    username: 'theo',
    displayName: 'Théo',
    bio: 'Big cities, street food, and long walks.',
    trips: [
      { name: 'New York', lat: 40.7128, lng: -74.006, date: '2024-04-03' },
      { name: 'Mexico City', lat: 19.4326, lng: -99.1332, date: '2024-11-15' },
    ],
  },
  {
    username: 'yuki',
    displayName: 'Yuki',
    bio: 'Temples, night markets and mountain trails in Asia.',
    trips: [
      { name: 'Bangkok', lat: 13.7563, lng: 100.5018, date: '2025-01-18' },
      { name: 'Seoul', lat: 37.5665, lng: 126.978, date: '2025-03-27' },
    ],
  },
];

const jitter = (v) => v + (Math.floor((Math.abs(v) * 1e6) % 100) / 100 - 0.5) * 0.02;

async function run() {
  await ensureUploadDir();
  await connectDB(process.env.MONGODB_URI);

  const files = fs
    .readdirSync(PHOTO_DIR)
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort();
  let fileCursor = 0;
  const nextFile = () => files[fileCursor++ % files.length];

  for (const t of TRAVELERS) {
    let user = await User.findOne({ username: t.username });
    if (!user) {
      user = await User.create({
        username: t.username,
        email: `${t.username}@travelz.demo`,
        passwordHash: await bcrypt.hash(PASSWORD, 10),
        displayName: t.displayName,
        bio: t.bio,
        role: 'traveler',
      });
      console.log(`👤 Created @${user.username} (${t.displayName})`);
    } else {
      console.log(`↩︎  @${t.username} already exists — skipping create`);
    }

    // Give them their trips (skip trips they already have).
    for (const trip of t.trips) {
      const exists = await Moment.findOne({ owner: user._id, city: new RegExp(trip.name, 'i') });
      if (exists) continue;

      const geo = await reverseGeocode(trip.lat, trip.lng);
      const baseDate = new Date(trip.date);
      const moment = await Moment.create({
        owner: user._id,
        placeName: geo?.placeName || trip.name,
        city: geo?.city || trip.name,
        country: geo?.country || '',
        countryCode: geo?.countryCode || '',
        location: { type: 'Point', coordinates: [trip.lng, trip.lat] },
        startAt: baseDate,
        endAt: baseDate,
      });

      let cover = null;
      const shots = 3;
      for (let i = 0; i < shots; i++) {
        const buf = fs.readFileSync(path.join(PHOTO_DIR, nextFile()));
        const img = await processImage(buf);
        const photo = await Photo.create({
          ...img,
          owner: user._id,
          takenAt: new Date(baseDate.getTime() + i * 3600 * 1000),
          location: { type: 'Point', coordinates: [jitter(trip.lng), jitter(trip.lat)] },
          moment: moment._id,
        });
        if (!cover) cover = photo._id;
      }
      moment.coverPhoto = cover;
      moment.photoCount = shots;
      await moment.save();
      console.log(`   📍 ${moment.placeName} (${moment.countryCode}) — ${shots} photos`);
    }
  }

  console.log('\n✅ Demo travelers ready. Password for all: ' + PASSWORD);
  console.log('   Handles: ' + TRAVELERS.map((t) => '@' + t.username).join(', '));
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
