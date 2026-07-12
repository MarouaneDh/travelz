import mongoose from 'mongoose';

/**
 * A one-way follow edge (Instagram-style): `follower` follows `following`.
 * No mutual approval required.
 */
const followSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// One edge per (follower, following) pair; also the query index for both directions.
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1 });

export const Follow = mongoose.model('Follow', followSchema);
