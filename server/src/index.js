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

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') || '*',
  })
);
app.use(express.json());

// Serve processed images.
app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feed', feedRoutes);
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
