import 'dotenv/config';
import 'express-async-errors'; // routes async route rejections to the error handler
import express from 'express';
import cors from 'cors';
import path from 'path';

import { connectDB } from './db.js';
import { ensureUploadDir } from './services/images.js';
import { ensureCurator } from './services/bootstrap.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import momentRoutes from './routes/moments.js';
import reactionRoutes from './routes/reactions.js';
import photoRoutes from './routes/photos.js';
import userRoutes from './routes/users.js';
import feedRoutes from './routes/feed.js';
import exploreRoutes from './routes/explore.js';
import imageRoutes from './routes/images.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Allowed browser origins. Known frontends are baked in as defaults; extra
// origins can be added via a comma-separated CLIENT_ORIGIN env var. Trailing
// slashes are tolerated (browsers send the Origin header without one).
const DEFAULT_ORIGINS = [
  'http://localhost:5173', // local dev
  'https://we-travelz.netlify.app', // deployed frontend (Netlify)
];
const allowedOrigins = [
  ...new Set(
    [...DEFAULT_ORIGINS, ...(process.env.CLIENT_ORIGIN || '').split(',')]
      .map((s) => s.trim().replace(/\/$/, ''))
      .filter(Boolean)
  ),
];

app.use(
  cors({
    origin(origin, cb) {
      // Non-browser requests (curl, health checks) have no Origin header.
      if (!origin) return cb(null, true);
      // No allowlist configured → allow everything (reflects the origin).
      if (allowedOrigins.length === 0) return cb(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalized)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);
app.use(express.json());

console.log(
  allowedOrigins.length
    ? `🔒 CORS restricted to: ${allowedOrigins.join(', ')}`
    : '🌐 CORS: all origins allowed (set CLIENT_ORIGIN to lock this down)'
);

// Serve processed images.
app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/moments', reactionRoutes); // /:id/react
app.use('/api/moments', momentRoutes);

// Fallback error handler.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

async function start() {
  try {
    await ensureUploadDir();
    await connectDB(process.env.MONGODB_URI);
    await ensureCurator();
    app.listen(PORT, () => console.log(`🚀 API on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
