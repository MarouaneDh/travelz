import mongoose from 'mongoose';

/**
 * Processed image bytes stored in MongoDB so every environment (local + Render)
 * reads the same files from the shared database. Each upload creates two: a
 * full-size and a thumbnail webp. Served via GET /api/images/:id.
 */
const imageSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, default: 'image/webp' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Image = mongoose.model('Image', imageSchema);
