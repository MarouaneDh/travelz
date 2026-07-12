import mongoose from 'mongoose';

/**
 * A "moment" is a cluster of photos taken around the same place & time.
 * It's the unit that shows up as a pin on the map and a card in the feed.
 * Auto-created from EXIF; the curator can optionally add a title + paragraph.
 */
const momentSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' }, // optional garnish
    body: { type: String, default: '' }, // optional short paragraph

    placeName: { type: String, default: '' }, // e.g. "Kyoto, Japan"
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    countryCode: { type: String, default: '' }, // ISO alpha-2, for flags/passport

    // Representative point for the pin [lng, lat]
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: { type: [Number] },
      _id: false,
    },

    coverPhoto: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo' },
    photoCount: { type: Number, default: 0 },

    startAt: { type: Date },
    endAt: { type: Date },

    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },

    reactions: {
      type: Map,
      of: Number,
      default: {}, // e.g. { "😍": 12, "🤤": 3 }
    },
  },
  { timestamps: true }
);

momentSchema.index({ location: '2dsphere' }, { sparse: true });
momentSchema.index({ startAt: -1 });

export const Moment = mongoose.model('Moment', momentSchema);
