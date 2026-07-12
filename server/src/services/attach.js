import { Photo } from '../models/Photo.js';
import { Moment } from '../models/Moment.js';
import { reverseGeocode } from './geocode.js';
import { findMatchingMoment } from './grouping.js';

/**
 * Attach a photo to the right moment for a given location — creating a new
 * moment (reverse-geocoded) if none nearby matches. Shared by the upload
 * pipeline and the manual "place a GPS-less photo" flow so both behave identically.
 *
 * Mutates & saves the photo (location, moment, needsPlacement) and returns the moment.
 */
export async function attachPhotoToMoment(photo, { lat, lng, takenAt }) {
  const when = takenAt ? new Date(takenAt) : photo.takenAt || new Date();

  let moment = await findMatchingMoment({ lat, lng, takenAt: when });

  if (!moment) {
    const geo = await reverseGeocode(lat, lng);
    moment = await Moment.create({
      placeName: geo?.placeName || 'Unknown place',
      city: geo?.city || '',
      country: geo?.country || '',
      countryCode: geo?.countryCode || '',
      location: { type: 'Point', coordinates: [lng, lat] },
      coverPhoto: photo._id,
      startAt: when,
      endAt: when,
    });
  }

  photo.location = { type: 'Point', coordinates: [lng, lat] };
  photo.moment = moment._id;
  photo.needsPlacement = false;
  await photo.save();

  moment.photoCount = await Photo.countDocuments({ moment: moment._id });
  if (when < moment.startAt) moment.startAt = when;
  if (when > (moment.endAt || moment.startAt)) moment.endAt = when;
  if (!moment.coverPhoto) moment.coverPhoto = photo._id;
  await moment.save();

  return moment;
}
