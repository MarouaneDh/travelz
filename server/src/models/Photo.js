import mongoose from 'mongoose';

/**
 * A single photo in the pool. The photo pool is the spine of the whole app —
 * the map, gallery, feed and passport are all just different queries over this.
 */
const photoSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    url: { type: String, required: true }, // full-size served path
    thumbUrl: { type: String, required: true }, // small thumbnail served path
    width: Number,
    height: Number,

    // GeoJSON point [lng, lat] — indexed for geospatial map queries.
    // Omitted entirely when the photo had no GPS EXIF (avoids a half-formed
    // {type:'Point'} that the 2dsphere index rejects).
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: { type: [Number] }, // [lng, lat]
      _id: false,
    },

    takenAt: { type: Date }, // from EXIF DateTimeOriginal, falls back to upload time
    caption: { type: String, default: '' },

    // Visibility is a first-class field from day one (v2 social layer depends on it).
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },

    needsPlacement: { type: Boolean, default: false }, // no GPS → "Where was this?" bucket

    moment: { type: mongoose.Schema.Types.ObjectId, ref: 'Moment' },
  },
  { timestamps: true }
);

photoSchema.index({ location: '2dsphere' }, { sparse: true });

export const Photo = mongoose.model('Photo', photoSchema);
