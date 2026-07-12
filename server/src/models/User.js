import mongoose from 'mongoose';

/**
 * A user of the network. v2 introduces two roles:
 *  - 'curator'  → the owner/brand (special; there is one, seeded from .env)
 *  - 'traveler' → registered users with their own profile + map
 * Logged-out visitors ("lurkers") have no User doc.
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
      match: /^[a-z0-9_]+$/, // url-safe handle
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    displayName: { type: String, default: '', maxlength: 60 },
    bio: { type: String, default: '', maxlength: 280 },

    role: { type: String, enum: ['curator', 'traveler'], default: 'traveler' },
  },
  { timestamps: true }
);

// Public shape (never leak the password hash).
userSchema.methods.toPublic = function () {
  return {
    id: String(this._id),
    username: this.username,
    displayName: this.displayName || this.username,
    bio: this.bio,
    role: this.role,
    joinedAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
