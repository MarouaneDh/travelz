import { Photo } from '../models/Photo.js';
import { Moment } from '../models/Moment.js';

// Only public content is exposed to visitors in v2.
const publicScope = (ownerId) => ({ owner: ownerId, visibility: 'public' });

/** Feed (newest first) — lightweight cards. */
export async function feedFor(ownerId) {
  return Moment.find(publicScope(ownerId))
    .sort({ startAt: -1 })
    .populate('coverPhoto', 'thumbUrl url width height')
    .lean();
}

/** GeoJSON FeatureCollection for the map (clustered pins). */
export async function geojsonFor(ownerId) {
  const moments = await Moment.find({
    ...publicScope(ownerId),
    'location.coordinates.0': { $exists: true },
  })
    .populate('coverPhoto', 'thumbUrl')
    .lean();

  return {
    type: 'FeatureCollection',
    features: moments.map((m) => ({
      type: 'Feature',
      geometry: m.location,
      properties: {
        id: String(m._id),
        title: m.title || m.placeName,
        placeName: m.placeName,
        country: m.country,
        countryCode: m.countryCode,
        photoCount: m.photoCount,
        thumbUrl: m.coverPhoto?.thumbUrl || null,
      },
    })),
  };
}

/** Passport aggregate (country count + %-of-world). */
export async function passportFor(ownerId) {
  const rows = await Moment.aggregate([
    { $match: { owner: ownerId, visibility: 'public', countryCode: { $ne: '' } } },
    {
      $group: {
        _id: '$countryCode',
        country: { $first: '$country' },
        moments: { $sum: 1 },
      },
    },
    { $sort: { country: 1 } },
  ]);

  const WORLD_COUNTRIES = 195;
  return {
    countryCount: rows.length,
    percentOfWorld: Math.round((rows.length / WORLD_COUNTRIES) * 1000) / 10,
    countries: rows.map((r) => ({ code: r._id, country: r.country, moments: r.moments })),
  };
}

/** Full moment with photos + owner identity (public only). */
export async function momentById(id) {
  const moment = await Moment.findOne({ _id: id, visibility: 'public' })
    .populate('coverPhoto', 'thumbUrl url')
    .populate('owner', 'username displayName role')
    .lean();
  if (!moment) return null;

  const photos = await Photo.find({ moment: moment._id, visibility: 'public' })
    .sort({ takenAt: 1 })
    .select('url thumbUrl width height caption takenAt')
    .lean();

  return { ...moment, photos };
}
